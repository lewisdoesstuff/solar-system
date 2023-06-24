import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { controls, camera, gui } from './client';
import { CelestialBody, Body, Moon, Planet } from './celestialBody';
import { Bodies, findBody } from './bodies';
import { runtimeConfig } from './runtimeConfig';
import { get } from 'http';

export const getZoom = (body: Body) => {
    const minZoom = 0.25;
    const maxZoom = 2;
    if (body.name === 'sun') return 10;
    // Find the object in the Bodies object with the smallest mass
    const minMass = Math.min(
        ...Object.values(Bodies)
            .filter((body) => body.name !== 'sun')
            .map((body) => body.mass)
    );
    const maxMass = Math.max(
        ...Object.values(Bodies)
            .filter((body) => body.name !== 'sun')
            .map((body) => body.mass)
    );
    const scaleFactor = (maxZoom - minZoom) / (maxMass - minMass);
    const zoom = minZoom + (body.mass - minMass) * scaleFactor;
    return zoom;
};

export const moveCamera = (body: THREE.Object3D | Planet | Moon) => {
    //controls.enabled = false;
    let position = body.position.clone();
    const camPosition = camera.position.clone();
    const bodyObj = findBody(body.name) as Moon | Planet;
    const camOffset = new THREE.Vector3(0, 0, getZoom(bodyObj));
    //let endPosition = new THREE.Vector3().copy(position).add(new THREE.Vector3(0, 0, getZoom(bodyObj)));
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    new TWEEN.Tween(camPosition)
        .to(position.clone().add(camOffset), 2000)
        .dynamic(true)
        .easing(TWEEN.Easing.Sinusoidal.In)
        .onUpdate(function () {
            position = body.position.clone();
            const offsetPos = camPosition.clone().add(camOffset);
            camera.position.copy(offsetPos);
            controls.target.copy(position);
            //camera.lookAt(position);
            controls.update();
        })
        .onComplete(function () {
            position = body.position.clone();
            const offsetPos = camPosition.clone().add(camOffset);
            camera.position.copy(offsetPos);
            controls.target.copy(position);
            controls.update();
            //camera.lookAt(position);
            runtimeConfig.camera.followTarget = body.name;
        })
        .start();
    gui.updateDisplay();
};

export const unFollow = () => {
    runtimeConfig.camera.followTarget = '';
    controls.maxDistance = 10000;
};
