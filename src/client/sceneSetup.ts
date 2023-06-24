import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { scene, camera } from './client';
import { CelestialBody, createBodies } from './celestialBody';
import { Bodies, G } from './bodies';
import { createStars } from './stars';

export interface Body {
    body: CelestialBody;
    geometry: THREE.Mesh;
    orbit: THREE.Line;
    moons?: Body[];
}

const generateLighterColor = (color: THREE.Color, amount: number): THREE.Color => {
    const r = Math.min(color.r + amount, 1);
    const g = Math.min(color.g + amount, 1);
    const b = Math.min(color.b + amount, 1);
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
            : new THREE.MeshPhongMaterial({
                  color: new THREE.Color(body.color.body),
                  specular: generateLighterColor(new THREE.Color(body.color.body), 0.1),
                  depthTest: true,
                  shininess: 20,
              });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.renderOrder = 1;
    sphere.castShadow = body.name !== 'sun';
    sphere.receiveShadow = body.name !== 'sun';
    sphere.position.copy(body.position);
    sphere.name = body.name;
    scene.add(sphere);
    return sphere;
};

const getTextSize = (body: CelestialBody) => {
    const minTextSize = 0.1;
    const maxTextSize = 1;
    // Find the object in the Bodies object with the smallest mass
    const minMass = Math.min(...Object.values(Bodies).map((body) => body.mass));
    const maxMass = Math.max(...Object.values(Bodies).map((body) => body.mass));
    const scaleFactor = (maxTextSize - minTextSize) / (maxMass - minMass);
    const textSize = minTextSize + (body.mass - minMass) * scaleFactor;
    return body.type == 'moon' ? textSize * 1 : textSize * 2;
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
        labelContainer.lookAt(new THREE.Vector3(body.position.x, -1000, body.position.z + 100));
        labelContainer.rotation.z = 0;
        labelContainer.rotation.x = 20;
        labelContainer.renderOrder = 0;
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
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 1000;
            light.shadow.camera.fov = 75;
            light.shadow.blurSamples = 25;
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
    orbit.renderOrder = 0;
    scene.add(orbit);
    return orbit;
};
