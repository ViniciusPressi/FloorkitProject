import { useState, useEffect } from "react";

type SegmentOption = {
  id: string;
  label: string;
  width: number;
  depth: number;
};

type MassEditorProps = {
  segments: SegmentOption[];
  onResize: (segmentId: string, width: number, depth: number) => void;
  onMove: (segmentId: string, offsetX: number, offsetZ: number) => void;
};

export function MassEditor({ segments, onResize, onMove }: MassEditorProps) {
  const [selectedId, setSelectedId] = useState("tower");
  const [width, setWidth] = useState(8);
  const [depth, setDepth] = useState(6);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetZ, setOffsetZ] = useState(0);

  useEffect(() => {
    const segment = segments.find((item) => item.id === selectedId);

    if (segment) {
      setWidth(segment.width);
      setDepth(segment.depth);
    }
  }, [segments, selectedId]);

  function handleSegmentChange(id: string) {
    setSelectedId(id);

    const segment = segments.find((item) => item.id === id);

    if (segment) {
      setWidth(segment.width);
      setDepth(segment.depth);
      setOffsetX(0);
      setOffsetZ(0);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontSize: "13px",
  };

  const sectionStyle = {
    marginBottom: "16px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "9px",
    border: "none",
    borderRadius: "4px",
    background: "#252525",
    color: "white",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        width: "260px",
        padding: "18px",
        background: "white",
        color: "#222",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(32, 7, 7, 0.15)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Mass editor</h3>

      <div style={sectionStyle}>
        <label style={labelStyle}>Building segment</label>

        <select
          style={inputStyle}
          value={selectedId}
          onChange={(event) => handleSegmentChange(event.target.value)}
        >
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {segment.label}
            </option>
          ))}
        </select>
      </div>

      <h4>Footprint dimensions</h4>

      <div style={sectionStyle}>
        <label style={labelStyle}>Width (m)</label>
        <input
          type="number"
          min="0.1"
          step="0.5"
          style={inputStyle}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Depth (m)</label>
        <input
          type="number"
          min="0.1"
          step="0.5"
          style={inputStyle}
          value={depth}
          onChange={(event) => setDepth(Number(event.target.value))}
        />
      </div>

      <button
        style={buttonStyle}
        onClick={() => onResize(selectedId, width, depth)}
      >
        Apply dimensions
      </button>

      <h4>Position</h4>

      <div style={sectionStyle}>
        <label style={labelStyle}>Offset X (m)</label>
        <input
          type="number"
          step="0.5"
          style={inputStyle}
          value={offsetX}
          onChange={(event) => setOffsetX(Number(event.target.value))}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Offset Z (m)</label>
        <input
          type="number"
          step="0.5"
          style={inputStyle}
          value={offsetZ}
          onChange={(event) => setOffsetZ(Number(event.target.value))}
        />
      </div>

      <button
        style={buttonStyle}
        onClick={() => onMove(selectedId, offsetX, offsetZ)}
      >
        Apply position
      </button>
    </div>
  );
}
