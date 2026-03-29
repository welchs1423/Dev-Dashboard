"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  host: string;
  url: string;
  type: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    fetch('/events_data.json')
      .then((res) => res.json())
      .then((data: CalendarEvent[]) => {
        const sortedEvents = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(sortedEvents);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });

    setTimeout(() => {
      const savedTheme = localStorage.getItem('dev_dashboard_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }, 0);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('dev_dashboard_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('dev_dashboard_theme', 'light');
      }
      return newTheme;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 transition-colors duration-200 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">채용공고</Link>
              <Link href="/trend" className="hover:text-blue-600 dark:hover:text-blue-400">기술트렌드</Link>
              <Link href="/calendar" className="hover:text-blue-600 dark:hover:text-blue-400 font-bold">IT 캘린더</Link>
            </nav>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 transition-colors duration-200">
        <div className="flex justify-center items-center">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</span>
        </div>
      </header>

      <main className="grow max-w-4xl mx-auto px-6 py-12 w-full">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-100">IT 커리어 및 행사 일정</h2>
          <p className="text-gray-600 dark:text-gray-400">주요 IT 컨퍼런스, 해커톤 및 자격증 시험 일정을 한눈에 확인하세요.</p>
        </section>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-500">일정을 불러오는 중입니다.</p>
            ) : events.length > 0 ? (
              events.map(event => (
                <a
                  key={event.id}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50/30 dark:hover:bg-gray-700 transition-all bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          event.type === '자격증' 
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{event.host}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                        {event.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        {formatDate(event.date)}
                      </span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-center text-gray-500">등록된 일정이 없습니다.</p>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-10 mt-12 pb-24 md:pb-10 transition-colors duration-200 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500">© 2026 Dev Dashboard</p>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-50 transition-colors duration-200 pb-safe">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="text-xl mb-1">💼</span>
          <span className="text-[10px] font-medium">채용공고</span>
        </Link>
        <Link href="/trend" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="text-xl mb-1">📈</span>
          <span className="text-[10px] font-medium">트렌드</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center justify-center w-full h-full text-blue-600 dark:text-blue-400">
          <span className="text-xl mb-1">📅</span>
          <span className="text-[10px] font-medium">캘린더</span>
        </Link>
        <button onClick={toggleDarkMode} className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="text-xl mb-1">{isDarkMode ? '🌙' : '☀️'}</span>
          <span className="text-[10px] font-medium">테마</span>
        </button>
      </nav>
    </div>
  );
}