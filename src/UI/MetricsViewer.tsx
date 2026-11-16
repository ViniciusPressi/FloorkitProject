import { useState, useEffect } from "react";
import { type BuildingSession } from "@opengeometry/floorkit";
import "../components/MassMetrics.css";
import {
  getMassQuantities,
  type MassQuantities,
} from "../Models/BuildingMetrics";

interface MassMetricsProps {
  session: BuildingSession;
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function MassMetrics({ session }: MassMetricsProps) {
  const [quantities, setQuantities] = useState<MassQuantities | undefined>(() =>
    getMassQuantities(session),
  );

  useEffect(() => {
    const updateMetrics = () => {
      setQuantities(getMassQuantities(session));
    };

    // Get the latest quantities when the component mounts.
    updateMetrics();

    // Subscribe to building changes.
    const unsubscribe = session.subscribe(updateMetrics);

    return unsubscribe;
  }, [session]);

  if (!quantities) {
    return (
      <div className="mass-metrics">
        <p>No building mass found.</p>
      </div>
    );
  }

  const metrics = [
    {
      label: "Footprint Area",
      value: formatNumber(quantities.footprintArea),
      unit: "m²",
    },
    {
      label: "Gross Floor Area",
      value: formatNumber(quantities.grossFloorArea),
      unit: "m²",
    },
    {
      label: "Gross Volume",
      value: formatNumber(quantities.grossVolume),
      unit: "m³",
    },
    {
      label: "Building Height",
      value: formatNumber(quantities.height),
      unit: "m",
    },
    {
      label: "Storeys",
      value: formatNumber(quantities.numberOfStoreys),
      unit: "",
    },
  ];

  return (
    <div className="mass-metrics">
      <h3>Building Metrics</h3>

      <div className="mass-metrics__list">
        {metrics.map((metric) => (
          <div className="mass-metrics__item" key={metric.label}>
            <span className="mass-metrics__label">{metric.label}</span>

            <span className="mass-metrics__value">
              {metric.value} {metric.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
