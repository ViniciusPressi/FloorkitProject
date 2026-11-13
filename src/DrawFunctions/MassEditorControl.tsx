import { useState } from "react";
import type { BuildingSession } from "@opengeometry/floorkit";

import { mass, storeys } from "../Models/MassModel";

import {
  resizeFootprint,
  moveFootprint,
  applyFootprintChange,
} from "../Models/EditCommands";

import { MassEditor } from "./MassEditor";

interface MassEditorControllerProps {
  session: BuildingSession;
}

export function MassEditorController({ session }: MassEditorControllerProps) {
  const [currentMass, setCurrentMass] = useState(mass);

  function getSegmentOptions() {
    return currentMass.segments.map((segment) => {
      const ring = segment.footprint.outerRing;

      const xs = ring.map(([x]) => x);
      const zs = ring.map(([, z]) => z);

      return {
        id: segment.id,
        label: segment.id,
        width: Math.max(...xs) - Math.min(...xs),
        depth: Math.max(...zs) - Math.min(...zs),
      };
    });
  }

  function handleResize(segmentId: string, width: number, depth: number) {
    const updatedMass = resizeFootprint(currentMass, segmentId, width, depth);

    applyFootprintChange(session, updatedMass, storeys);
    setCurrentMass(updatedMass);
  }

  function handleMove(segmentId: string, offsetX: number, offsetZ: number) {
    const updatedMass = moveFootprint(currentMass, segmentId, offsetX, offsetZ);

    applyFootprintChange(session, updatedMass, storeys);
    setCurrentMass(updatedMass);
  }

  return (
    <MassEditor
      segments={getSegmentOptions()}
      onResize={handleResize}
      onMove={handleMove}
    />
  );
}
