// src/components/DataTable.jsx
import React from "react";

const DataTable = ({ rows = [] }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Price</th>
          <th>Sentiment</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.symbol}</td>
            <td>{r.price}</td>
            <td>{r.sentiment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
