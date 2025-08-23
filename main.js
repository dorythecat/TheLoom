import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a sphere
const geometry = new THREE.SphereGeometry(1, 64, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create the sphere's edges and add them to the scene
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({color: '#000000'})
);
scene.add(line);

// Load a font and create the text mesh
const loader = new FontLoader();
let textMesh;
loader.load('https://unpkg.com/three@0.150.1/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry('Nexus Node', {
        font: font,
        size: 0.4,
        depth: 0.1,
        curveSegments: 2
    });
    textGeometry.center();

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Position the text above the sphere
    textMesh.position.y = 1.5;
    scene.add(textMesh);
});

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

function animate() {
    // Rotate the sphere
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Update the edges to match the sphere's rotation
    line.rotation.x = cube.rotation.x;
    line.rotation.y = cube.rotation.y;

    if (textMesh) textMesh.rotation.y += 0.005;

    composer.render(1 / 60);
}
renderer.setAnimationLoop(animate);