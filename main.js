import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'

const MIN_NODE_DISTANCE = 3;
const MAX_NODE_DISTANCE = 5;

let NODE_CONNECTIONS = { // List of possible node connections
    "Nexus": ["Tree"],
    "Tree": ["Branch", "Root"],
    "Branch": ["Leaf"],
    "Leaf": [],
    "Root": ["Soil", "Rock", "Nutrients"],
    "Soil": ["Rock", "Water"],
    "Rock": [],
    "Nutrients": ["Tree"],
}

let NODE_VERBS = { // List of possible node verbs
    "Nexus": [""],
    "Tree": ["grows", "has"],
    "Branch": ["grows"],
    "Leaf": [],
    "Root": ["utilizes", "anchors to", "absorbs"],
    "Soil": ["covers", "absorbs"],
    "Rock": [],
    "Nutrients": ["feed"]
}

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

// Add a node with names and connections handled
function addSmartNode() {
    let [lastNode, _, lastName] = nodes[nodes.length - 1];

    let possibleNames = NODE_CONNECTIONS[lastName] || [];
    let offset = 2;
    while (possibleNames.length === 0) {
        if (offset >= nodes.length) return; // No valid nodes to base off of
        [lastNode, _, lastName] = nodes[nodes.length - offset++];

        possibleNames = NODE_CONNECTIONS[lastName] || [];
    }
    const possibleVerbs = NODE_VERBS[lastName] || [];

    let newIndex = Math.floor(Math.random() * possibleNames.length);
    let newName = possibleNames[newIndex];
    let newVerb = possibleVerbs[newIndex];

    NODE_CONNECTIONS[lastName].splice(newIndex, 1);
    NODE_VERBS[lastName].splice(newIndex, 1);

    // Check if a node with this name already exists, and loop to it if so
    const existingIndex = nodes.findIndex(n => n[2] === newName);
    if (existingIndex !== -1) {
        createLoop(nodes.length - 1, existingIndex, newVerb);
        return;
    }

    let angle = 2 * Math.PI * Math.random();
    let radius = MIN_NODE_DISTANCE + Math.random() * (MAX_NODE_DISTANCE - MIN_NODE_DISTANCE);
    let newPosition = new THREE.Vector3(
        lastNode.position.x + Math.cos(angle) * radius,
        lastNode.position.y + Math.random() - 0.5, // Slight vertical variation
        lastNode.position.z + Math.sin(angle) * radius
    );
    addNode(newPosition, lastNode, newName, newVerb);
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

// Button to add nodes and lines for testing
const addButton = document.createElement('button');
addButton.style.position = 'absolute';
addButton.style.top = '50px';
addButton.style.left = '10px';
addButton.textContent = 'Add Node (Cost: 10)';
document.body.appendChild(addButton);
let nodePrice = 10;
addButton.addEventListener('click', () => {
    if (influence < nodePrice) return; // Not enough influence to add a node
    influence -= nodePrice;
    nodePrice = Math.ceil(nodePrice * Math.log10(nodePrice * 2)); // Increase price for next node
    addButton.textContent = `Add Node (Cost: ${nodePrice})`;
    influenceDiv.textContent = `Influence: ${influence}`;

    addSmartNode();
});

function updateLines() {
    // Erase all previous lines
    for (let line of lines) {
        scene.remove(line);
        line.geometry.dispose();
        if (line.material.dispose) line.material.dispose();
    }
    lines = [];

    // Recreate lines based on current connections
    for (const [node, , , ] of nodes) {
        const connections = nodeConnections[node.uuid];
        if (!connections) continue;
        for (const otherUuid of connections) {
            const otherNode = nodes.find(n => n[0].uuid === otherUuid)?.[0];
            if (!otherNode) continue;
            if (node.uuid >= otherNode.uuid) continue; // Avoid duplicates using ordered uuids
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
        }
        if (!nodeA || !nodeB) continue;
        const textMesh = lineTexts[key];
        textMesh.position.x = (nodeA.position.x + nodeB.position.x) / 2;
        textMesh.position.y = (nodeA.position.y + nodeB.position.y) / 2 + 0.5;
        textMesh.position.z = (nodeA.position.z + nodeB.position.z) / 2;
    }
}

function animate() {
    const deltaTime = 1 / 60;

    // Rotate spinning text
    for (let textMesh of spinningText) textMesh.rotation.y += 0.01;

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
                const moveDistance = (MIN_NODE_DISTANCE - distance) / 2;
                node.position.addScaledVector(direction, moveDistance);
                otherNode.position.addScaledVector(direction, -moveDistance);
            } else if (distance > MAX_NODE_DISTANCE && connected) { // Only pull together connected nodes
                const direction = new THREE.Vector3().subVectors(otherNode.position, node.position).normalize();
                const moveDistance = (distance - MAX_NODE_DISTANCE) / 2;
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