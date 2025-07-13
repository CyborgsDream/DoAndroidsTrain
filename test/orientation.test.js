const assert = require('assert');

function setupDom() {
  global.window = {
    innerWidth: 800,
    innerHeight: 600,
    orientation: 0,
    location: { search: '' },
    listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    dispatchEvent(evt) { if (this.listeners[evt.type]) this.listeners[evt.type](evt); }
  };
  global.screen = { orientation: { angle: 0 } };
  global.document = {
    elements: {},
    getElementById(id) {
      if (!this.elements[id]) {
        this.elements[id] = { innerHTML: '', addEventListener() {}, appendChild() {} };
      }
      return this.elements[id];
    }
  };
  global.requestAnimationFrame = () => {};
}

function setupThree() {
  const THREE = {};
  THREE.MathUtils = {
    degToRad: (d) => d * Math.PI / 180,
    radToDeg: (r) => r * 180 / Math.PI,
  };
  class Vector3 {
    constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; }
    set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; }
  }
  THREE.Vector3 = Vector3;

  class Euler {
    constructor(x=0,y=0,z=0,order='XYZ'){ this.x=x; this.y=y; this.z=z; this.order=order; }
    set(x,y,z,order){ this.x=x; this.y=y; this.z=z; this.order=order||this.order; return this; }
    setFromQuaternion(q, order='XYZ') {
      // simplified for 'YXZ'
      const clamp = (v,min,max)=>Math.min(Math.max(v,min),max);
      const m31 = 2 * (q.x * q.y + q.z * q.w);
      const m21 = 2 * (q.x * q.z + q.y * q.w);
      const m22 = 1 - 2 * (q.y * q.y + q.z * q.z);
      const m11 = 2 * (q.x * q.w - q.y * q.z);
      const m12 = 1 - 2 * (q.x * q.x + q.z * q.z);
      this.x = Math.asin(clamp(m31, -1, 1));
      if (Math.abs(m31) < 0.9999999) {
        this.y = Math.atan2(-m21, m22);
        this.z = Math.atan2(-m11, m12);
      } else {
        this.y = Math.atan2(m12, m11);
        this.z = 0;
      }
      this.order = order;
      return this;
    }
  }
  THREE.Euler = Euler;

  class Quaternion {
    constructor(x=0,y=0,z=0,w=1){ this.x=x; this.y=y; this.z=z; this.w=w; }
    setFromEuler(e){
      const c1=Math.cos(e.y/2); const c2=Math.cos(e.x/2); const c3=Math.cos(e.z/2);
      const s1=Math.sin(e.y/2); const s2=Math.sin(e.x/2); const s3=Math.sin(e.z/2);
      // order 'YXZ'
      this.x = s2*c1*c3 + c2*s1*s3;
      this.y = c2*s1*c3 - s2*c1*s3;
      this.z = c2*c1*s3 - s2*s1*c3;
      this.w = c2*c1*c3 + s2*s1*s3;
      return this;
    }
    setFromAxisAngle(axis, angle){
      const half=angle/2; const s=Math.sin(half);
      this.x=axis.x*s; this.y=axis.y*s; this.z=axis.z*s; this.w=Math.cos(half);
      return this;
    }
    multiply(q){
      const ax=this.x, ay=this.y, az=this.z, aw=this.w;
      const bx=q.x, by=q.y, bz=q.z, bw=q.w;
      this.x=ax*bw+aw*bx+ay*bz-az*by;
      this.y=ay*bw+aw*by+az*bx-ax*bz;
      this.z=az*bw+aw*bz+ax*by-ay*bx;
      this.w=aw*bw-ax*bx-ay*by-az*bz;
      return this;
    }
    clone(){ return new Quaternion(this.x,this.y,this.z,this.w); }
    copy(q){ this.x=q.x; this.y=q.y; this.z=q.z; this.w=q.w; return this; }
    invert(){
      const l=this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w;
      this.x=-this.x/l; this.y=-this.y/l; this.z=-this.z/l; this.w=this.w/l;
      return this;
    }
  }
  THREE.Quaternion = Quaternion;

  class BufferGeometry { constructor(){ this.points=null; } setFromPoints(p){ this.points=p; } }
  class LineBasicMaterial {}
  class Line { constructor(g,m){ this.geometry=g; this.material=m; } }
  class Scene { add(){} }
  class PerspectiveCamera { constructor(){ this.rotation={order:'XYZ'}; this.position={}; this.quaternion=new Quaternion(); } updateProjectionMatrix(){} }
  class WebGLRenderer { constructor(){ this.domElement={}; } setSize(){} setClearColor(){} render(){} }
  class GridHelper { constructor(){ this.material={transparent:false,opacity:1}; this.position={}; this.rotation={}; } }
  class Group { constructor(){ this.children=[]; } add(o){ this.children.push(o); } }
  class BoxGeometry {}
  class MeshBasicMaterial {}
  class Mesh { constructor(g,m){ this.geometry=g; this.material=m; this.position={ set(x,y,z){ this.x=x; this.y=y; this.z=z; }, x:0, y:0, z:0 }; } }

  Object.assign(THREE, { BufferGeometry, LineBasicMaterial, Line, Scene, PerspectiveCamera,
    WebGLRenderer, GridHelper, Group, BoxGeometry, MeshBasicMaterial, Mesh });
  return THREE;
}

setupDom();
global.THREE = setupThree();

const orientation = require('../SCRIPTS/orientation.js');

// Export checks
assert.strictEqual(typeof orientation.calibrateGrid, 'function');
assert.strictEqual(typeof orientation.computeQuaternion, 'function');
assert.strictEqual(typeof orientation.updateEnergyTrail, 'function');

// computeQuaternion check
const q = orientation.computeQuaternion(0, 0, 0, 0);
const sq = Math.sqrt(0.5);
assert.ok(Math.abs(q.x + sq) < 1e-6 && Math.abs(q.w - sq) < 1e-6,
  'computeQuaternion should handle zero orientation');

// Mock orientation event
const handler = window.listeners['deviceorientation'];
orientation.trailGeometry.setFromPoints = function(points){ this.points = points; };
handler({ type: 'deviceorientation', alpha: 0, beta: 10, gamma: 20 });

const expectedQuat = orientation.computeQuaternion(0, 10, 20, 0);
const camEuler = new THREE.Euler().setFromQuaternion(expectedQuat, 'YXZ');
const expectedBeta = THREE.MathUtils.radToDeg(camEuler.x);
const expectedGamma = THREE.MathUtils.radToDeg(camEuler.z);
const pts = orientation.trailGeometry.points;
assert.ok(Array.isArray(pts) && pts.length === 21, 'energy trail should have 21 points');
assert.ok(Math.abs(pts[0].y - 5 * (expectedBeta / 90)) < 1e-6, 'first point y matches beta');
assert.ok(Math.abs(pts[0].x) < 1e-6, 'first point x should be 0');

assert.ok(Math.abs(pts[pts.length - 1].z + 5) < 1e-6, 'last point z should be -5');

console.log('All orientation tests passed.');

