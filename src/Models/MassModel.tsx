import {
  type BmMass,
  type BmStorey,
  type BuildingSession,
  type ZoningRuleSet,
} from "@opengeometry/floorkit";

const BUILDING_ID = "building";

// Storeys
export const storeys: BmStorey[] = [
  {
    id: "ground",
    name: "Ground floor",
    elevation: 0,
    height: 4,
    usage: "retail",
  },
  {
    id: "first",
    name: "First floor",
    elevation: 4,
    height: 3,
    usage: "residential",
  },
  {
    id: "second",
    name: "Second floor",
    elevation: 7,
    height: 3,
    usage: "residential",
  },
];

// Mass geometry
export const mass: BmMass = {
  id: "building-mass",
  elevation: 0,
  segments: [
    {
      id: "podium",
      footprint: {
        outerRing: [
          [0, 0],
          [12, 0],
          [12, 8],
          [0, 8],
        ],
      },
      height: 4,
      use: "retail",
      storeyIds: ["ground"],
      color: "#4e809c",
    },
    {
      id: "tower",
      footprint: {
        outerRing: [
          [2, 1],
          [10, 1],
          [10, 7],
          [2, 7],
        ],
      },
      height: 6,
      use: "residential",
      storeyIds: ["first", "second"],
      color: "#7dcbf8",
    },
  ],
};

// Zoning
export const zoning: ZoningRuleSet = {
  id: "guide-rules",
  rules: [
    {
      kind: "ratio-cap",
      id: "far",
      quantity: "floorAreaRatio",
      max: 0.35,
    },
    {
      kind: "envelope-plane",
      id: "setback",
      edgeClass: "all",
      offsetAtGrade: 3,
    },
  ],
};

// Apply mass to session
export function applyMassModel(session: BuildingSession): void {
  session.apply(
    {
      kind: "replace-site",
      site: {
        id: "lot",
        boundary: {
          outerRing: [
            [-4, -4],
            [30, -4],
            [30, 14],
            [-4, 14],
          ],
        },
        zoning,
      },
    },
    session.revision,
  );

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
