import {
  evaluateZoning,
  type BuildingSession,
  type ZoningReport,
  irMassToMassLike,
} from "@opengeometry/floorkit";

export function checkZoning(
  session: BuildingSession,
): ZoningReport | undefined {
  const { site, buildings } = session.snapshot();

  if (!site?.boundary || !site.zoning) {
    return undefined;
  }

  const masses = buildings.flatMap((building) =>
    building.mass ? [irMassToMassLike(building)] : [],
  );

  const lot = {
    profile: site.boundary,
    lotLines: site.lotLines,
    elevation: site.elevation,
  };

  return evaluateZoning(lot, masses, site.zoning);
}
