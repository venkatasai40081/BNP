// src/components/StatsCard.jsx
import React from "react";

const StatsCard = ({ title, value, delta }) => (
  <div className="stat-card">
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    {delta !== undefined && <div className="stat-delta">{delta}</div>}
  </div>
);

export default StatsCard;
