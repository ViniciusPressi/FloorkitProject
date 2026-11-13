import * as THREE from "three";

export class WallDrawingTool {
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  private raycaster = new THREE.Raycaster();

  // Horizontal drawing plane (Y = 0)
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  private startPoint: THREE.Vector3 | null = null;

  private previewLine: THREE.Line;

  private onComplete: (start: THREE.Vector3, end: THREE.Vector3) => void;

  constructor(
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    onComplete: (start: THREE.Vector3, end: THREE.Vector3) => void,
  ) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.onComplete = onComplete;

    // Create preview line
    const geometry = new THREE.BufferGeometry();

    geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

    const material = new THREE.LineBasicMaterial({
      color: 0x2196f3,
      linewidth: 2,
    });

    this.previewLine = new THREE.Line(geometry, material);

    this.previewLine.visible = false;

    this.scene.add(this.previewLine);

    // Register mouse events
    this.renderer.domElement.addEventListener(
      "pointerdown",
      this.handlePointerDown,
    );

    this.renderer.domElement.addEventListener(
      "pointermove",
      this.handlePointerMove,
    );
  }

  // Convert mouse position into a 3D point
  private getPoint(event: PointerEvent): THREE.Vector3 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();

    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    this.raycaster.setFromCamera(mouse, this.camera);

    const point = new THREE.Vector3();

    const intersection = this.raycaster.ray.intersectPlane(
      this.groundPlane,
      point,
    );

    return intersection ? point : null;
  }

  // Handle first and second clicks
  private handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;

    const point = this.getPoint(event);

    if (!point) return;

    // First click: define wall start
    if (!this.startPoint) {
      this.startPoint = point.clone();
      this.previewLine.visible = true;
      return;
    }

    // Second click: complete wall
    this.onComplete(this.startPoint.clone(), point.clone());

    this.startPoint = null;
    this.previewLine.visible = false;
  };

  // Update preview line while moving the mouse
  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.startPoint) return;

    const point = this.getPoint(event);

    if (!point) return;

    this.previewLine.geometry.setFromPoints([this.startPoint, point]);
  };

  // Cancel current drawing operation
  cancel(): void {
    this.startPoint = null;
    this.previewLine.visible = false;
  }

  // Remove event listeners and preview geometry
  dispose(): void {
    this.renderer.domElement.removeEventListener(
      "pointerdown",
      this.handlePointerDown,
    );

    this.renderer.domElement.removeEventListener(
      "pointermove",
      this.handlePointerMove,
    );

    this.scene.remove(this.previewLine);

    this.previewLine.geometry.dispose();

    (this.previewLine.material as THREE.Material).dispose();

    this.startPoint = null;
  }
}
