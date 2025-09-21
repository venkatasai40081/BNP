import React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div className={`rounded-2xl bg-slate-800/40 border border-slate-700 shadow-xl ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`px-6 pt-6 pb-2 font-bold text-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`px-6 py-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`px-6 pb-6 pt-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
