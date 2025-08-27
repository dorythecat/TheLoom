import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'

// Settings
const MIN_NODE_DISTANCE = 3;
const MAX_NODE_DISTANCE = 5;

const START_PRICE = 10;
const MAX_PRICE = 100000;

const NODE_CONNECTIONS = { // List of possible node connections
    "Nexus": ["Life", "Knowledge", "Power"],

    // From Nexus
    "Life": ["Nature", "Memory", "Growth"],
    "Knowledge": ["Wisdom", "Memory", "Learning"],
    "Power": ["Strength", "Energy", "Force"],

    // From Life
    "Nature": ["Forest", "Mountain", "Fire"],
    "Memory": ["History", "Dreams", "Sadness"], // Also from Knowledge
    "Growth": ["Evolution", "Change", "Time"],

    // From Knowledge
    "Wisdom": ["Philosophy", "Insight", "Truth"],
    "Learning": ["Education", "Curiosity", "Discovery"],

    // From Power
    "Strength": ["Courage", "Endurance", "Force"],
    "Energy": ["Light", "Electricity", "Heat"],
    "Force": ["Gravity", "Magnetism", "Abuse"],

    // From Nature
    "Forest": ["Animals", "Plants", "Fire"],
    "Mountain": ["Rocks", "Snow", "Ice", "River"],
    "River": ["Water", "Fish", "Flow"],
    "Fire": ["Heat", "Light", "Destruction"],

    // From Memory
    "History": ["Past", "Future", "Legacy"],
    "Dreams": ["Imagination", "Fantasy", "Hope"],
    "Sadness": ["Grief", "Loss", "Melancholy"],

    // From Growth
    "Evolution": ["Survival", "Adaptation"],
    "Change": ["Transformation"],
    "Time": ["Future", "Present", "Past"],

    // From Time
    "Future": ["Past", "Present"],
    "Present": ["Past", "Future"],
    "Past": ["Present", "Future"],

    // From Wisdom
    "Philosophy": ["Ethics", "Logic", "Reason"],
    "Insight": ["Understanding", "Clarity", "Awareness", "Wisdom"],
    "Truth": ["Reality", "Fact", "Honesty"],

    // From Learning
    "Education": ["Knowledge", "Skills"],
    "Curiosity": ["Exploration", "Inquiry", "Wonder"],
    "Discovery": ["Invention", "Innovation", "Breakthrough"],

    // From Strength
    "Courage": ["Bravery", "Valor", "Heroism"],
    "Endurance": ["Stamina", "Resilience", "Perseverance"],

    // From Energy
    "Light": ["Sun"],
    "Electricity": ["Current", "Voltage", "Circuit"],
    "Heat": ["Temperature", "Thermodynamics", "Warmth", "Light"],

    // From Force
    "Gravity": ["Mass", "Weight", "Orbit"],
    "Magnetism": ["Magnet", "Field"],
    "Momentum": ["Inertia", "Velocity", "Acceleration"],

    // From Forest
    "Animals": ["Mammals", "Birds", "Reptiles"],
    "Plants": ["Flowers", "Trees", "Fungi"],

    // From Plants
    "Flowers": ["Petals", "Pollen", "Fragrance"],
    "Trees": ["Branches", "Roots"],
    "Fungi": ["Mushrooms", "Spores", "Mycelium"],

    // From Tree
    "Branches": ["Twigs", "Bark", "Sap", "Leaves"],
    "Roots": ["Soil", "Nutrients", "Water"],

    // From Branches
    "Leaves": ["Photosynthesis", "Shade", "Decay"],
    "Bark": ["Protection", "Texture", "Growth Rings"],
    "Sap": ["Resin", "Maple Syrup", "Rubber"],

    // From Leaves
    "Photosynthesis": ["Oxygen", "Water", "Glucose", "Light"],
    "Shade": ["Coolness", "Shelter"],
    "Decay": ["Compost", "Nutrients", "Death"],

    // From Photosynthesis
    "Oxygen": ["Life"],
    "Glucose": ["Energy"],

    // From Shade
    "Shelter": ["Protection", "Safety"],
    "Coolness": ["Comfort", "Relief"],

    // From Decay
    "Compost": ["Fertilizer", "Soil"],
    "Nutrients": ["Growth", "Health"],
    "Death": ["Life"],

    // Miscellaneous connections
    "Water": ["Ice", "Coolness"]
}

const NODE_VERBS = { // List of possible node verbs
    "Nexus": ["", "", ""],

    // From Nexus
    "Life": ["is", "gives", "nurtures"],
    "Knowledge": ["evolves into", "is", "requires"],
    "Power": ["comes from", "is", "is given by"],

    // From Life
    "Nature": ["lives in", "lifts", "fuels"],
    "Memory": ["holds", "remembers", "is lost with"],
    "Growth": ["leads to", "is", "requires"],

    // From Knowledge
    "Wisdom": ["leads to", "is", "seeks"],
    "Learning": ["comes from", "requires", "leads to"],

    // From Power
    "Strength": ["comes from", "is", "is tested by"],
    "Energy": ["is", "is", "is"],
    "Force": ["is", "is", "can suffer"],

    // From Nature
    "Forest": ["contains", "is made of", "is burned by"],
    "Mountain": ["is made of", "is covered in", "is covered in", "is carved by"],
    "River": ["is", "is filled with", "is defined by"],
    "Fire": ["is", "gives", "brings"],

    // From Memory
    "History": ["is", "shapes", "is preserved by"],
    "Dreams": ["are fueled by", "inspire", "bring"],
    "Sadness": ["comes from", "is caused by", "is eased by"],

    // From Growth
    "Evolution": ["is driven by", "leads to"],
    "Change": ["is", "leads to"],
    "Time": ["is", "is", "is"],

    // From Time
    "Future": ["is shaped by", "comes after"],
    "Present": ["is shaped by", "comes before"],
    "Past": ["shapes", "shapes"],

    // From Wisdom
    "Philosophy": ["leads to", "uses", "values"],
    "Insight": ["brings", "gives", "is", "requires"],
    "Truth": ["is", "is", "requires"],

    // From Learning
    "Education": ["provides", "teaches"],
    "Curiosity": ["leads to", "fuels", "inspires"],
    "Discovery": ["leads to", "fuels", "brings"],

    // From Strength
    "Courage": ["is shown by", "is needed for", "is tested by"],
    "Endurance": ["is built by", "is needed for", "is tested by"],

    // From Energy
    "Light": ["comes from"],
    "Electricity": ["is", "is", "powers"],
    "Heat": ["is", "is", "gives", "gives"],

    // From Force
    "Gravity": ["requires", "gives", "defines"],
    "Magnetism": ["comes from", "is"],
    "Momentum": ["comes from", "is", "is"],

    // From Forest
    "Animals": ["are", "are", "are"],
    "Plants": ["are", "are", "are"],

    // From Plants
    "Flowers": ["have", "carry", "give"],
    "Trees": ["have", "have"],
    "Fungi": ["are", "release", "spread"],

    // From Tree
    "Branches": ["have", "have", "produce", "have"],
    "Roots": ["are in", "absorb", "draw"],

    // From Branches
    "Leaves": ["perform", "provide", "eventually"],
    "Bark": ["provides", "has", "shows"],
    "Sap": ["is", "is", "is"],

    // From Leaves
    "Photosynthesis": ["takes", "takes", "produces", "requires"],
    "Shade": ["provides", "offers"],
    "Decay": ["creates", "returns", "enriches", "is"],

    // From Photosynthesis
    "Oxygen": ["sustains"],
    "Glucose": ["provides"],

    // From Shade
    "Shelter": ["offers", "provides"],
    "Coolness": ["brings", "offers"],

    // From Decay
    "Compost": ["creates", "improves"],
    "Nutrients": ["support", "improve"],
    "Death": ["enables"],

    // Miscellaneous connections
    "Water": ["freezes into", "provides"]
}

let maxNodes= 0;
for (const key in NODE_CONNECTIONS) {
    maxNodes += NODE_CONNECTIONS[key].length;
}
maxNodes -= NODE_CONNECTIONS["Nexus"].length; // Nexus is not a node itself
maxNodes -= 3; // IDK where this comes from but this is what makes it work soooooo

let nodes = []; // [{ index, position, name, text, baseScale, isNexus }]
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 10;
controls.rollSpeed = Math.PI / 4;
controls.autoForward = false;
controls.dragToLook = true;

// Font / text
let font;
let textMeshes = [], spinningText = [];
const loader = new FontLoader();

// Shared materials / geometry
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const nodeGeometry = new THREE.SphereGeometry(0.5); // base radius; nexus scales to 2x

// Instanced mesh for all nodes
const nodeIMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, maxNodes);
nodeIMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
nodeIMesh.frustumCulled = false; // Prevent disappearing when too close
scene.add(nodeIMesh);

// Connections and line labels keyed by "i-j"
let nodeConnections = {};  // { index: Set<index> }
let lines = [];
let lineTexts = {};        // { "i-j": TextMesh }

function addText(text, position, size = 0.4, spinning = false) {
    if (!font) return;
    const textGeometry = new TextGeometry(text, { font, size, depth: 0.1, curveSegments: 2 });
    textGeometry.center();
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMeshes.push(textMesh);
    if (spinning) spinningText.push(textMesh);
    textMesh.position.copy(position);
    scene.add(textMesh);
    return textMesh;
}

function addLine(start, end) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([start.clone(), end.clone()]), lineMaterial);
    lines.push(line);
    scene.add(line);
    return line;
}

function ensureConn(i) {
    if (!nodeConnections[i]) nodeConnections[i] = new Set();
}

function connectNodes(i, j, text) {
    if (i === j) return;
    ensureConn(i); ensureConn(j);
    if (nodeConnections[i].has(j)) return;

    nodeConnections[i].add(j);
    nodeConnections[j].add(i);

    const mid = new THREE.Vector3().addVectors(nodes[i].position, nodes[j].position).multiplyScalar(0.5);
    const k = i < j ? `${i}-${j}` : `${j}-${i}`;
    lineTexts[k] = addText(text, new THREE.Vector3(mid.x, mid.y + 0.5, mid.z), 0.2);
}

function updateLines() {
    // Clear old
    for (let line of lines) {
        scene.remove(line);
        line.geometry.dispose();
        if (line.material.dispose) line.material.dispose();
    }
    lines = [];
    // Recreate current
    for (let i = 0; i < nodes.length; i++) {
        const conns = nodeConnections[i];
        if (!conns) continue;
        for (const j of conns) if (i < j) addLine(nodes[i].position, nodes[j].position);
    }
}

function updateLineTexts() {
    for (const k in lineTexts) {
        const [a, b] = k.split('-').map(Number);
        if (!nodes[a] || !nodes[b]) continue;
        const mid = new THREE.Vector3().addVectors(nodes[a].position, nodes[b].position).multiplyScalar(0.5);
        const textMesh = lineTexts[k];
        textMesh.position.set(mid.x, mid.y + 0.5, mid.z);
    }
}

// Instance transforms
function commitInstance(i, pulseMul = 1) {
    const rec = nodes[i];
    const s = rec.baseScale * pulseMul;
    const scale = new THREE.Vector3(s, s, s);
    const m = new THREE.Matrix4().compose(rec.position, new THREE.Quaternion(), scale);
    nodeIMesh.setMatrixAt(i, m);
}

function commitAll(pulseMul = 1) {
    for (let i = 0; i < nodes.length; i++) commitInstance(i, pulseMul);
    nodeIMesh.count = nodes.length;
    nodeIMesh.instanceMatrix.needsUpdate = true;
}

// Node creation
function addInstance(position, name, isNexus = false) {
    const index = nodes.length;
    const baseScale = isNexus ? 2.0 : 1.0; // base geometry is 0.5 -> nexus looks like radius 1
    const rec = {
        index,
        position: position.clone(),
        name,
        baseScale,
        isNexus,
        text: addText(name, new THREE.Vector3(position.x, position.y + (isNexus ? 1.5 : 1), position.z), 0.3)
    };
    nodes.push(rec);
    commitInstance(index);
    nodeIMesh.count = nodes.length;
    nodeIMesh.instanceMatrix.needsUpdate = true;

    if (isNexus) spinningText.push(rec.text); // Nexus text spins

    return index;
}

function addNode(position, originIndex, name, connectionText = 'Line') {
    const idx = addInstance(position, name, false);
    connectNodes(originIndex, idx, connectionText);
    return idx;
}

// Loops and generation
let loopCount = 0;
function createLoop(nodeIndexA, nodeIndexB, connectionText = 'Loop') {
    ensureConn(nodeIndexA); ensureConn(nodeIndexB);
    if (nodeConnections[nodeIndexA]?.has(nodeIndexB)) return;
    connectNodes(nodeIndexA, nodeIndexB, connectionText);
    loopCount++;
}

// Remaining targets for a node index
function remainingTargetsFor(nodeIndex) {
    const baseName = nodes[nodeIndex].name;
    const allowed = NODE_CONNECTIONS[baseName] || [];
    const verbs = NODE_VERBS[baseName] || [];
    const connectedNames = new Set(
        [...(nodeConnections[nodeIndex] || new Set())].map(j => nodes[j].name)
    );
    const remaining = [];
    const remainingVerbs = [];
    for (let i = 0; i < allowed.length; i++) {
        const t = allowed[i];
        if (connectedNames.has(t)) continue;
        remaining.push(t);
        remainingVerbs.push(verbs[i]);
    } return { remaining, remainingVerbs };
}

function addSmartNode() {
    if (nodes.length === 0) return false;

    // Collect candidates that still have available targets
    const candidates = [];
    for (let i = 0; i < nodes.length; i++) {
        const info = remainingTargetsFor(i);
        if (info.remaining.length > 0) candidates.push({ baseIndex: i, ...info });
    } if (candidates.length === 0) return false; // No more possible connections

    // Pick a random base among candidates
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const { baseIndex, remaining, remainingVerbs } = pick;

    const k = Math.floor(Math.random() * remaining.length);
    const newName = remaining[k];
    const newVerb = remainingVerbs[k];

    const existingIndex = nodes.findIndex(n => n.name === newName);
    if (existingIndex !== -1) {
        createLoop(baseIndex, existingIndex, newVerb);
        return true;
    }

    // Create new node around base
    const basePos = nodes[baseIndex].position;
    const angle = 2 * Math.PI * Math.random();
    const radius = MIN_NODE_DISTANCE + Math.random() * (MAX_NODE_DISTANCE - MIN_NODE_DISTANCE);
    const newPosition = basePos.clone().add(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.random() - 0.5,
        Math.sin(angle) * radius
    ));
    addNode(newPosition, baseIndex, newName, newVerb);
    return true;
}

// Camera
camera.position.z = 5;

// Bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    2, // radius
    0.3 // threshold
);
composer.addPass(bloomPass);

// Influence and UI
let influence = 0;
const influenceDiv = document.createElement('div');
influenceDiv.style.position = 'absolute';
influenceDiv.style.top = '10px';
influenceDiv.style.left = '10px';
influenceDiv.style.color = '#fff';
influenceDiv.style.fontSize = '24px';
influenceDiv.style.fontFamily = 'sans-serif';
influenceDiv.textContent = `Influence: ${influence}`;
document.body.appendChild(influenceDiv);

let pulsing = false;
let pulsingTime = 0;
const pulsingDuration = 0.2; // seconds
const pulsingStrength = 0.1;

function genInfluence() {
    let mul = 1;
    for (let i = 0; i < loopCount; i++) mul *= 2; // Each loop doubles the influence gain
    influence += nodes.length * mul;
    influenceDiv.textContent = `Influence: ${influence}`;
    pulsing = true;
    pulsingTime = 0;
}

renderer.domElement.addEventListener('click', () => genInfluence());

let canGenerate = true;
window.addEventListener('keydown', (event) => {
    if (!(event.code === 'Space' && canGenerate)) return;
    genInfluence();
    canGenerate = false;
    setTimeout(() => { canGenerate = true; }, 300);
});

let nodePrice = START_PRICE; // Price of adding a node
let additionCount = 1;

const addButton = document.createElement('button');
addButton.style.position = 'absolute';
addButton.style.top = '50px';
addButton.style.left = '10px';
addButton.textContent = `Connect (Cost: ${nodePrice})`;
document.body.appendChild(addButton);
addButton.addEventListener('click', () => {
    if (influence < Math.ceil(nodePrice)) return;
    if (!addSmartNode()) return;
    influence -= Math.ceil(nodePrice);
    additionCount++;
    let a = additionCount / maxNodes;
    nodePrice = a * a * a * (4 - 3 * a) * (MAX_PRICE - START_PRICE) + START_PRICE; // Smoothstep
    addButton.textContent = `Connect (Cost: ${Math.ceil(nodePrice)})`;
    influenceDiv.textContent = `Influence: ${influence}`;
});

// Lines updates once per frame
function rebuildLinesAndTexts() {
    updateLines();
    updateLineTexts();
}

// Animate
function animate() {
    const deltaTime = 1 / 60;

    for (let t of spinningText) t.rotation.y += deltaTime;

    // Pulse scale multiplier
    let pulseMul = 1;
    if (pulsing) {
        pulsingTime += deltaTime;
        if (pulsingTime < pulsingDuration) {
            pulseMul = 1 + Math.sin(2 * Math.PI * pulsingTime / pulsingDuration) * pulsingStrength;
        } else pulsing = false;
    }

    // Physics-like spacing and spring on connections
    for (let i = 0; i < nodes.length; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
            const nj = nodes[j];
            const distance = ni.position.distanceTo(nj.position);

            if (distance < MIN_NODE_DISTANCE) {
                const dir = new THREE.Vector3().copy(ni.position)
                    .sub(nj.position).normalize().multiplyScalar((MIN_NODE_DISTANCE - distance) * deltaTime / 2);
                ni.position.add(dir);
                nj.position.add(dir.negate());
            } else if (distance > MAX_NODE_DISTANCE && nodeConnections[i]?.has(j)) { // Only apply spring if connected
                const dir = new THREE.Vector3().copy(nj.position)
                    .sub(ni.position).normalize().multiplyScalar((distance - MAX_NODE_DISTANCE) * deltaTime / 2);
                ni.position.add(dir);
                nj.position.add(dir.negate());
            }
        }
    }

    // Update instance transforms and labels
    commitAll(pulseMul);
    for (let i = 0; i < nodes.length; i++) {
        const rec = nodes[i];
        if (rec.text) rec.text.position.set(rec.position.x, rec.position.y + (rec.isNexus ? 1.5 : 1), rec.position.z);
    }

    rebuildLinesAndTexts();
    controls.update(deltaTime);
    composer.render(deltaTime);
}
renderer.setAnimationLoop(animate);

// Load font and seed first node (Nexus)
loader.loadAsync('https://unpkg.com/three@0.150.1/examples/fonts/helvetiker_regular.typeface.json')
    .then(data => {
        font = data;
        addInstance(new THREE.Vector3(), 'Nexus', true);
    })
    .catch(err => console.error('Error loading font:', err));