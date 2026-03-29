import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  url: string;
}

interface NewsTickerProps {
  news: NewsItem[];
}

export default function NewsTicker({ news }: NewsTickerProps) {
  const [currentNewsIndex, setCurrentNewsIndex] = useState<number>(0);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [news.length]);

  if (news.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center overflow-hidden mb-6">
      <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded mr-3 shrink-0">IT 뉴스</span>
      <div className="flex-1 truncate">
        <a 
          href={news[currentNewsIndex].url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
        >
          {news[currentNewsIndex].title}
        </a>
      </div>
    </div>
  );
}