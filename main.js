import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a box
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create the box's edges and add them to the scene
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({color: '#000000'})
);
scene.add(line);

camera.position.z = 5;

function animate() {
    renderer.render(scene, camera);

    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Update the edges to match the cube's rotation
    line.rotation.x = cube.rotation.x;
    line.rotation.y = cube.rotation.y
}
renderer.setAnimationLoop(animate);