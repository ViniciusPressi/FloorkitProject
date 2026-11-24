import {
  Building,
  type BuildingSession,
  type PolygonProfile,
} from "@opengeometry/floorkit";

const MASS_ID = "building-mass";

export type MassQuantities = ReturnType<Building["quantities"]>;

export function getMassQuantities(
  session: BuildingSession,
): MassQuantities | undefined {
  const element = session.currentBuild.elementsById.get(MASS_ID);

  if (!(element instanceof Building)) {
    return undefined;
  }

  return element.quantities();
}

function getRingArea(ring: PolygonProfile["outerRing"]): number {
  if (ring.length < 3) return 0;

  let area = 0;

  for (let i = 0; i < ring.length; i++) {
    const current = ring[i];
    const next = ring[(i + 1) % ring.length];

    area += current[0] * next[1] - next[0] * current[1];
  }

  return Math.abs(area) / 2;
}

export function getPolygonArea(polygon: PolygonProfile): number {
  const outerArea = getRingArea(polygon.outerRing);

  const holesArea = (polygon.holes ?? []).reduce(
    (total, hole) => total + getRingArea(hole),
    0,
  );

  return Math.max(0, outerArea - holesArea);
}

export function getMassCa(session: BuildingSession): number | undefined {
  const model = session.snapshot();

  const site = model.site;

  if (!site?.boundary) {
    return undefined;
  }

  const massQuantities = getMassQuantities(session);

  if (!massQuantities) {
    return undefined;
  }

  const siteArea = getPolygonArea(site.boundary);

  if (siteArea <= 0) {
    return undefined;
  }

  return massQuantities.grossFloorArea / siteArea;
}

export function getSiteCoverage(session: BuildingSession): number | undefined {
  const model = session.snapshot();

  const site = model.site;

  if (!site?.boundary) {
    return undefined;
  }

  const massQuantities = getMassQuantities(session);

  if (!massQuantities) {
    return undefined;
  }

  const siteArea = getPolygonArea(site.boundary);

  if (siteArea <= 0) {
    return undefined;
  }

  return (massQuantities.footprintArea / siteArea) * 100;
}
