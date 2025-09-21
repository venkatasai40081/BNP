// MarketSentimentDashboard.jsx
// Modern, responsive real-time sentiment dashboard (React)
// TailwindCSS, Recharts, Framer Motion, Lucide React, shadcn/ui (optional)
// Place this file in your React app's src/components/ directory

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card"; // optional - shadcn style placeholder
import { Search, RefreshCw, TrendingUp, Cloud, Feath } from "lucide-react"; // icons

const MOCK_WORDS = [
  "inflation",
  "beat",
  "miss",
  "upgrade",
  "downgrade",
  "recession",
  "earnings",
  "acquisition",
  "risk",
  "growth",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockTrend(days = 30) {
  const data = [];
  let base = 50;
  for (let i = days - 1; i >= 0; i--) {
    base += randomInt(-6, 6);
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      score: Math.max(0, Math.min(100, base)),
    });
  }
  return data;
}

function generateMockSentiment() {
  return {
    overall: +(Math.random() * 5).toFixed(2),
    social: +(Math.random() * 5).toFixed(2),
    news: +(Math.random() * 5).toFixed(2),
    econ: +(Math.random() * 5).toFixed(2),
  };
}

function generateMockNews(count = 6) {
  const titles = [
    "Quarterly earnings beat expectations",
    "Central bank announces policy shift",
    "Geopolitical tension rises in region",
    "Major acquisition announced",
    "Unexpected economic data release",
    "Analyst upgrades stock to buy",
  ];
  const news = [];
  for (let i = 0; i < count; i++) {
    news.push({
      id: i,
      title: titles[i % titles.length],
      source: ["Bloomberg", "Reuters", "Twitter", "WSJ"][i % 4],
      time: new Date(Date.now() - randomInt(1, 60) * 60000).toLocaleString(),
      snippet:
        "This is a short snippet of the news article to give context for sentiment.",
    });
  }
  return news;
}

export default function MarketSentimentDashboard() {
  const [symbol, setSymbol] = useState("AAPL");
  const [trendRange, setTrendRange] = useState("30");
  const [sentiment, setSentiment] = useState(generateMockSentiment());
  const [trendData, setTrendData] = useState(generateMockTrend(30));
  const [news, setNews] = useState(generateMockNews());
  const [wordCloud, setWordCloud] = useState(MOCK_WORDS);
  const [intervalMins, setIntervalMins] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [recommendation, setRecommendation] = useState({
    action: "HOLD",
    confidence: 64,
    explanation:
      "Mock recommendation: The model sees balanced news and social signals, resulting in a neutral stance.",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function fetchSentimentData(inputSymbol) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const s = generateMockSentiment();
    const t = generateMockTrend(+trendRange);
    const n = generateMockNews(6 + randomInt(0, 6));
    const wc = MOCK_WORDS
      .map((w) => w + (Math.random() > 0.6 ? " 🔥" : ""))
      .sort(() => Math.random() - 0.5);
    setSentiment(s);
    setTrendData(t);
    setNews(n);
    setWordCloud(wc);
    setLastUpdated(new Date());
    const recScore = (s.overall / 5) * 100 + randomInt(-10, 10);
    let action = "HOLD";
    if (recScore > 66) action = "BUY";
    else if (recScore < 34) action = "SELL";
    setRecommendation({
      action,
      confidence: Math.max(10, Math.min(99, Math.round(recScore))),
      explanation:
        "Qualitative opinion (mock): Aggregated social and news sentiment combined with recent economic indicators suggests a " +
        action +
        " approach. Replace this with LLM response from a verified prompt and fetch chain when integrating.",
    });
    setIsLoading(false);
  }

  useEffect(() => {
    fetchSentimentData(symbol);
    const refreshMs = intervalMins * 60 * 1000;
    const id = setInterval(() => fetchSentimentData(symbol), refreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMins]);

  useEffect(() => {
    fetchSentimentData(symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, trendRange]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSentimentData(symbol);
  };

  const RatingPills = ({ value }) => {
    const percent = (value / 5) * 100;
    const colorClass =
      percent > 66 ? "from-emerald-400 to-emerald-600" : percent < 34 ? "from-red-400 to-red-600" : "from-amber-300 to-amber-500";
    return (
      <div className="w-full">
        <div className="text-3xl font-extrabold flex items-center gap-3">
          <span>{value}/5</span>
          <div className="text-sm text-muted-foreground">Overall Rating</div>
        </div>
        <div className="mt-3 h-4 rounded-full bg-gradient-to-r " style={{ background: `linear-gradient(90deg, rgba(34,197,94,1) ${percent}%, rgba(209,213,219,1) ${percent}%)` }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ...existing code... (UI as in your provided code) */}
      </div>
    </div>
  );
}
