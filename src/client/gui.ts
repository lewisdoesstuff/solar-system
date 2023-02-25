import { GUI } from 'dat.gui';
import { runtimeConfig } from './runtimeConfig';
import { findBody, getBodies } from './bodies';
import { moveCamera } from './camera';
import { scene } from './client';
export const createGUI = (gui: GUI) => {
    const simulationSettings = gui.addFolder('Simulation Settings');
    simulationSettings.add(runtimeConfig.simulation, 'timeStep', 0, 10000, 1).listen();
    simulationSettings.open();
    const cameraSettings = gui.addFolder('Camera Settings');
    const follow: { name: string } = { name: '' };
    const followTargetFolder = cameraSettings.addFolder('Follow Target');
    followTargetFolder.add(follow, 'name', getBodies()).onChange(updateFollowing)
    cameraSettings.open()
    followTargetFolder.open();
    return gui;
};

const updateFollowing = (name: string) => {
    const body = scene.getObjectByName(name)
    if (!body) return;
    moveCamera(body);
};