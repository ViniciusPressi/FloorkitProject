import type { BuildingModel } from "@opengeometry/floorkit";

export class BaseModel implements BuildingModel {
  schema: BuildingModel["schema"] = "floorkit.building-model";
  version: BuildingModel["version"] = 3;
  units: BuildingModel["units"] = "meters";
  upAxis: BuildingModel["upAxis"] = "y";
  id = "my-first-building";

  buildings: BuildingModel["buildings"] = [
    {
      id: "building",
      storeys: [
        {
          id: "ground",
          elevation: 0,
          height: 3,
          walls: [
            {
              id: "outer-walls",
              points: [
                [0, 0],
                [6, 0],
                [6, 4],
                [0, 4],
              ],
              closed: true,
              thickness: 0.2,
              openings: [
                {
                  id: "front-door",
                  kind: "door",
                  offset: 1.5,
                  width: 0.9,
                  height: 2.1,
                },
                {
                  id: "front-window",
                  kind: "window",
                  offset: 4.2,
                  width: 1.2,
                  height: 1.2,
                  sillHeight: 0.9,
                },
              ],
            },
          ],
          slabs: [
            {
              id: "ground-floor",
              profile: {
                outerRing: [
                  [-0.1, -0.1],
                  [6.1, -0.1],
                  [6.1, 4.1],
                  [-0.1, 4.1],
                ],
              },
              thickness: 0.2,
              baseOffset: -0.2,
            },
          ],
        },
        {
          id: "first",
          elevation: 3.2,
          height: 3,
          walls: [
            {
              id: "outer-walls-1",
              points: [
                [0, 0],
                [6, 0],
              ],
              closed: false,
              thickness: 0.2,
              openings: [
                {
                  id: "front-window-1",
                  kind: "window",
                  offset: 4.2,
                  width: 2,
                  height: 1.2,
                  sillHeight: 0.9,
                },
              ],
            },
            {
              id: "outer-walls-2",
              points: [
                [6, 0],
                [6, 4],
              ],
              closed: false,
              thickness: 0.2,
              openings: [
                {
                  id: "front-window-2",
                  kind: "window",
                  offset: 2,
                  width: 2,
                  height: 1.2,
                  sillHeight: 0.9,
                },
              ],
            },
          ],
          slabs: [
            {
              id: "first-floor",
              profile: {
                outerRing: [
                  [-0.1, -0.1],
                  [6.1, -0.1],
                  [6.1, 4.1],
                  [-0.1, 4.1],
                ],
              },
              thickness: 0.2,
              baseOffset: -0.2,
            },
          ],
        },
      ],
    },
  ];

  // Example method: change a storey height
  setStoreyHeight(storeyId: string, height: number) {
    const storey = this.buildings[0].storeys.find(
      (storey) => storey.id === storeyId,
    );

    if (storey) {
      storey.height = height;
    }
  }

  // Example method: add a storey
  addStorey(storey: BuildingModel["buildings"][number]["storeys"][number]) {
    this.buildings[0].storeys.push(storey);
  }

  // Return the model data
  getModel(): BuildingModel {
    return this;
  }
}
