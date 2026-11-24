import { useState, useEffect } from "react";
import { type BuildingSession } from "@opengeometry/floorkit";
import "../components/MassMetrics.css";
import {
  getMassQuantities,
  type MassQuantities,
  getSiteCoverage,
  getMassCa,
} from "../Models/BuildingMetrics";
import { mass } from "../Models/MassModel";

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
  const [siteCoverage, setSiteCoverage] = useState<number | undefined>(() =>
    getSiteCoverage(session),
  );
  const [massCa, setMassCa] = useState<number | undefined>(() =>
    getMassCa(session),
  );

  useEffect(() => {
    const updateMetrics = () => {
      setQuantities(getMassQuantities(session));
      setSiteCoverage(getSiteCoverage(session));
      setMassCa(getMassCa(session));
    };

    updateMetrics();

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
      label: "Floor Area Ratio",
      value: massCa !== undefined ? formatNumber(massCa) : "—",
      unit: "",
    },
    {
      label: "Site Coverage",
      value: siteCoverage !== undefined ? formatNumber(siteCoverage) : "—",
      unit: "%",
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
