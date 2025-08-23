import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

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

    composer.render(1 / 60);
}
renderer.setAnimationLoop(animate);