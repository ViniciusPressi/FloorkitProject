import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BuildingSession, Floorkit } from "@opengeometry/floorkit";
import wasmURL from "opengeometry/opengeometry_bg.wasm?url";
import { BaseModel } from "./Models/EmptyModel";
import { applyMassModel } from "./Models/MassModel";
import { getMassQuantities } from "./Models/BuildingMetrics";
import { MassEditorController } from "./DrawFunctions/MassEditorControl";
import { createRoot } from "react-dom/client";

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

  // Create the React editor
  const editorContainer = document.createElement("div");
  editorContainer.style.position = "fixed";
  editorContainer.style.top = "20px";
  editorContainer.style.left = "20px";
  editorContainer.style.zIndex = "1000";
  document.body.appendChild(editorContainer);
  createRoot(editorContainer).render(
    <MassEditorController session={session} />,
  );

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
