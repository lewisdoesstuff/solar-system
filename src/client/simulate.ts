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
    // create list of all bodies and moons
    const allBodies = Object.values(bodies).reduce((acc, body) => {
        acc.push(body);
        if (body.moons) {
            acc.push(...body.moons);
        }
        return acc;
    }, [] as Body[]);
    // Calculate gravity between all bodies
    for (const body of allBodies) {
        for (const otherBody of allBodies) {
            if (body.body.name !== otherBody.body.name) {
                const force = calculateForce(otherBody.body, body.body );
                body.body.applyForce(force);
            }
        }
    }
    // Update positions
    for (const body of allBodies) {
        body.body.updatePosition(runtimeConfig.simulation.timeStep);
        body.geometry.position.copy(body.body.position);
        const labelContainer = scene.getObjectByName(body.body.name + 'LabelContainer');
        labelContainer?.position.set(body.body.position.x, body.body.position.y, body.body.position.z);
        labelContainer?.lookAt(camera.position);
        if (body.orbit && body.body.parent) {
            updateOrbit(bodies[body.body.parent.name], body.orbit);
        }
    }

    return bodies;
};
