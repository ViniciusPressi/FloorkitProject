import type { BuildingModel } from "@opengeometry/floorkit";
import { storeys } from "./MassModel";

export class BaseModel implements BuildingModel {
  schema: BuildingModel["schema"] = "floorkit.building-model";
  version: BuildingModel["version"] = 3;
  units: BuildingModel["units"] = "meters";
  upAxis: BuildingModel["upAxis"] = "y";
  id = "my-first-building";

  buildings: BuildingModel["buildings"] = [
    {
      id: "building",
      storeys: storeys,
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
