import * as THREE from 'three';
import { Bodies, G } from './bodies';

export interface Color {
    orbit: number;
    body: number;
}

export interface Moon {
    mass: number;
    density: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    inclination?: number;
    longitudeOfAscendingNode?: number;
    color: Color;
    name: string;
    moons?: Moon[];
}

export interface Body {
    mass: number;
    density: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    inclination: number;
    longitudeOfAscendingNode: number;
    color: Color;
    name: string;
    moons: Moon[];
}

export class CelestialBody {
    mass: number;
    density: number;
    radius: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    inclination: number;
    longitudeOfAscendingNode: number;
    name: string;
    color: Color;
    moons: CelestialBody[];
    type: 'body' | 'moon';
    parent?: CelestialBody;

    constructor(body: Body | Moon, type: 'body' | 'moon' = 'body', parent?: CelestialBody) {
        this.name = body.name;
        this.position = body.position;
        this.mass = body.mass;
        this.density = body.density;
        this.position = body.position;
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.color = body.color;
        this.radius = Math.pow((3 * this.mass) / (4 * Math.PI * this.density), 1 / 3);
        this.inclination = body.inclination || 0;
        this.longitudeOfAscendingNode = body.longitudeOfAscendingNode || 0;
        this.type = type;

        if (this.type === 'moon') {
            this.velocity = body.velocity;
            this.parent = parent;
        } else {
            console.log();
            this.inclination = this.inclination * (Math.PI / 180);

            const planeNormal = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(1, 0, 0), this.inclination);
            const velocity = body.velocity.clone();
            velocity.applyAxisAngle(planeNormal, this.longitudeOfAscendingNode);
            this.velocity = velocity;
            this.position.applyAxisAngle(planeNormal, this.longitudeOfAscendingNode);
        }

        if (body.moons && body.moons.length > 0) {
            this.moons = body.moons.map((moon) => {
                // Calculate the required velocity for a circular orbit
                moon.position = moon.position.add(this.position).add(new THREE.Vector3(this.radius, 0, 0));

                const distance = this.position.distanceTo(moon.position);
                const velocityMagnitude = Math.sqrt((G * (this.mass + moon.mass)) / distance);
                const tangent = new THREE.Vector3(this.position.y - moon.position.y, moon.position.x - this.position.x, 0).normalize();
                const velocity = tangent.multiplyScalar(velocityMagnitude);
                moon.inclination = this.inclination;
                moon.longitudeOfAscendingNode = this.longitudeOfAscendingNode;
                // Set the initial position and velocity of the moon
                // moon.position = moon.position.add(this.position);
                moon.velocity = velocity.add(this.velocity);

                return new CelestialBody(moon, 'moon', this);
            });
        } else {
            this.moons = [];
        }
    }

    applyForce(force: THREE.Vector3) {
        const acceleration = force.divideScalar(this.mass);
        this.acceleration.add(acceleration);
    }

    updatePosition(timeStep: number) {
        this.position = new THREE.Vector3()
            .copy(this.position)
            .add(this.velocity.clone().multiplyScalar(timeStep))
            .add(this.acceleration.clone().multiplyScalar(timeStep ** 2 / 2));
        this.velocity = new THREE.Vector3().copy(this.velocity).add(this.acceleration.clone().multiplyScalar(timeStep));
        this.acceleration = new THREE.Vector3(0, 0, 0);
    }


}

export const createBodies = () => {
    const bodies: { [key: string]: CelestialBody } = {};

    for (const [planet, body] of Object.entries(Bodies)) {
        bodies[planet] = new CelestialBody(body);
    }
    //bodies['sun'] = new CelestialBody(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 'sun');
    console.log(bodies);
    return bodies;
};
