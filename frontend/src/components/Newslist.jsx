// src/components/NewsList.jsx
import React from "react";

const NewsList = ({ items = [] }) => {
  return (
    <div className="news-list">
      {items.map((it, i) => (
        <div key={i} className="news-item">
          <div className="news-title">{it.title}</div>
          <div className="news-meta">{it.source} • {it.time}</div>
        </div>
      ))}
    </div>
  );
};

export default NewsList;
