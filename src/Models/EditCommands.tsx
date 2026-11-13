import {
  type BmMass,
  type BmStorey,
  type BuildingSession,
} from "@opengeometry/floorkit";

type Footprint = BmMass["segments"][number]["footprint"];
type Point2D = Footprint["outerRing"][number];

const BUILDING_ID = "building";

// Find a segment by its ID
function findSegment(mass: BmMass, segmentId: string) {
  const segment = mass.segments.find((item) => item.id === segmentId);

  if (!segment) {
    throw new Error(`Segment "${segmentId}" not found.`);
  }

  return segment;
}

// Generate a rectangular footprint around a center point
function createRectangle(
  centerX: number,
  centerZ: number,
  width: number,
  depth: number,
): Footprint["outerRing"] {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  const points: Point2D[] = [
    [centerX - halfWidth, centerZ - halfDepth],
    [centerX + halfWidth, centerZ - halfDepth],
    [centerX + halfWidth, centerZ + halfDepth],
    [centerX - halfWidth, centerZ + halfDepth],
  ];

  return points;
}

// Resize a rectangular footprint, keeping its center fixed
export function resizeFootprint(
  mass: BmMass,
  segmentId: string,
  width: number,
  depth: number,
): BmMass {
  if (width <= 0 || depth <= 0) {
    throw new Error("Width and depth must be greater than zero.");
  }

  const segment = findSegment(mass, segmentId);
  const ring = segment.footprint.outerRing;

  const minX = Math.min(...ring.map(([x]) => x));
  const maxX = Math.max(...ring.map(([x]) => x));
  const minZ = Math.min(...ring.map(([, z]) => z));
  const maxZ = Math.max(...ring.map(([, z]) => z));

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const outerRing = createRectangle(centerX, centerZ, width, depth);

  return {
    ...mass,
    segments: mass.segments.map((item) =>
      item.id === segmentId
        ? {
            ...item,
            footprint: {
              ...item.footprint,
              outerRing,
            },
          }
        : item,
    ),
  };
}

// Move a footprint without changing its dimensions
export function moveFootprint(
  mass: BmMass,
  segmentId: string,
  offsetX: number,
  offsetZ: number,
): BmMass {
  findSegment(mass, segmentId);

  return {
    ...mass,
    segments: mass.segments.map((item) =>
      item.id === segmentId
        ? {
            ...item,
            footprint: {
              ...item.footprint,
              outerRing: item.footprint.outerRing.map(([x, z]): Point2D => [
                x + offsetX,
                z + offsetZ,
              ]),
            },
          }
        : item,
    ),
  };
}

// Apply the updated mass to Floorkit
export function applyFootprintChange(
  session: BuildingSession,
  mass: BmMass,
  storeys: BmStorey[],
): void {
  session.apply(
    {
      kind: "replace-mass",
      buildingId: BUILDING_ID,
      mass,
      storeys,
    },
    session.revision,
  );
}
