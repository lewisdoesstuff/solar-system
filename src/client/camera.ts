import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { controls, camera } from './client';
import { CelestialBody, Body } from './celestialBody';
import { Bodies } from './bodies';

const distance = 1e6;

export let following: THREE.Object3D | undefined;
export let followDistance: number = 0;
export const getZoom = (body: Body) => {
    const minZoom = 1e5;
    const maxZoom = 1e6;
    // Find the object in the Bodies object with the smallest mass
    const minMass = Math.min(...Object.values(Bodies).map((body) => body.mass));
    const maxMass = Math.max(...Object.values(Bodies).map((body) => body.mass));
    const scaleFactor = (maxZoom - minZoom) / (maxMass - minMass);
    const zoom = minZoom + (body.mass - minMass) * scaleFactor;
    return zoom;
};

export const moveCamera = (body: THREE.Object3D) => {
    console.log('click!');
    //controls.enabled = false;
    console.log(body);
    const position = body.position.clone();
    const camPosition = camera.position.clone();
    const bodyObj = Bodies[body.name];
    const endPosition = new THREE.Vector3().copy(position).add(new THREE.Vector3(0, 0, bodyObj ? getZoom(bodyObj) : 5e4));

    new TWEEN.Tween(camPosition)
        .to(endPosition, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
            camera.position.copy(camPosition);
            camera.lookAt(endPosition);
        })
        .onComplete(function () {
            camera.position.copy(endPosition);
            controls.target.copy(position);
            controls.update()
            camera.lookAt(endPosition);
            following = body;
            followDistance = bodyObj ? getZoom(bodyObj) : 5e4;

        })
        .start();
};

export const unFollow = () => {
    following = undefined;
    followDistance = 0;
};
