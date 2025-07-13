// Orientation tracker script

// ====== INITIALIZATION ====== //
const scene = new THREE.Scene();
// No fog in this version
// scene.fog = new THREE.FogExp2(0x000000, 0.05);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// use a fixed clear color as we are not using fog
renderer.setClearColor(0x000000);
document.getElementById('container').appendChild(renderer.domElement);

// Allow color customization via window.TRON_COLOR or ?color=00ff00
const TRON_COLOR = (() => {
  const fromGlobal = typeof window.TRON_COLOR !== 'undefined' ? window.TRON_COLOR : null;
  const param = new URLSearchParams(window.location.search).get('color');
  const input = param || fromGlobal;
  if (input) {
    const hex = input.toString().replace(/^#/, '').replace(/^0x/, '');
    const val = parseInt(hex, 16);
    if (!Number.isNaN(val)) {
      return val;
    }
  }
  return 0x00ffff;
})();

// ====== TRON-STYLE GRID ====== //
const gridSize = 20;
const gridHelper = new THREE.GridHelper(
  gridSize,
  gridSize * 2,
  TRON_COLOR,
  TRON_COLOR
);
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.8;
// gridHelper.material.fog = true; // not used without fog
gridHelper.position.y = -2;
scene.add(gridHelper);

// Additional grid rotated vertically for better spatial reference
const verticalGridHelper = new THREE.GridHelper(
  gridSize,
  gridSize * 2,
  TRON_COLOR,
  TRON_COLOR
);
verticalGridHelper.material.transparent = true;
verticalGridHelper.material.opacity = 0.4;
// verticalGridHelper.material.fog = true;
// Rotate around the X axis so the grid stands upright
verticalGridHelper.rotation.x = Math.PI / 2;
scene.add(verticalGridHelper);

// Sky grid to mirror the ground plane
const skyGridHelper = new THREE.GridHelper(
  gridSize,
  gridSize * 2,
  TRON_COLOR,
  TRON_COLOR
);
skyGridHelper.material.transparent = true;
// stronger line visibility for the sky grid
skyGridHelper.material.opacity = 0.8;
// skyGridHelper.material.fog = true; // not used
skyGridHelper.position.y = 2;
scene.add(skyGridHelper);

// ====== REFERENCE CUBES ====== //
// Add cubes stretching into the distance
const cubeGroup = new THREE.Group();
for (let i = 0; i < 20; i++) {
  const geom = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({ color: TRON_COLOR, wireframe: true });
  const cube = new THREE.Mesh(geom, mat);
  cube.position.set(0, 0.5, -i * 2);
  cubeGroup.add(cube);
}
scene.add(cubeGroup);

// ====== ENERGY TRAIL ====== //
const trailGeometry = new THREE.BufferGeometry();
const trailMaterial = new THREE.LineBasicMaterial({ color: TRON_COLOR, linewidth: 2 });
const trail = new THREE.Line(trailGeometry, trailMaterial);
scene.add(trail);

// ====== SENSOR DATA ====== //
let alpha = 0,
  beta = 0,
  gamma = 0;
let isCalibrated = false;
let screenOrientation = window.orientation || (screen.orientation && screen.orientation.angle) || 0;
const zee = new THREE.Vector3(0, 0, 1);
const euler = new THREE.Euler();
const q0 = new THREE.Quaternion();
const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
let calibrationQuaternion = new THREE.Quaternion();

// ====== PERMISSION HANDLER ====== //
async function requestMotionPermission() {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      return response === 'granted';
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return true;
}

// ====== DEVICE ORIENTATION HANDLER ====== //
function computeQuaternion(a, b, g, orient) {
  euler.set(
    THREE.MathUtils.degToRad(b),
    THREE.MathUtils.degToRad(a),
    THREE.MathUtils.degToRad(-g),
    'YXZ'
  );
  const quaternion = new THREE.Quaternion();
  // device orientation
  quaternion.setFromEuler(euler);
  // adjust for camera facing
  quaternion.multiply(q1);
  quaternion.multiply(q0.setFromAxisAngle(zee, -THREE.MathUtils.degToRad(orient)));
  return quaternion;
}

window.addEventListener('deviceorientation', (event) => {
  alpha = event.alpha || 0; // Z-axis (compass)
  beta = event.beta || 0; // X-axis (front-back tilt)
  gamma = event.gamma || 0; // Y-axis (left-right tilt)

  const quat = computeQuaternion(alpha, beta, gamma, screenOrientation);

  if (!isCalibrated) {
    camera.quaternion.copy(quat);
  } else {
    const adjustedQuat = calibrationQuaternion.clone().invert().multiply(quat);
    camera.quaternion.copy(adjustedQuat);
  }

  const camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  document.getElementById('rotation-data').innerHTML = `KINETIC FEEDBACK:<br>α: ${THREE.MathUtils.radToDeg(camEuler.y).toFixed(1)}°<br>β: ${THREE.MathUtils.radToDeg(camEuler.x).toFixed(1)}°<br>γ: ${THREE.MathUtils.radToDeg(camEuler.z).toFixed(1)}°<br>`;

  // Update energy trail (simulated)
  updateEnergyTrail(
    THREE.MathUtils.radToDeg(camEuler.x),
    THREE.MathUtils.radToDeg(camEuler.z)
  );
});

window.addEventListener('orientationchange', () => {
  screenOrientation = window.orientation || (screen.orientation && screen.orientation.angle) || 0;
});

// ====== CALIBRATION BUTTON ====== //
async function calibrateGrid() {
  const granted = await requestMotionPermission();
  if (granted) {
    calibrationQuaternion.copy(
      computeQuaternion(alpha, beta, gamma, screenOrientation)
    );
    isCalibrated = true;
    document.getElementById('rotation-data').innerHTML = 'GRID SYNCHRONIZED.';
  } else {
    document.getElementById('rotation-data').innerHTML = 'MOTION PERMISSION DENIED.';
  }
}

document.getElementById('calibrate-btn').addEventListener('click', calibrateGrid);

// ====== ENERGY TRAIL ANIMATION ====== //
function updateEnergyTrail(beta, gamma) {
  const points = [];
  const segments = 20;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = Math.sin(t * Math.PI * 2) * 5 * (gamma / 90);
    const y = Math.cos(t * Math.PI * 2) * 5 * (beta / 90);
    const z = -t * 5;
    points.push(new THREE.Vector3(x, y, z));
  }

  trailGeometry.setFromPoints(points);
}

// ====== CAMERA POSITION ====== //
camera.position.z = 10;

// ====== RENDER LOOP ====== //
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ====== RESPONSIVE DESIGN ====== //
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
