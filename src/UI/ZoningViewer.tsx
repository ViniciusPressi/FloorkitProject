import { useState, useEffect } from "react";
import {
  type BuildingSession,
  type ZoningReport,
} from "@opengeometry/floorkit";

import "../components/ZoningMetrics.css";
import { setMassComplianceColor } from "../Models/MassCommands";
import { checkZoning } from "../Zoning/ZoningValidation";

interface ZoningMetricsProps {
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

function formatLabel(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ZoningMetricsViewer({ session }: ZoningMetricsProps) {
  const [report, setReport] = useState<ZoningReport | undefined>(() =>
    checkZoning(session),
  );

  useEffect(() => {
    let previousCompliance: boolean | undefined;
    let pendingColor: boolean | undefined;
    let scheduled = false;

    const updateZoning = () => {
      const nextReport = checkZoning(session);

      setReport(nextReport);

      if (!nextReport) return;

      if (nextReport.compliant === previousCompliance) return;

      previousCompliance = nextReport.compliant;
      pendingColor = nextReport.compliant;

      if (scheduled) return;

      scheduled = true;

      queueMicrotask(() => {
        scheduled = false;

        if (pendingColor === undefined) return;

        const compliant = pendingColor;
        pendingColor = undefined;

        setMassComplianceColor(session, compliant);
      });
    };

    updateZoning();

    const unsubscribe = session.subscribe(updateZoning);

    return unsubscribe;
  }, [session]);

  if (!report) {
    return (
      <div className="zoning-metrics">
        <p>No zoning information available.</p>
      </div>
    );
  }

  const { compliant, violations, metrics } = report;

  const metricItems = [
    {
      label: "Floor Area Ratio",
      value: formatNumber(metrics.floorAreaRatio),
      unit: "",
    },
    {
      label: "Site Coverage",
      value: formatNumber(metrics.siteCoverage),
      unit: "%",
    },
    {
      label: "Gross Floor Area",
      value: formatNumber(metrics.grossFloorArea),
      unit: "m²",
    },
    {
      label: "Counted Floor Area",
      value: formatNumber(metrics.countedFloorArea),
      unit: "m²",
    },
    {
      label: "Volume Ratio",
      value: formatNumber(metrics.volumeRatio),
      unit: "",
    },
    {
      label: "Maximum Height",
      value: formatNumber(metrics.maxHeight),
      unit: "m",
    },
  ];

  return (
    <div className="zoning-metrics">
      <h3>Zoning Analysis</h3>

      <div
        className={`zoning-metrics__status ${
          compliant
            ? "zoning-metrics__status--success"
            : "zoning-metrics__status--error"
        }`}
      >
        {compliant ? "Compliant" : "Non-compliant"}
      </div>

      <div className="zoning-metrics__list">
        {metricItems.map((metric) => (
          <div className="zoning-metrics__item" key={metric.label}>
            <span className="zoning-metrics__label">{metric.label}</span>

            <span className="zoning-metrics__value">
              {metric.value} {metric.unit}
            </span>
          </div>
        ))}
      </div>

      <div className="zoning-metrics__violations">
        <h4>Violations ({violations.length})</h4>

        {violations.length === 0 ? (
          <p>No zoning violations detected.</p>
        ) : (
          <ul>
            {violations.map((violation, index) => (
              <li
                key={`${violation.ruleId ?? violation.type}-${index}`}
                className="zoning-metrics__violation"
              >
                <strong>{formatLabel(violation.type)}</strong>

                <p>{violation.message}</p>

                {violation.massId && <span>Mass: {violation.massId}</span>}

                {violation.current !== undefined && (
                  <span>Current: {formatNumber(violation.current)}</span>
                )}

                {violation.limit !== undefined && (
                  <span>Limit: {formatNumber(violation.limit)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
