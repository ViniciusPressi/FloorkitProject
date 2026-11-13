import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BuildingSession, Floorkit } from "@opengeometry/floorkit";
import wasmURL from "opengeometry/opengeometry_bg.wasm?url";
import { BaseModel } from "./Models/EmptyModel";
import { applyMassModel, mass, storeys } from "./Models/MassModel";
import { getMassQuantities } from "./Models/BuildingMetrics";
import {
  setSegmentHeight,
  setSegmentColor,
  makeGroundParking,
  setSetback,
} from "./Models/MassCommands";
import {
  resizeFootprint,
  moveFootprint,
  applyFootprintChange,
} from "./Models/EditCommands";
//import { WallDrawingTool } from "./DrawFunctions/DrawWall";

const model = new BaseModel();

async function main(): Promise<void> {
  const container = document.getElementById("app");
  if (!container) throw new Error("The #app element is missing.");
  await new Floorkit().setupOpenGeometry(wasmURL);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3f4f6);
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(4, 8, 6);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(17, 13, 17);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(6, 5, 4);

  const session = new BuildingSession(model); //EMPTY MODEL
  applyMassModel(session); //CREATE MODEL MASS

  // Increase the tower height to 9 meters
  //setSegmentHeight(session, "tower", 12);

  // Change the podium color
  //setSegmentColor(session, "podium", "#d98c5f");

  // Change the ground floor to parking
  //makeGroundParking(session);

  // Change the setback to 5 meters
  //setSetback(session, 5);
  // Keep a reference to the latest mass data

  // EDIT COMMANDS
  let currentMass = mass;
  // Resize the tower from 8 x 6 m to 10 x 8 m
  //currentMass = resizeFootprint(currentMass, "tower", 10, 8);

  //applyFootprintChange(session, currentMass, storeys);

  // Move the tower 1 meter along X
  //currentMass = moveFootprint(currentMass, "tower", 1, 0);

  //applyFootprintChange(session, currentMass, storeys);

  const quantities = getMassQuantities(session);
  if (quantities) {
    console.table({
      "Footprint area": quantities.footprintArea,
      "Gross floor area": quantities.grossFloorArea,
      "Gross volume": quantities.grossVolume,
      Height: quantities.height,
      "Number of storeys": quantities.numberOfStoreys,
    });
  }

  scene.add(session.root);

  const resize = (): void => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
}

main().catch((error: unknown) => console.error(error));
