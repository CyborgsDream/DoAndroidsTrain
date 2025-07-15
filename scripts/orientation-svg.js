// Orientation tracker using SVG

const TRON_COLOR = (() => {
  const fromGlobal = typeof window.TRON_COLOR !== 'undefined' ? window.TRON_COLOR : null;
  const param = new URLSearchParams(window.location.search).get('color');
  const input = param || fromGlobal;
  if (input) {
    const hex = input.toString().replace(/^#/, '').replace(/^0x/, '');
    return '#' + hex.padStart(6, '0');
  }
  return '#00ffff';
})();

let alpha = 0,
  beta = 0,
  gamma = 0;
let baseAlpha = 0,
  baseBeta = 0,
  baseGamma = 0;
let isCalibrated = false;

const container = document.getElementById('container');
const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('width', window.innerWidth);
svg.setAttribute('height', window.innerHeight);
container.appendChild(svg);

let cx = window.innerWidth / 2;
let cy = window.innerHeight / 2;
const r = Math.min(cx, cy) / 2;

function createLine() {
  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('stroke', TRON_COLOR);
  line.setAttribute('stroke-width', '2');
  svg.appendChild(line);
  return line;
}

const circle = document.createElementNS(svgNS, 'circle');
circle.setAttribute('cx', cx);
circle.setAttribute('cy', cy);
circle.setAttribute('r', r);
circle.setAttribute('stroke', TRON_COLOR);
circle.setAttribute('fill', 'none');
svg.appendChild(circle);

const alphaLine = createLine();
alphaLine.setAttribute('x1', cx);
alphaLine.setAttribute('y1', cy);
alphaLine.setAttribute('x2', cx);
alphaLine.setAttribute('y2', cy - r);

const betaLine = createLine();
betaLine.setAttribute('x1', cx - r);
betaLine.setAttribute('y1', cy);
betaLine.setAttribute('x2', cx + r);
betaLine.setAttribute('y2', cy);

const gammaLine = createLine();
gammaLine.setAttribute('x1', cx);
gammaLine.setAttribute('y1', cy - r);
gammaLine.setAttribute('x2', cx);
gammaLine.setAttribute('y2', cy + r);

function updateLines() {
  const a = alpha - baseAlpha;
  const b = beta - baseBeta;
  const g = gamma - baseGamma;

  alphaLine.setAttribute('transform', `rotate(${a} ${cx} ${cy})`);
  betaLine.setAttribute('transform', `rotate(${b} ${cx} ${cy})`);
  gammaLine.setAttribute('transform', `rotate(${g} ${cx} ${cy})`);

  document.getElementById('rotation-data').innerHTML =
    `KINETIC FEEDBACK:<br>α: ${a.toFixed(1)}°<br>β: ${b.toFixed(1)}°<br>γ: ${g.toFixed(1)}°<br>`;
}

window.addEventListener('deviceorientation', (event) => {
  alpha = event.alpha || 0;
  beta = event.beta || 0;
  gamma = event.gamma || 0;
  updateLines();
});

window.addEventListener('resize', () => {
  svg.setAttribute('width', window.innerWidth);
  svg.setAttribute('height', window.innerHeight);
  cx = window.innerWidth / 2;
  cy = window.innerHeight / 2;
  circle.setAttribute('cx', cx);
  circle.setAttribute('cy', cy);
  alphaLine.setAttribute('x1', cx);
  alphaLine.setAttribute('y1', cy);
  alphaLine.setAttribute('x2', cx);
  alphaLine.setAttribute('y2', cy - r);
  betaLine.setAttribute('x1', cx - r);
  betaLine.setAttribute('y1', cy);
  betaLine.setAttribute('x2', cx + r);
  betaLine.setAttribute('y2', cy);
  gammaLine.setAttribute('x1', cx);
  gammaLine.setAttribute('y1', cy - r);
  gammaLine.setAttribute('x2', cx);
  gammaLine.setAttribute('y2', cy + r);
  updateLines();
});

function calibrateGrid() {
  baseAlpha = alpha;
  baseBeta = beta;
  baseGamma = gamma;
  isCalibrated = true;
  document.getElementById('rotation-data').innerHTML = 'GRID SYNCHRONIZED.';
}

document.getElementById('calibrate-btn').addEventListener('click', calibrateGrid);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calibrateGrid,
    updateLines,
  };
}
