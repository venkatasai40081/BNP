// src/components/SentimentChart.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export const LineSentiment = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} />
      <Tooltip />
      <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export const CategoryBar = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="category" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" barSize={18} />
    </BarChart>
  </ResponsiveContainer>
);
