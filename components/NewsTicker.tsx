"use client";

import { useState, useEffect } from 'react';

interface NewsItem { title: string; url: string; }

export default function NewsTicker({ news }: { news: NewsItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (news.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [news.length, isPaused]);

  if (news.length === 0) return null;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 overflow-hidden mb-6 group transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Live News</span>
      </div>
      
      <div className="h-px w-4 bg-gray-200 dark:bg-gray-700 shrink-0"></div>

      <div className="flex-1 overflow-hidden relative h-5">
        <a 
          href={news[currentIndex].url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute inset-0 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all truncate block"
        >
          {news[currentIndex].title}
        </a>
      </div>

      <div className="shrink-0 text-[10px] font-mono text-gray-400">
        {currentIndex + 1} / {news.length}
      </div>
    </div>
  );
}