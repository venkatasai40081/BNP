// src/hooks/useRealtime.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

/**
 * useRealtime(onEvent)
 * onEvent(eventName, payload) will be called for known events.
 * Default server URL: http://localhost:4000 — change if your backend is elsewhere.
 */
export default function useRealtime(onEvent, opts = {}) {
  const socketRef = useRef(null);
  const serverUrl = opts.serverUrl || "http://localhost:4000";

  useEffect(() => {
    const socket = io(serverUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => console.log("realtime connected:", socket.id));
    socket.on("disconnect", () => console.log("realtime disconnected"));

    // snapshot + domain events
    socket.on("snapshot", (payload) => onEvent("snapshot", payload));
    socket.on("timeseries:new", (pt) => onEvent("timeseries:new", pt));
    socket.on("kpis:update", (kpis) => onEvent("kpis:update", kpis));
    socket.on("wordcloud:update", (words) => onEvent("wordcloud:update", words));
    socket.on("news:new", (news) => onEvent("news:new", news));
    socket.on("table:update", (rows) => onEvent("table:update", rows));

    // Generic error logging
    socket.on("connect_error", (err) => console.error("socket connect_error", err));

    return () => {
      socket.disconnect();
    };
  }, [onEvent, serverUrl]);
}
