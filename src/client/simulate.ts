import * as THREE from 'three';
import { scene, camera } from './client';
import { CelestialBody } from './celestialBody';
import { G, SunScale, PlanetScale, MoonScale } from './bodies';
import { Body } from './sceneSetup';
import { runtimeConfig } from './runtimeConfig';
import { getZoom } from './camera';

const calculateForce = (body1: CelestialBody, body2: CelestialBody) => {
    if (body1.name === body2.name) {
        return new THREE.Vector3(0, 0, 0);
    }
    //return new THREE.Vector3(0, 0, 0);

    const distance = body2.position.distanceTo(body1.position);
    const mass1 = body1.mass;
    const mass2 = body2.mass;

    const force = (G * mass1 * mass2) / (distance * distance);
    const direction = body2.position.clone().sub(body1.position).normalize();
    //console.log(`direction: ${direction.x}, ${direction.y}, ${direction.z}`);
    //console.log(`Force between ${body1.name} and ${body2.name}: ${force} N`);
    return direction.multiplyScalar(force);
};

const updateOrbit = (body: Body, orbit: THREE.Line) => {
    const position = body.body.position.clone();
    orbit.position.set(position.x, position.y, position.z);
    return orbit;
};

export const simulate = (bodies: { [key: string]: Body }) => {
    const allBodies: CelestialBody[] = [];
    const bodiesByName: { [key: string]: Body } = {};
    for (const name in bodies) {
        allBodies.push(bodies[name].body);
        bodiesByName[bodies[name].body.name] = bodies[name];
        for (const moon of bodies[name].moons || []) {
            allBodies.push(moon.body);
            bodiesByName[moon.body.name] = moon;
        }
    }
    for (const bodyObj of allBodies) {
        // Calculate net gravitational force on this body from all other bodies
        let netForce = new THREE.Vector3(0, 0, 0);
        for (const otherBody of allBodies) {
            if (otherBody.name !== bodyObj.name) {
                netForce = netForce.add(calculateForce(bodyObj, otherBody));
            }
        }
        bodyObj.applyForce(netForce);
        bodyObj.updatePosition(runtimeConfig.simulation.timeStep);

        const body = bodiesByName[bodyObj.name];
        body.geometry.position.copy(bodyObj.position);

        if (body.body.type === 'moon' && body.body.parent) {
            const orbit = scene.getObjectByName(body.body.name + 'Orbit');
            updateOrbit(bodiesByName[body.body.parent.name], orbit as THREE.Line);
        }
        // handle label and moon as before...
        const labelContainer = scene.getObjectByName(body.body.name + 'LabelContainer');
        if (labelContainer && body.body.name !== 'sun') {
            if (body.body.type === 'body') {
                labelContainer.position.set(body.body.position.x, body.body.position.y, body.body.position.z);
                labelContainer.lookAt(new THREE.Vector3(body.body.position.x, -1000, body.body.position.z));

                // Calculate distance between camera and label
                const distanceToCamera = labelContainer.position.distanceTo(camera.position);
                if (distanceToCamera > 10) {
                    const zoom = getZoom(body.body);
                    const scaleFactor = distanceToCamera * (zoom < 1 ? 1 : zoom) * 0.1;
                    labelContainer.scale.set(scaleFactor, scaleFactor, scaleFactor);
                } else {
                    labelContainer.lookAt(camera.position);
                    labelContainer.scale.set(0.1, 0.1, 0.1);
                }
            } else {
                labelContainer.position.set(body.body.position.x, body.body.position.y, body.body.position.z);
                labelContainer.lookAt(new THREE.Vector3(body.body.position.x, -1000, body.body.position.z));

                // Calculate distance between camera and label
                const distanceToCamera = labelContainer.position.distanceTo(camera.position);
                if (distanceToCamera > 10) {
                    const zoom = getZoom(body.body);
                    const scaleFactor = distanceToCamera * (zoom < 1 ? 1 : zoom) * 0.01;
                    labelContainer.scale.set(scaleFactor, scaleFactor, scaleFactor);
                } else {
                    labelContainer.lookAt(camera.position);
                    labelContainer.scale.set(0.1, 0.1, 0.1);
                }
            }
        }
    }
    return bodies;
};

export const osimulate = (bodies: { [key: string]: Body }) => {
    // Update positions/velocities due to gravity
    const sun = bodies['sun'];
    for (const name in bodies) {
        const body = bodies[name];
        const forceFromSun = calculateForce(sun.body, body.body);
        body.body.applyForce(forceFromSun);
        body.body.updatePosition(runtimeConfig.simulation.timeStep);
        body.geometry.position.copy(body.body.position);
        const labelContainer = scene.getObjectByName(body.body.name + 'LabelContainer');
        if (labelContainer && body.body.name !== 'sun') {
            labelContainer.position.set(body.body.position.x, body.body.position.y, body.body.position.z);
            labelContainer.lookAt(new THREE.Vector3(body.body.position.x, -1000, body.body.position.z));

            // Calculate distance between camera and label
            const distanceToCamera = labelContainer.position.distanceTo(camera.position);
            if (distanceToCamera > 10) {
                const zoom = getZoom(body.body);
                const scaleFactor = distanceToCamera * (zoom < 1 ? 1 : zoom) * 0.1;
                labelContainer.scale.set(scaleFactor, scaleFactor, scaleFactor);
            } else {
                labelContainer.lookAt(camera.position);
                labelContainer.scale.set(0.1, 0.1, 0.1);
            }
        }
        for (const moon of body.moons || []) {
            const forceFromPlanet = calculateForce(body.body, moon.body);
            const forceFromSunToMoon = calculateForce(sun.body, moon.body);
            const netForce = forceFromPlanet.add(forceFromSunToMoon);

            moon.body.applyForce(netForce);
            moon.body.updatePosition(runtimeConfig.simulation.timeStep);
            moon.geometry.position.copy(moon.body.position);
            const labelContainer = scene.getObjectByName(moon.body.name + 'LabelContainer');

            if (labelContainer) {
                labelContainer.position.set(moon.body.position.x, moon.body.position.y, moon.body.position.z);
                labelContainer.lookAt(new THREE.Vector3(moon.body.position.x, -1000, moon.body.position.z));

                // Calculate distance between camera and label
                const distanceToCamera = labelContainer.position.distanceTo(camera.position);
                if (distanceToCamera > 10) {
                    const zoom = getZoom(moon.body);
                    const scaleFactor = distanceToCamera * (zoom < 1 ? 1 : zoom) * 0.01;
                    labelContainer.scale.set(scaleFactor, scaleFactor, scaleFactor);
                } else {
                    labelContainer.lookAt(camera.position);
                    labelContainer.scale.set(0.1, 0.1, 0.1);
                }
            }

            const orbit = scene.getObjectByName(moon.body.name + 'Orbit');
            updateOrbit(body, orbit as THREE.Line);
        }
    }

    return bodies;
};
