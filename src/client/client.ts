import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { simulate } from './simulate';
import { getZoom, moveCamera, unFollow } from './camera';
import { createScene } from './sceneSetup';
import { createGUI } from './gui';
import { GUI } from 'dat.gui';
import { runtimeConfig } from './runtimeConfig';
import { findBody } from './bodies';
import { Moon, Planet } from './celestialBody';

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const raycaster = new THREE.Raycaster();

camera.position.z = 100;

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);

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
    if (runtimeConfig.camera.followTarget != '') {
        const target = scene.getObjectByName(runtimeConfig.camera.followTarget);
        const targetBody = findBody(runtimeConfig.camera.followTarget) as Planet | Moon;
        if (target) {
            const targetPos = target.position.clone();

            controls.target.copy(targetPos);

            const zoomLevel = getZoom(targetBody);
            controls.maxDistance = zoomLevel;
            controls.minDistance = 0;

            controls.update();
        }
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
export const gui = createGUI(new GUI({ autoPlace: true }));

let bodies = createScene();
bodies = simulate(bodies);
renderer.domElement.addEventListener('click', (event) => clickEvent(event));
renderer.domElement.addEventListener('contextmenu', (event) => rightClickEvent(event));

animate();
