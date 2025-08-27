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
    "Decay": ["Compost", "Nutrients", "Soil", "Death"],

    // Miscellaneous connections
    "Death": ["Life"],
    "Water": ["Ice"]
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

    // Miscellaneous connections
    "Death": ["ends"],
    "Water": ["freezes into"]
}

const maxNodes = 146; // Max nodes possible

let nodes = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initiate FlyControls with various params
const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 10;
controls.rollSpeed = Math.PI / 4;
controls.autoForward = false;
controls.dragToLook = true;

// Load a font and create the text mesh
let font;
let textMeshes = [], spinningText = [];
const loader = new FontLoader();
loader.loadAsync('https://unpkg.com/three@0.150.1/examples/fonts/helvetiker_regular.typeface.json').then(data => {
    font = data;

    // Add initial text above the nexus node
    const text = addText('Nexus', new THREE.Vector3(0, 1.5, 0), 0.4, true);
    nodes.push([nexusNode, text, 'Nexus']);
}).catch(err => {
    console.error('Error loading font:', err);
});
function addText(text, position, size = 0.4, spinning = false) {
    if (!font) return; // Font not loaded yet
    const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        depth: 0.1,
        curveSegments: 2
    });
    textGeometry.center();

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMeshes.push(textMesh);
    if (spinning) spinningText.push(textMesh);

    // Position the text above the sphere
    textMesh.position.x = position.x;
    textMesh.position.y = position.y;
    textMesh.position.z = position.z;
    scene.add(textMesh);
    return textMesh;
}

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });

let lines = [];
function addLine(start, end) {
    const points = [];
    points.push(start);
    points.push(end);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial);
    lines.push(line);
    scene.add(line);
    return line;
}

// Create the base (nexus) node
const geometry = new THREE.SphereGeometry(1);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const nexusNode = new THREE.Mesh(geometry, nodeMaterial);
scene.add(nexusNode);

let nodeConnections = {}; // Track connections between nodes
let lineTexts = {}; // Track line texts

function connectNodes(nodeA, nodeB, text) {
    if (!nodeConnections[nodeA.uuid]) nodeConnections[nodeA.uuid] = new Set();
    if (!nodeConnections[nodeB.uuid]) nodeConnections[nodeB.uuid] = new Set();
    nodeConnections[nodeA.uuid].add(nodeB.uuid);
    nodeConnections[nodeB.uuid].add(nodeA.uuid);

    const key = [nodeA.uuid, nodeB.uuid].sort().join('-');
    const mid = new THREE.Vector3().addVectors(nodeA.position, nodeB.position).multiplyScalar(0.5);
    lineTexts[key] = addText(text, new THREE.Vector3(mid.x, mid.y + 0.5, mid.z), 0.2);

    addLine(nodeA.position, nodeB.position);
}

function addNode(position, originNode, name, connectionText = "Line") {
    const geometry = new THREE.SphereGeometry(0.5);
    const node = new THREE.Mesh(geometry, nodeMaterial);
    node.position.copy(position);
    scene.add(node);

    connectNodes(originNode, node, connectionText);
    nodes.push([node, addText(name, new THREE.Vector3(position.x, position.y + 1, position.z), 0.3), name]);
}

let loopCount = 0;
function createLoop(nodeIndexA, nodeIndexB, connectionText = "Loop") {
    const nodeA = nodes[nodeIndexA][0];
    const nodeB = nodes[nodeIndexB][0];
    if (nodeA !== nodeB && !nodeConnections[nodeA.uuid]?.has(nodeB.uuid)) {
        connectNodes(nodeA, nodeB, connectionText);
        loopCount++;
    }
}

// Helper: returns remaining target names/verbs for a given node index
function remainingTargetsFor(nodeIndex) {
    const [baseNode, , baseName] = nodes[nodeIndex];
    const allowed = NODE_CONNECTIONS[baseName] || [];
    const verbs = NODE_VERBS[baseName] || [];

    // Build a set of names already connected from this base node
    const connectedNames = new Set(
        [...(nodeConnections[baseNode.uuid] || new Set())]
            .map(uuid => nodes.find(n => n[0].uuid === uuid))
            .filter(Boolean)
            .map(n => n[2])
    );

    const remaining = [];
    const remainingVerbs = [];
    for (let i = 0; i < allowed.length; i++) {
        const targetName = allowed[i];
        if (connectedNames.has(targetName)) continue;
        remaining.push(targetName);
        remainingVerbs.push(verbs[i]);
    } return { baseNode, remaining, remainingVerbs };
}

function addSmartNode() {
    if (nodes.length === 0) return false;

    // Pick the first node that still has unfulfilled connections
    let baseIndex = -1, pick = null;
    for (let i = 0; i < nodes.length; i++) {
        const info = remainingTargetsFor(i);
        if (info.remaining.length <= 0) continue;
        baseIndex = i;
        pick = info;
        break;
    }
    if (!pick) return false; // nothing left to connect

    const { baseNode, remaining, remainingVerbs } = pick;
    const k = Math.floor(Math.random() * remaining.length);
    const newName = remaining[k];
    const newVerb = remainingVerbs[k];

    // If the target already exists globally, make a loop from the actual base
    const existingIndex = nodes.findIndex(n => n[2] === newName);
    if (existingIndex !== -1) {
        createLoop(baseIndex, existingIndex, newVerb);
        return true;
    }

    // Otherwise create a new node
    const angle = 2 * Math.PI * Math.random();
    const radius = MIN_NODE_DISTANCE + Math.random() * (MAX_NODE_DISTANCE - MIN_NODE_DISTANCE);
    const newPosition = new THREE.Vector3(
        baseNode.position.x + Math.cos(angle) * radius,
        baseNode.position.y + Math.random() - 0.5,
        baseNode.position.z + Math.sin(angle) * radius
    );
    addNode(newPosition, baseNode, newName, newVerb);
    return true;
}

camera.position.z = 5;

// Set up bloom composer
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    2, // radius
    0.3 // threshold
);
composer.addPass(bloomPass);

let influence = 0;

// Optionally, create a simple score display
const influenceDiv = document.createElement('div');
influenceDiv.style.position = 'absolute';
influenceDiv.style.top = '10px';
influenceDiv.style.left = '10px';
influenceDiv.style.color = '#fff';
influenceDiv.style.fontSize = '24px';
influenceDiv.style.fontFamily = 'sans-serif';
influenceDiv.textContent = `Influence: ${influence}`;
document.body.appendChild(influenceDiv);

// Nexus node pulsing effect
let pulsing = false;
let pulsingTime = 0;
const pulsingDuration = 0.2; // seconds
const pulsingStrength = 0.1;

function genInfluence() {
    let mul = 1;
    for (let i = 0; i < loopCount; i++) mul *= 2; // Each loop doubles the influence gain
    influence += nodes.length * mul;
    influenceDiv.textContent = `Influence: ${influence}`;

    // Start pulsing effect
    pulsing = true;
    pulsingTime = 0;
}

// Clicked on screen
renderer.domElement.addEventListener('click', () => {
    genInfluence();
});

// CLicked spacer
let canGenerate = true;
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && canGenerate) {
        genInfluence();
        canGenerate = false; // 300ms delay
        setTimeout(() => { canGenerate = true; }, 300);
    }
});

let nodePrice = START_PRICE; // Price of adding a node
let additionCount = 1;

// Button to add nodes and lines for testing
const addButton = document.createElement('button');
addButton.style.position = 'absolute';
addButton.style.top = '50px';
addButton.style.left = '10px';
addButton.textContent = `Connect (Cost: ${nodePrice})`;
document.body.appendChild(addButton);
addButton.addEventListener('click', () => {
    if (influence < Math.ceil(nodePrice)) return; // Not enough influence to add a node
    if (!addSmartNode()) return; // No valid connections could be made
    influence -= Math.ceil(nodePrice);
    additionCount++;
    let a = additionCount / maxNodes;
    a = a > 1 ? 1 : a;
    nodePrice = a * a * a * (4 - 3 * a) * (MAX_PRICE - START_PRICE) + START_PRICE; // Increase price for next node
    addButton.textContent = `Connect (Cost: ${Math.ceil(nodePrice)})`;
    influenceDiv.textContent = `Influence: ${influence}`;
});

function updateLines() {
    // Erase all previous lines
    for (let line of lines) {
        scene.remove(line);
        line.geometry.dispose();
        if (line.material.dispose) line.material.dispose();
    } lines = [];

    // Recreate lines based on current connections
    for (const [node, , , ] of nodes) {
        const connections = nodeConnections[node.uuid];
        if (!connections) continue;
        for (const otherUuid of connections) {
            const otherNode = nodes.find(n => n[0].uuid === otherUuid)?.[0];
            if (!otherNode || node.uuid >= otherNode.uuid) continue; // Avoid duplicates using ordered uuids
            const line = addLine(node.position, otherNode.position);
            lines.push(line);
        }
    }
}

function updateLineTexts() {
    for (const key in lineTexts) {
        const [uuidA, uuidB] = key.split('-');
        let nodeA, nodeB;
        for (let [node, _] of nodes) {
            if (node.uuid === uuidA) nodeA = node;
            else if (node.uuid === uuidB) nodeB = node;
            if (nodeA && nodeB) break;
        } if (!nodeA || !nodeB) continue;
        const textMesh = lineTexts[key];
        textMesh.position.x = (nodeA.position.x + nodeB.position.x) / 2;
        textMesh.position.y = (nodeA.position.y + nodeB.position.y) / 2 + 0.5;
        textMesh.position.z = (nodeA.position.z + nodeB.position.z) / 2;
    }
}

function animate() {
    const deltaTime = 1 / 60; // Fixed timestep for consistency

    // Rotate spinning text
    for (let textMesh of spinningText) textMesh.rotation.y += deltaTime;

    // Handle pulsing effect
    if (pulsing) {
        pulsingTime += deltaTime;
        if (pulsingTime < pulsingDuration) {
            const scale = 1 + Math.sin(2 * Math.PI * pulsingTime / pulsingDuration) * pulsingStrength;
            for (let node of nodes) node[0].scale.set(scale, scale, scale);
        } else pulsing = false;
    }

    // Adjust positions so nodes are properly spaced
    for (let i = 0; i < nodes.length; i++) {
        const [node, text, _] = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
            const [otherNode, _, __] = nodes[j];
            if (node === otherNode) continue;
            const distance = node.position.distanceTo(otherNode.position);
            const connected = nodeConnections[node.uuid]?.has(otherNode.uuid);
            if (distance < MIN_NODE_DISTANCE) { // Push apart
                const direction = new THREE.Vector3().subVectors(node.position, otherNode.position).normalize();
                const moveDistance = (MIN_NODE_DISTANCE - distance) * deltaTime / 2;
                node.position.addScaledVector(direction, moveDistance);
                otherNode.position.addScaledVector(direction, -moveDistance);
            } else if (distance > MAX_NODE_DISTANCE && connected) { // Only pull together connected nodes
                const direction = new THREE.Vector3().subVectors(otherNode.position, node.position).normalize();
                const moveDistance = (distance - MAX_NODE_DISTANCE) * deltaTime / 2;
                node.position.addScaledVector(direction, moveDistance);
                otherNode.position.addScaledVector(direction, -moveDistance);
            }

            if (!connected) continue; // Check if nodes are connected before updating lines
            updateLines();
        }

        // Move text to follow node
        // The other nodes are automatically handled once we get
        // to them so there's no worries about them
        text.position.x = node.position.x;
        text.position.y = node.position.y + (node === nexusNode ? 1.5 : 1); // The nexus node is slightly bigger
        text.position.z = node.position.z;
    }

    updateLineTexts();
    controls.update(deltaTime);
    composer.render(deltaTime);
} renderer.setAnimationLoop(animate);