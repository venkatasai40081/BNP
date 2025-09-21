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
} from "./components/ui/card";
import { Search, RefreshCw, TrendingUp, Moon, Sun } from "lucide-react";

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
  const [companies, setCompanies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [recommendation, setRecommendation] = useState({
    action: "HOLD",
    confidence: 64,
    explanation:
      "Mock recommendation: The model sees balanced news and social signals, resulting in a neutral stance.",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function fetchSentimentData(inputSymbol) {
    setIsLoading(true);
    
    try {
      const baseURL = 'http://localhost:5000/api';
      
      // Fetch sentiment data
      const sentimentResponse = await fetch(`${baseURL}/sentiment/${inputSymbol}`);
      const sentimentData = await sentimentResponse.json();
      setSentiment(sentimentData);
      
      // Fetch trend data
      const trendResponse = await fetch(`${baseURL}/trend/${inputSymbol}?days=${trendRange}`);
      const trendData = await trendResponse.json();
      setTrendData(trendData);
      
      // Fetch news data
      const newsResponse = await fetch(`${baseURL}/news?count=8`);
      const newsData = await newsResponse.json();
      setNews(newsData);
      
      // Fetch word cloud data
      const wordCloudResponse = await fetch(`${baseURL}/wordcloud`);
      const wordCloudData = await wordCloudResponse.json();
      setWordCloud(wordCloudData);
      
      // Fetch recommendation
      const recommendationResponse = await fetch(`${baseURL}/recommendation/${inputSymbol}`);
      const recommendationData = await recommendationResponse.json();
      setRecommendation(recommendationData);
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      
      // Fallback to mock data if API is unavailable
      const s = generateMockSentiment();
      const t = generateMockTrend(+trendRange);
      const n = generateMockNews(6);
      const wc = MOCK_WORDS.slice(0, 10);

      setSentiment(s);
      setTrendData(t);
      setNews(n);
      setWordCloud(wc);
      setLastUpdated(new Date());
      
      setRecommendation({
        action: "HOLD",
        confidence: 50,
        explanation: "Unable to connect to sentiment analysis service. Using fallback data.",
      });
    }
    
    setIsLoading(false);
  }

  async function fetchCompanies() {
    try {
      const baseURL = 'http://localhost:5000/api';
      const response = await fetch(`${baseURL}/companies`);
      
      if (response.ok) {
        const companiesData = await response.json();
        setCompanies(companiesData);
      } else {
        // Fallback companies list
        setCompanies([
          { symbol: 'AAPL', name: 'Apple Inc' },
          { symbol: 'GOOGL', name: 'Google' },
          { symbol: 'MSFT', name: 'Microsoft' },
          { symbol: 'TSLA', name: 'Tesla' },
          { symbol: 'AMZN', name: 'Amazon' },
          { symbol: 'NVDA', name: 'NVIDIA' },
          { symbol: 'META', name: 'Meta' },
          { symbol: 'NFLX', name: 'Netflix' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Use fallback companies
      setCompanies([
        { symbol: 'AAPL', name: 'Apple Inc' },
        { symbol: 'GOOGL', name: 'Google' },
        { symbol: 'MSFT', name: 'Microsoft' },
        { symbol: 'TSLA', name: 'Tesla' },
        { symbol: 'AMZN', name: 'Amazon' },
        { symbol: 'NVDA', name: 'NVIDIA' },
        { symbol: 'META', name: 'Meta' },
        { symbol: 'NFLX', name: 'Netflix' }
      ]);
    }
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSentimentData(symbol);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Define theme classes
  const themeClasses = {
    background: isDarkMode 
      ? "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100" 
      : "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900",
    card: isDarkMode 
      ? "bg-slate-800 border-slate-700" 
      : "bg-white border-gray-200 shadow-lg",
    input: isDarkMode 
      ? "bg-slate-800 border-slate-700 text-slate-100" 
      : "bg-white border-gray-300 text-gray-900",
    text: {
      primary: isDarkMode ? "text-slate-100" : "text-gray-900",
      secondary: isDarkMode ? "text-slate-300" : "text-gray-600",
      muted: isDarkMode ? "text-slate-400" : "text-gray-500"
    }
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
        <div className="mt-3 h-4 rounded-full bg-gradient-to-r" style={{ background: `linear-gradient(90deg, rgba(34,197,94,1) ${percent}%, rgba(209,213,219,1) ${percent}%)` }} />
      </div>
    );
  };

  return (
    <div className={`${themeClasses.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 w-12 h-12 flex items-center justify-center shadow-2xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Real-Time Market Sentiment</h1>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Aggregate social, news, and economic signals in one view</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${themeClasses.card} border hover:scale-105 transform transition-all duration-200 ${themeClasses.text.primary}`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className={`pl-10 pr-8 py-2 min-w-[200px] rounded-lg ${themeClasses.card} ${themeClasses.input} border focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none`}
              >
                {companies.map(company => (
                  <option key={company.symbol} value={company.symbol}>
                    {company.symbol} - {company.name}
                  </option>
                ))}
              </select>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 shadow hover:scale-105 transform transition"
            >
              Analyze
            </button>
            <select
              value={intervalMins}
              onChange={(e) => setIntervalMins(+e.target.value)}
              className={`hidden sm:inline-block px-3 py-2 ${themeClasses.card} ${themeClasses.input} border rounded-lg`}
            >
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </form>
          </div>
        </motion.header>

        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Summary Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className={`p-6 ${themeClasses.card} rounded-2xl shadow-2xl border`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>{symbol} — Market Sentiment</h2>
                    <p className={`text-sm ${themeClasses.text.secondary}`}>Last updated: {lastUpdated.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Recommendation</div>
                    <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${recommendation.action === "BUY" ? "bg-emerald-600/20 text-emerald-200" : recommendation.action === "SELL" ? "bg-red-600/20 text-red-200" : "bg-amber-600/20 text-amber-200"}`}>
                      {recommendation.action}
                      <span className="text-xs opacity-80">{recommendation.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className={`p-4 rounded-xl ${themeClasses.card} border`}>
                    <RatingPills value={sentiment.overall} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg ${themeClasses.card} border text-center`}>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>Social</div>
                      <div className={`text-xl font-bold mt-1 ${themeClasses.text.primary}`}>{sentiment.social}/5</div>
                    </div>
                    <div className={`p-3 rounded-lg ${themeClasses.card} border text-center`}>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>News</div>
                      <div className={`text-xl font-bold mt-1 ${themeClasses.text.primary}`}>{sentiment.news}/5</div>
                    </div>
                    <div className={`p-3 rounded-lg ${themeClasses.card} border text-center`}>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>Economic</div>
                      <div className={`text-xl font-bold mt-1 ${themeClasses.text.primary}`}>{sentiment.econ}/5</div>
                    </div>
                  </div>

                  <div className={`mt-3 p-3 rounded-lg ${themeClasses.card} border`}>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>LLM Opinion</div>
                    <div className={`mt-2 text-sm ${themeClasses.text.primary}`}>{recommendation.explanation}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 justify-between">
                  <button
                    onClick={() => fetchSentimentData(symbol)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${themeClasses.card} hover:opacity-80 border`}
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh Now
                  </button>

                  <div className={`text-sm ${themeClasses.text.secondary}`}>Auto refresh: {intervalMins} min</div>
                </div>
              </div>

              {/* Word cloud */}
              <div className={`p-6 ${themeClasses.card} rounded-2xl border`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-md font-semibold ${themeClasses.text.primary}`}>Word Cloud</h3>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>Top mentions</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {wordCloud.map((w, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`px-3 py-1 rounded-full border border-slate-700/60 text-sm font-medium ${i % 3 === 0 ? "bg-amber-700/10" : i % 3 === 1 ? "bg-emerald-700/10" : "bg-indigo-700/10"}`}
                    >
                      {w}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            {/* Center column: Trend chart + timeline */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`p-6 rounded-2xl ${themeClasses.card} border shadow`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Sentiment Trend</h3>
                  <div className="flex items-center gap-3">
                    <select value={trendRange} onChange={(e) => setTrendRange(e.target.value)} className={`${themeClasses.card} ${themeClasses.input} px-3 py-2 rounded-lg border`}>
                      <option value={7}>Week</option>
                      <option value={30}>30 Days</option>
                      <option value={90}>90 Days</option>
                      <option value={365}>Year</option>
                    </select>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Showing last {trendRange} days</div>
                  </div>
                </div>

                <div style={{ height: 320 }} className="mt-4 relative">
                  {isLoading && (
                    <div className={`absolute inset-0 ${themeClasses.card} bg-opacity-50 flex items-center justify-center z-10 rounded-lg`}>
                      <div className={`flex items-center gap-2 ${themeClasses.text.secondary}`}>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Updating chart...</span>
                      </div>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPush" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#374151" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: "#9CA3AF" }} />
                      <YAxis tick={{ fill: "#9CA3AF" }} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" stroke="#7c3aed" fillOpacity={1} fill="url(#colorPush)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg ${themeClasses.card} border`}>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Avg Sentiment</div>
                    <div className={`text-xl font-bold ${themeClasses.text.primary}`}>{Math.round(trendData.reduce((a, b) => a + b.score, 0) / trendData.length)}/100</div>
                  </div>
                  <div className={`p-3 rounded-lg ${themeClasses.card} border`}>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Volatility (30d)</div>
                    <div className={`text-xl font-bold ${themeClasses.text.primary}`}>{randomInt(2, 20)}%</div>
                  </div>
                  <div className={`p-3 rounded-lg ${themeClasses.card} border`}>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Signal Strength</div>
                    <div className={`text-xl font-bold ${themeClasses.text.primary}`}>{randomInt(40, 95)}%</div>
                  </div>
                </div>
              </div>

              {/* News listing + Buy/Sell card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 p-4 rounded-2xl ${themeClasses.card} border`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${themeClasses.text.primary}`}>Latest News</h4>
                    <div className={`text-sm ${themeClasses.text.secondary}`}>Sources: Multi</div>
                  </div>
                  <div className="mt-3 space-y-3">
                    {news.map((n) => (
                      <div key={n.id} className={`p-3 rounded-lg ${themeClasses.card} border hover:scale-[1.01] transition`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className={`font-medium ${themeClasses.text.primary}`}>{n.title}</div>
                            <div className={`text-xs ${themeClasses.text.secondary}`}>{n.source} • {n.time}</div>
                            <div className={`text-sm mt-1 ${themeClasses.text.primary}`}>{n.snippet}</div>
                          </div>
                          <div className="ml-3 flex flex-col items-end">
                            <div className={`text-sm ${themeClasses.text.secondary}`}>Sentiment</div>
                            <div className={`mt-2 px-3 py-1 rounded-full text-sm ${n.sentiment === 'POS' ? 'bg-emerald-600/20 text-emerald-200' : 'bg-red-600/20 text-red-200'}`}>
                              {n.sentiment}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl ${themeClasses.card} border flex flex-col justify-between`}>
                  <div>
                    <h4 className={`font-semibold ${themeClasses.text.primary}`}>Actionable</h4>
                    <p className={`text-sm ${themeClasses.text.secondary} mt-2`}>Buy / Sell / Hold recommendation based on aggregated signals and LLM qualitative opinion.</p>

                    <div className={`mt-4 p-3 rounded-lg ${themeClasses.card} border`}>
                      <div className={`text-2xl font-extrabold ${recommendation.action === "BUY" ? "text-emerald-300" : recommendation.action === "SELL" ? "text-red-300" : "text-amber-300"}`}>
                        {recommendation.action}
                      </div>
                      <div className={`text-sm ${themeClasses.text.secondary} mt-1`}>Confidence: {recommendation.confidence}%</div>
                      <div className={`mt-2 text-sm ${themeClasses.text.primary}`}>{recommendation.explanation}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30">Initiate Buy</button>
                    <button className="flex-1 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30">Initiate Sell</button>
                  </div>
                </div>
              </div>

              {/* Small metrics + footnote */}
              <div className={`p-4 rounded-lg ${themeClasses.card} border text-sm ${themeClasses.text.secondary}`}>
                <div className="flex items-center justify-between">
                  <div>Accuracy evaluation: Use a labeled test set and confusion matrices for the NLP models. Track F1, precision, recall, and AUC for classifiers.</div>
                  <div>Interpretability: Provide SHAP / LIME explanations for key drivers; store explanatory snippets for each recommendation.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.main>

        <footer className={`mt-8 text-center ${themeClasses.text.secondary} text-sm`}>© {new Date().getFullYear()} Market Sentiment Dashboard • Mock demo — replace mocks with real data sources & models</footer>
      </div>
    </div>
  );
}
