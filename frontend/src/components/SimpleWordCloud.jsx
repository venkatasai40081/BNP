// src/components/SimpleWordCloud.jsx
import React from "react";

const SimpleWordCloud = ({ words = [], onWordClick }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "6px" }}>
      {words.map((word, index) => (
        <button
          key={index}
          onClick={() => onWordClick && onWordClick(word)}
          style={{
            border: "none",
            background: "transparent",
            cursor: onWordClick ? "pointer" : "default",
            fontSize: `${10 + (word.value || 1) * 2}px`,
            fontWeight: 700,
            color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 45%)`,
            padding: "2px 6px",
          }}
        >
          {word.text}
        </button>
      ))}
    </div>
  );
};

export default SimpleWordCloud;
