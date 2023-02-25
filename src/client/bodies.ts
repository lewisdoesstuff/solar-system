import * as THREE from 'three';
import { Body, Moon } from './celestialBody';

export const SunScale = 2e-29;
export const PlanetScale = 2e-30;
export const MoonScale = 2e-30;
export const DistanceScale = 1e-2;
export const AU = 1000 * DistanceScale; // 149597870700 * 10e5
export const G = 6.67408e-11;

const sunMass = 1.989e30 * SunScale;
export const Bodies: { [key: string]: Body } = {
    sun: {
        mass: sunMass,
        density: 1.41,
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        inclination: 0,
        longitudeOfAscendingNode: 0,
        color: {
            orbit: 0xffff00,
            body: 0xffcc00,
        },
        name: 'sun',
        moons: [],
    },
    mercury: {
        mass: 3.285e23 * PlanetScale,
        density: 5.43,
        position: new THREE.Vector3(0.38709893 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / (0.39 * AU)), 0),
        inclination: 3.39,
        longitudeOfAscendingNode: 48.33,
        color: {
            orbit: 0xffcc99,
            body: 0x1a1a1a,
        },
        name: 'mercury',
        moons: [],
    },
    venus: {
        mass: 4.867e24 * PlanetScale,
        density: 5.24,
        position: new THREE.Vector3(0.72333199 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / (0.72 * AU)), 0),
        inclination: 3.86,
        longitudeOfAscendingNode: 76.68,
        color: {
            orbit: 0xff9999,
            body: 0xe6e6e6,
        },
        name: 'venus',
        moons: [],
    },
    earth: {
        mass: 5.972e24 * PlanetScale,
        density: 5.52,
        position: new THREE.Vector3(1 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / AU), 0),
        inclination: 0,
        longitudeOfAscendingNode: 0,
        color: { orbit: 0x9999ff, body: 0x2f6a69 },
        name: 'earth',
        moons: [
            {
                mass: 7.34767309e22 * MoonScale,
                density: 3.34,
                position: new THREE.Vector3(0.002 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                inclination: 0,
                longitudeOfAscendingNode: 0,
                color: { orbit: 0x9999ff, body: 0x2f6a69 },
                name: 'moon',
            },
        ],
    },
    mars: {
        mass: 6.39e23 * PlanetScale,
        density: 3.93,
        position: new THREE.Vector3(1.52366231 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / (1.52 * AU)), 0),
        inclination: 5.65,
        longitudeOfAscendingNode: 49.56,
        color: {
            orbit: 0xff6666,
            body: 0x993d00,
        },
        name: 'mars',
        moons: [
            {
                mass: 6.4171e16 * MoonScale,
                density: 3.93,
                position: new THREE.Vector3(0.002 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xff6666,
                    body: 0x993d00,
                },
                name: 'phobos',
            },
            {
                mass: 1.08e17 * MoonScale,
                density: 3.93,
                position: new THREE.Vector3(0.004 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xff6666,
                    body: 0x993d00,
                },
                name: 'deimos',
            },
        ],
    },
    jupiter: {
        mass: 1.898e27 * PlanetScale,
        density: 1.33,
        position: new THREE.Vector3(5.20336301 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / (5.2 * AU)), 0),
        inclination: 6.09,
        longitudeOfAscendingNode: 100.49,
        color: {
            orbit: 0xff9933,
            body: 0xb07f35,
        },
        name: 'jupiter',
        moons: [
            {
                mass: 1.898e22 * MoonScale,
                density: 1.33,
                position: new THREE.Vector3(0.002 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xff9933,
                    body: 0xb07f35,
                },
                name: 'io',
            },
            {
                mass: 1.898e22 * MoonScale,
                density: 1.33,
                position: new THREE.Vector3(0.004 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xff9933,
                    body: 0xb07f35,
                },
                name: 'europa',
            },
            {
                mass: 1.898e22 * MoonScale,
                density: 1.33,
                position: new THREE.Vector3(0.006 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xff9933,
                    body: 0xb07f35,
                },
                name: 'ganymede',
            },
            {
                mass: 1.898e22 * MoonScale,
                density: 1.33,
                position: new THREE.Vector3(0.008 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xff9933,
                    body: 0xb07f35,
                },
                name: 'callisto',
            },
        ],
    },
    saturn: {
        mass: 5.683e26 * PlanetScale,
        density: 0.69,
        position: new THREE.Vector3(9.53707032 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / (9.53 * AU)), 0),
        inclination: 5.51,
        longitudeOfAscendingNode: 113.64,
        color: {
            orbit: 0xffcc00,
            body: 0xb08f36,
        },
        name: 'saturn',
        moons: [
            {
                mass: 5.683e23 * MoonScale,
                density: 0.69,
                position: new THREE.Vector3(0.002 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xffcc00,
                    body: 0xb08f36,
                },
                name: 'mimas',
            },
            {
                mass: 5.683e23 * MoonScale,
                density: 0.69,
                position: new THREE.Vector3(0.004 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xffcc00,
                    body: 0xb08f36,
                },
                name: 'enceladus',
            },
            {
                mass: 5.683e23 * MoonScale,
                density: 0.69,
                position: new THREE.Vector3(0.006 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xffcc00,
                    body: 0xb08f36,
                },
                name: 'tethys',
            },
            {
                mass: 5.683e23 * MoonScale,
                density: 0.69,
                position: new THREE.Vector3(0.008 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xffcc00,
                    body: 0xb08f36,
                },
                name: 'dione',
            },
            {
                mass: 5.683e23 * MoonScale,
                density: 0.69,
                position: new THREE.Vector3(0.01 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xffcc00,
                    body: 0xb08f36,
                },
                name: 'rhea',
            },
            {
                mass: 5.683e23 * MoonScale,
                density: 0.69,
                position: new THREE.Vector3(0.012 * AU, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0xffcc00,
                    body: 0xb08f36,
                },
                name: 'titan',
            },
        ],
    },
    uranus: {
        mass: 8.681e25 * PlanetScale,
        density: 1.27,
        position: new THREE.Vector3(19.19126393 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / (19.19 * AU)), 0),
        inclination: 6.48,
        longitudeOfAscendingNode: 74.03,
        color: {
            orbit: 0x99ff99,
            body: 0x1a1a1a,
        },
        name: 'uranus',
        moons: [
            {
                mass: 8.681e22 * MoonScale,
                density: 1.27,
                position: new THREE.Vector3(0, 0, 0.002 * AU),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0x99ff99,
                    body: 0x1a1a1a,
                },
                name: 'ariel',
            },
            {
                mass: 8.681e22 * MoonScale,
                density: 1.27,
                position: new THREE.Vector3(0, 0, 0.004 * AU),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0x99ff99,
                    body: 0x1a1a1a,
                },
                name: 'umbriel',
            },
            {
                mass: 8.681e22 * MoonScale,
                density: 1.27,
                position: new THREE.Vector3(0, 0, 0.006 * AU),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0x99ff99,
                    body: 0x1a1a1a,
                },
                name: 'titania',
            },
            {
                mass: 8.681e22 * MoonScale,
                density: 1.27,
                position: new THREE.Vector3(0, 0, 0.008 * AU),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0x99ff99,
                    body: 0x1a1a1a,
                },
                name: 'oberon',
            },
        ],
    },
    neptune: {
        mass: 1.024e26 * PlanetScale,
        density: 1.64,
        position: new THREE.Vector3(30.0611 * AU, 0, 0),
        velocity: new THREE.Vector3(0, Math.sqrt((G * sunMass) / (30.06 * AU)), 0),
        inclination: 6.43,
        longitudeOfAscendingNode: 131.72,
        color: {
            orbit: 0x99ccff,
            body: 0x1a1a1a,
        },
        name: 'neptune',
        moons: [
            {
                mass: 1.024e22 * MoonScale,
                density: 1.64,
                position: new THREE.Vector3(0, 0, 0.002 * AU),
                velocity: new THREE.Vector3(0, 0, 0),
                color: {
                    orbit: 0x99ccff,
                    body: 0x1a1a1a,
                },
                name: 'triton',
            },
        ],
    },
};

export const getBodies = () => {
    // return string[] of all body.name and moon.name in Bodies
    const bodies = [];
    for (const body of Object.values(Bodies)) {
        bodies.push(body.name);
        for (const moon of body.moons) {
            bodies.push(moon.name);
        }
    }
    return bodies;
};

export const findBody = (name: string): Body | Moon | null => {
    // return body object from Bodies
    for (const body of Object.values(Bodies)) {
        if (body.name === name) {
            return body;
        } else {
            for (const moon of body.moons) {
                if (moon.name === name) {
                    return moon;
                }
            }
        }
    }
    return null;
};
