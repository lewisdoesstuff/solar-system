import * as THREE from 'three';
import { scene } from './client';

export const createStars = () => {
    const starCount = 1000;
    const starGeometry = new THREE.BufferGeometry();

    const starVertices: number[] = [];
    const colors: number[] = [];
    // create random star positions
    for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(2e3);
        const y = THREE.MathUtils.randFloatSpread(2e3);
        const z = THREE.MathUtils.randFloatSpread(2e3);
        // push only if star is not too close to the origin
        if (x * x + y * y + z * z > 1e5) {
            starVertices.push(x, y , z);
        }

       // starVertices.push(x, y , z);

        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.1, 0.5);
        colors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const starsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: 0.5 });

    const stars = new THREE.Points(starGeometry, starsMaterial);
    stars.renderOrder = -1;
    scene.add(stars);
    
};
