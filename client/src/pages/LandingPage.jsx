import { useState } from "react";
import { REGIONS } from "../data/regions";

export default function LandingPage({ onBegin }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [role, setRole] = useState("");

  const canBegin = selectedRegion && role.trim().length > 0;

  return (
    <div className="landing">
      <div className="landing-header">
        <h1 className="title">🌐 World Ready</h1>
        <p className="subtitle">Master interviews across cultures. Choose your region and step into the room.</p>
      </div>

      <div className="region-grid">
        {Object.entries(REGIONS).map(([key, region]) => (
          <button
            key={key}
            className={`region-card ${selectedRegion === key ? "selected" : ""}`}
            onClick={() => setSelectedRegion(key)}
          >
            <span className="region-flag">{region.flag}</span>
            <span className="region-name">{region.name}</span>
            <span className="region-style-tag">{region.styleTag}</span>
          </button>
        ))}
      </div>

      <div className="role-input-section">
        <label className="input-label">Your Job Role</label>
        <input
          className="role-input"
          type="text"
          placeholder="e.g. Software Engineer, Product Manager…"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <button
        className={`begin-btn ${canBegin ? "active" : "disabled"}`}
        disabled={!canBegin}
        onClick={() => onBegin(selectedRegion, role.trim())}
      >
        Begin Interview →
      </button>
    </div>
  );
}
