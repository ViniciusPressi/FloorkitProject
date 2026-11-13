import { Building, type BuildingSession } from "@opengeometry/floorkit";

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
