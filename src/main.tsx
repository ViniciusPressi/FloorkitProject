import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  BuildingSession,
  Floorkit,
  GUIEditor,
  bindManagedSceneEditor,
} from "@opengeometry/floorkit";
import wasmURL from "opengeometry/opengeometry_bg.wasm?url";
import { BaseModel } from "./Models/EmptyModel";
import { applyMassModel } from "./Models/MassModel";
import { getMassQuantities } from "./Models/BuildingMetrics";
import { MassMetrics } from "./UI/MetricsViewer";
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
  console.log("Current model sites:", session.snapshot().site);

  const unsubscribe = session.subscribe(() => {
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
  });

  scene.add(session.root);

  // Initialize the Floorkit 3D editor
  const editor = new GUIEditor(container, camera, controls);
  // Enable selection in the Three.js scene
  editor.enablePicking(session.root);
  bindManagedSceneEditor(editor, session, {
    onError: (error) => {
      console.error("Floorkit rejected the edit:", error);
    },
  });

  // Create the React metrics viewer
  const metricsContainer = document.createElement("div");
  metricsContainer.style.position = "fixed";
  metricsContainer.style.top = "20px";
  metricsContainer.style.left = "20px";
  metricsContainer.style.zIndex = "1000";
  document.body.appendChild(metricsContainer);
  createRoot(metricsContainer).render(<MassMetrics session={session} />);

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
    editor.update();
    renderer.render(scene, camera);
  });
}

main().catch((error: unknown) => console.error(error));
