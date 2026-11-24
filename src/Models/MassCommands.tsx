import {
  massSegmentHeightCommand,
  massSegmentColorCommand,
  type BuildingSession,
} from "@opengeometry/floorkit";

const BUILDING_ID = "building";

// Change the height of a mass segment
export function setSegmentHeight(
  session: BuildingSession,
  segmentId: string,
  height: number,
): void {
  const command = massSegmentHeightCommand(
    session.snapshot(),
    BUILDING_ID,
    segmentId,
    height,
  );

  if (command) {
    session.apply(command, session.revision);
  }
}

const originalSegmentColors = new Map<string, string | undefined>();
// Change or remove the color of a mass segment
export function setSegmentColor(
  session: BuildingSession,
  segmentId: string,
  color: string | undefined,
): void {
  const command = massSegmentColorCommand(
    session.snapshot(),
    BUILDING_ID,
    segmentId,
    color,
  );

  if (command) {
    session.apply(command, session.revision);
  }
}

export function setMassComplianceColor(
  session: BuildingSession,
  compliant: boolean,
): void {
  const building = session
    .snapshot()
    .buildings.find((building) => building.id === BUILDING_ID);

  if (!building?.mass) return;

  for (const segment of building.mass.segments) {
    // Store the original color only once.
    if (!originalSegmentColors.has(segment.id)) {
      originalSegmentColors.set(segment.id, segment.color);
    }
    const color = compliant ? originalSegmentColors.get(segment.id) : "#e05252";
    setSegmentColor(session, segment.id, color);
  }
}

// Change the ground floor to parking
export function makeGroundParking(session: BuildingSession): void {
  session.apply(
    {
      kind: "replace-storey-settings",
      buildingId: BUILDING_ID,
      storeyId: "ground",
      settings: {
        name: "Ground floor",
        elevation: 0,
        height: 4,
        usage: "parking",
        areaKind: "parking",
      },
    },
    session.revision,
  );
}

// Change the site's setback distance
export function setSetback(session: BuildingSession, metres: number): void {
  const site = session.snapshot().site;

  if (!site?.zoning) {
    throw new Error("The model has no site with zoning rules.");
  }

  const rules = site.zoning.rules.map((rule) =>
    rule.kind === "envelope-plane" ? { ...rule, offsetAtGrade: metres } : rule,
  );

  session.apply(
    {
      kind: "replace-site",
      site: {
        ...site,
        zoning: {
          ...site.zoning,
          rules,
        },
      },
    },
    session.revision,
  );
}

export function undoMassChange(session: BuildingSession): void {
  session.undo(session.revision);
}
