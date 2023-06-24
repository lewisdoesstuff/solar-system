import * as THREE from 'three';
import { scene, camera } from './client';
import { CelestialBody } from './celestialBody';
import { G, SunScale, PlanetScale, MoonScale } from './bodies';
import { Body } from './sceneSetup';
import { runtimeConfig } from './runtimeConfig';

const calculateForce = (body1: CelestialBody, body2: CelestialBody) => {
    if (body1.name === body2.name) {
        return new THREE.Vector3(0, 0, 0);
    }

    const distance = body2.position.distanceTo(body1.position);

    const force = (G * body1.mass * body2.mass) / (distance * distance);
    const direction = body1.position.clone().sub(body2.position).normalize();
    //console.log(`Force between ${body1.name} and ${body2.name}: ${force} N`);
    return direction.multiplyScalar(force);
};

const updateOrbit = (body: Body, orbit: THREE.Line) => {
    const position = body.body.position.clone();
    orbit.position.set(position.x, position.y, position.z);
    return orbit;
};

export const simulate = (bodies: { [key: string]: Body }) => {
    // Update positions/velocities due to gravity
    const sun = bodies['sun'];
    for (const name in bodies) {
        const body = bodies[name];
        const forceFromSun = calculateForce(sun.body, body.body);
        body.body.applyForce(forceFromSun);
        body.body.updatePosition(runtimeConfig.simulation.timeStep);
        body.geometry.position.copy(body.body.position);
        const labelContainer = scene.getObjectByName(body.body.name + 'LabelContainer');
        labelContainer?.position.set(body.body.position.x, body.body.position.y, body.body.position.z);

        labelContainer?.lookAt(camera.position);

        for (const moon of body.moons || []) {
            const forceFromPlanet = calculateForce(body.body, moon.body);
            const forceFromSunToMoon = calculateForce(sun.body, moon.body);
            const netForce = forceFromPlanet.add(forceFromSunToMoon);

            moon.body.applyForce(netForce);
            moon.body.updatePosition(runtimeConfig.simulation.timeStep);
            moon.geometry.position.copy(moon.body.position);
            const labelContainer = scene.getObjectByName(moon.body.name + 'LabelContainer');

            labelContainer?.position.copy(moon.body.position);
            labelContainer?.lookAt(camera.position);

            const orbit = scene.getObjectByName(moon.body.name + 'Orbit');
            updateOrbit(body, orbit as THREE.Line);
        }
    }

    return bodies;
};

