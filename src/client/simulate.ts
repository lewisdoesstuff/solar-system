import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { scene, camera } from './client';
import { CelestialBody, createBodies } from './celestialBody';
import { Bodies, G } from './bodies';
import { createStars } from './stars';

export const timeStep = 500;
interface Body {
    body: CelestialBody;
    geometry: THREE.Mesh;
    orbit: THREE.Line;
    moons?: Body[];
}

const isMoon = (body: CelestialBody) => {
    return Object.values(Bodies).filter((b) => b.name == body.name).length == 0;
};

const calculateForce = (body1: CelestialBody, body2: CelestialBody) => {
    if (body1.name === body2.name) {
        return new THREE.Vector3(0, 0, 0);
    }
    const distance = body2.position.distanceTo(body1.position);
    const force = (G * body2.mass * body1.mass) / (distance * distance);
    const direction = body1.position.clone().sub(body2.position).normalize();
    return direction.multiplyScalar(force);
};

const createOrbits = (body: CelestialBody) => {
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitVertices = 4096;
    const orbitPositions = new Float32Array(orbitVertices * 3);
    const orbitCenter = new THREE.Vector3(0, 0, 0);
    if (body.type === 'moon') {
        orbitCenter.add((body.parent as CelestialBody).position);
    }
    const orbitRadius = body.position.distanceTo(orbitCenter);
    const orbitAngle = (2 * Math.PI) / orbitVertices;

    // Calculate the orbital plane normal vector
    const planeNormal = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(1, 0, 0), body.inclination);

    // Create a Quaternion object that rotates the orbit line around the normal vector
    const rotation = new THREE.Quaternion().setFromAxisAngle(planeNormal, body.longitudeOfAscendingNode);
    // Calculate each orbit line vertex position and apply rotation
    for (let i = 0; i <= orbitVertices; i++) {
        const x = orbitRadius * Math.cos(i * orbitAngle);
        const y = orbitRadius * Math.sin(i * orbitAngle);
        const vertex = new THREE.Vector3(x, y, 0);
        vertex.applyQuaternion(rotation);
        orbitPositions[i * 3] = vertex.x;
        orbitPositions[i * 3 + 1] = vertex.y;
        orbitPositions[i * 3 + 2] = vertex.z;
    }

    orbitGeometry.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: body.color.orbit });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.name = body.name + 'Orbit';
    orbit.renderOrder = 0
    scene.add(orbit);
    return orbit;
};

const updateOrbit = (body: Body, orbit: THREE.Line) => {
    const position = body.body.position.clone();
    orbit.position.set(position.x, position.y, position.z);
    return orbit;
};

const generateLighterColor = (color: THREE.Color, amount: number): THREE.Color => {
    const r = Math.min(color.r + amount, 1);
    const g = Math.min(color.g + amount, 1);
    const b = Math.min(color.b + amount, 1);
    console.log(color);
    console.log(new THREE.Color(r, g, b));
    return new THREE.Color(r, g, b);
};

const createGeometry = (body: CelestialBody): THREE.Mesh => {
    const geometry = new THREE.SphereGeometry(body.radius, 32, 32);
    const material =
        body.name === 'sun'
            ? new THREE.MeshStandardMaterial({
                  color: 0xffffff,
                  emissive: body.color.body,
                  emissiveIntensity: 2,
                  metalness: 1,
                  roughness: 5,
              })
            : new THREE.MeshPhongMaterial({ color: new THREE.Color(body.color.body), specular: generateLighterColor(new THREE.Color(body.color.body), 0.1), depthTest: true, shininess: 20 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.renderOrder = 1
    sphere.castShadow = body.name !== "sun";
    sphere.receiveShadow = body.name !== "sun";
    sphere.position.copy(body.position);
    sphere.name = body.name;
    scene.add(sphere);
    return sphere;
};

const getTextSize = (body: CelestialBody) => {
    const minTextSize = 5000;
    const maxTextSize = 10000;
    // Find the object in the Bodies object with the smallest mass
    const minMass = Math.min(...Object.values(Bodies).map((body) => body.mass));
    const maxMass = Math.max(...Object.values(Bodies).map((body) => body.mass));
    const scaleFactor = (maxTextSize - minTextSize) / (maxMass - minMass);
    const textSize = minTextSize + (body.mass - minMass) * scaleFactor;
    return isMoon(body) ? textSize * 2 : textSize * 10;
};

const createText = (body: CelestialBody) => {
    const loader = new FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        const textSize = getTextSize(body);
        const geometry = new TextGeometry(body.name, {
            font: font,
            size: textSize,
            height: 0.01,
            curveSegments: 12,
            bevelEnabled: false,
        });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const text = new THREE.Mesh(geometry, material);

        // text.position.copy(body.position);
        text.position.add(new THREE.Vector3(0, textSize * 1.5, 0)); // move the text above the planet
        geometry.computeBoundingBox();
        text.geometry.translate(-(text.geometry.boundingBox as THREE.Box3).max.x / 2, 0, 0);
        text.name = body.name + 'Label';

        // create a line between the planet and its label
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([body.position, text.position]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.Line(lineGeometry, lineMaterial);

        const labelContainer = new THREE.Object3D();
        labelContainer.name = body.name + 'LabelContainer';
        labelContainer.add(text);
        labelContainer.add(line);

        line.geometry.attributes.position.setXYZ(0, 0, body.radius * 1.5 + textSize, 0);
        line.geometry.attributes.position.setXYZ(1, 0, body.radius, 0);
        line.geometry.attributes.position.needsUpdate = true;
        text.position.set(0, body.radius * 1.5 + textSize, 0);

        labelContainer.position.copy(body.position);
        labelContainer.lookAt(new THREE.Vector3(0, 0, 0));
        labelContainer.rotation.z = 0;
        labelContainer.renderOrder = 0
        scene.add(labelContainer);
    });
};

export const createScene = () => {
    createStars();
    const initialBodies = createBodies();
    const bodies: { [key: string]: Body } = {};
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    for (const name in initialBodies) {
        const moons = initialBodies[name].moons;
        bodies[name] = {
            body: initialBodies[name],
            geometry: createGeometry(initialBodies[name]),
            orbit: createOrbits(initialBodies[name]),
            moons: [],
        };
        if (name === 'sun') {
            // light source
            const light = new THREE.PointLight(0xffffff, 1, 0, 2);
            light.castShadow = true;
            light.position.copy(initialBodies[name].position);
            scene.add(light);
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.1
            light.shadow.camera.far = 1e8;
            light.shadow.camera.fov = 75;
            light.shadow.blurSamples = 25

        }

        createText(bodies[name].body);
        for (const moon of moons) {
            bodies[name].moons?.push({
                body: moon,
                geometry: createGeometry(moon),
                orbit: createOrbits(moon),
            });
            createText(moon);
        }
    }
    return bodies;
};
export const simulate = (bodies: { [key: string]: Body }) => {
    // Update positions/velocities due to gravity
    const sun = bodies['sun'];
    for (const name in bodies) {
        const body = bodies[name];
        const forceFromSun = calculateForce(sun.body, body.body);
        body.body.applyForce(forceFromSun);
        body.body.updatePosition(timeStep);
        body.geometry.position.copy(body.body.position);
        const labelContainer = scene.getObjectByName(body.body.name + 'LabelContainer');
        labelContainer?.position.set(body.body.position.x, body.body.position.y, body.body.position.z);

        labelContainer?.lookAt(camera.position);

        for (const moon of body.moons || []) {
            const forceFromPlanet = calculateForce(body.body, moon.body);
            const forceFromSunToMoon = calculateForce(sun.body, moon.body);
            const netForce = forceFromPlanet.add(forceFromSunToMoon);

            moon.body.applyForce(netForce);
            moon.body.updatePosition(timeStep);
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
