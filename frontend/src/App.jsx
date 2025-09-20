// src/App.jsx
import React, { useState, useCallback } from "react";
import "./App.css";

import StatsCard from "./components/StatsCard";
import SimpleWordCloud from "./components/SimpleWordCloud";
import { LineSentiment, CategoryBar } from "./components/Sentiment";  // <-- matches Sentiment.jsx
import NewsList from "./components/Newslist";                          // <-- matches Newslist.jsx
import DataTable from "./components/Datatable";                        // <-- matches Datatable.jsx
import useRealtime from "./hooks/useRealtime";


function App() {
  const [kpis, setKpis] = useState([
    { title: "Overall Sentiment", value: "0.72", delta: "+4.5%" },
    { title: "Articles (24h)", value: 134, delta: "+8%" },
    { title: "Positive Mentions", value: 87 },
    { title: "Negative Mentions", value: 47 },
  ]);

  const [timeseries, setTimeseries] = useState([
    { time: "09:00", score: 0.4 },
    { time: "10:00", score: 0.5 },
    { time: "11:00", score: 0.65 },
  ]);

  const [categoryData, setCategoryData] = useState([
    { category: "Tech", count: 45 },
    { category: "Finance", count: 32 },
  ]);

  const [wordCloudData, setWordCloudData] = useState([
    { text: "Market", value: 8 },
    { text: "AI", value: 7 },
    { text: "Earnings", value: 4 },
  ]);

  const [news, setNews] = useState([
    { title: "Stocks rally on positive earnings", source: "Reuters", time: "1h ago" },
  ]);

  const [tableRows, setTableRows] = useState([
    { symbol: "AAPL", price: "$188.22", sentiment: "Positive" },
    { symbol: "TSLA", price: "$273.90", sentiment: "Neutral" },
  ]);

  const handleRealtime = useCallback((event, payload) => {
    switch (event) {
      case "timeseries:new":
        setTimeseries((prev) => {
          const next = [...prev, payload].slice(-30);
          return next;
        });
        break;
      case "kpis:update":
        setKpis([
          { title: "Overall Sentiment", value: payload.overall },
          { title: "Articles (24h)", value: payload.articles24h },
          { title: "Positive Mentions", value: payload.positive },
          { title: "Negative Mentions", value: payload.negative },
        ]);
        break;
      case "wordcloud:update":
        setWordCloudData(payload);
        break;
      case "news:new":
        setNews((prev) => [payload, ...prev].slice(0, 12));
        break;
      case "table:update":
        setTableRows(payload);
        break;
      case "snapshot":
        if (payload.kpis) {
          setKpis([
            { title: "Overall Sentiment", value: payload.kpis.overall },
            { title: "Articles (24h)", value: payload.kpis.articles24h },
            { title: "Positive Mentions", value: payload.kpis.positive },
            { title: "Negative Mentions", value: payload.kpis.negative },
          ]);
        }
        if (payload.timeseries) setTimeseries(payload.timeseries);
        if (payload.wordcloud) setWordCloudData(payload.wordcloud);
        if (payload.news) setNews(payload.news);
        if (payload.table) setTableRows(payload.table);
        break;
      default:
        console.log("unhandled realtime event:", event, payload);
    }
  }, []);

  useRealtime(handleRealtime);

  // click-to-filter: when clicking a word, filter timeseries or just log (basic)
  const onWordClick = (word) => {
    // TODO: implement filter. For now, just log and optionally set a small visual state.
    console.log("word clicked:", word);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Market Sentiment — Real Time</h1>
      </header>

      <section className="kpi-row">
        {kpis.map((k, i) => (
          <StatsCard key={i} title={k.title} value={k.value} delta={k.delta} />
        ))}
      </section>

      <section className="grid">
        <div className="card chart-card">
          <h3>Sentiment Over Time</h3>
          <LineSentiment data={timeseries} />
        </div>

        <div className="card chart-card">
          <h3>Category Breakdown</h3>
          <CategoryBar data={categoryData} />
        </div>

        <div className="card wordcloud-card">
          <h3>Top Terms</h3>
          <SimpleWordCloud words={wordCloudData} onWordClick={onWordClick} />
        </div>

        <div className="card news-card">
          <h3>Latest News</h3>
          <NewsList items={news} />
        </div>

        <div className="card table-card">
          <h3>Symbols</h3>
          <DataTable rows={tableRows} />
        </div>
      </section>
    </div>
  );
}

export default App;
