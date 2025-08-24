import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'

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

// Create a sphere
const geometry = new THREE.SphereGeometry(1);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const nexusNode = new THREE.Mesh(geometry, nodeMaterial);
scene.add(nexusNode);

let nodes = [nexusNode];
function addNode(position) {
    const geometry = new THREE.SphereGeometry(0.5);
    const node = new THREE.Mesh(geometry, nodeMaterial);
    node.position.set(position.x, position.y, position.z);
    nodes.push(node);
    scene.add(node);
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
}

// Load a font and create the text mesh
const loader = new FontLoader();
let textMeshes = [];
let spinningText = [];
function addText(text, position, size = 0.4, spinning = false) {
    loader.load('https://unpkg.com/three@0.150.1/examples/fonts/helvetiker_regular.typeface.json', (font) => {
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
    }, null, (err) => { console.error(`An error occurred loading the font: ${err}`); });
}

addText('Nexus Node', new THREE.Vector3(0, 1.5, 0), 0.4, true); // Always add 1.5 to y so it hovers over nodes

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

renderer.domElement.addEventListener('click', () => {
    influence++;
    influenceDiv.textContent = `Influence: ${influence}`;

    // Start pulsing effect
    pulsing = true;
    pulsingTime = 0;
});

// Button to add nodes and lines for testing
const addButton = document.createElement('button');
addButton.style.position = 'absolute';
addButton.style.top = '50px';
addButton.style.left = '10px';
addButton.textContent = 'Add Node';
document.body.appendChild(addButton);
addButton.addEventListener('click', () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    const originNode = nodes[Math.floor(Math.random() * nodes.length)];
    const x = originNode.position.x + Math.cos(angle) * radius;
    const y = originNode.position.y + (Math.random() - 0.5)
    const z = originNode.position.z + Math.sin(angle) * radius;
    const position = new THREE.Vector3(x, y, z);
    addNode(position);
    addLine(originNode.position, position);
    addText('Node', new THREE.Vector3(x, y + 1.5, z), 0.3, true);
});

function animate() {
    for (let textMesh of spinningText) textMesh.rotation.y += 0.01;

    if (pulsing) {
        pulsingTime += 1 / 60;
        if (pulsingTime < pulsingDuration) {
            const scale = 1 + Math.sin(2 * Math.PI * pulsingTime / pulsingDuration) * pulsingStrength;
            nexusNode.scale.set(scale, scale, scale);
        } else pulsing = false;
    }

    controls.update(1 / 60);

    composer.render(1 / 60);
}
renderer.setAnimationLoop(animate);