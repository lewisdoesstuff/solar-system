import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { createScene, simulate } from './simulate';
import { moveCamera, following, unFollow, followDistance } from './camera';
import { CelestialBody } from './celestialBody';

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e10);
const raycaster = new THREE.Raycaster();

camera.position.z = 3e6;

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);

const maxShadowDistance = 1e6;
const updateShadows = (camera: THREE.Camera) => {
    scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {

            const distance = object.position.distanceTo(camera.position);
            if (distance > maxShadowDistance && !object.name.includes('label')) {
                object.castShadow = false;
                object.receiveShadow = false;
            } else {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        }
    });
};

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    updateShadows(camera);
    if (following) {
        const targetPos = following.position.clone();
        controls.target.copy(targetPos);
        controls.update();
    }
    bodies = simulate(bodies);
    render();
}

function render() {
    renderer.render(scene, camera);
}

const clickEvent = (event: MouseEvent) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children.filter((child) => child.type === 'Mesh' && !child.name.includes('Label')));
    if (intersects.length > 0) {
        const body = intersects[0].object;
        moveCamera(body);
    }
};

const rightClickEvent = (event: MouseEvent) => {
    unFollow();
};

let bodies = createScene();
bodies = simulate(bodies);
renderer.domElement.addEventListener('click', (event) => clickEvent(event));
renderer.domElement.addEventListener('contextmenu', (event) => rightClickEvent(event));
//bodies = simulate(bodies);

animate();
