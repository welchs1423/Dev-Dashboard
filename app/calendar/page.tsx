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
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    fetch('/events_data.json')
      .then((res) => res.json())
      .then((data: CalendarEvent[]) => {
        const sortedEvents = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

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
    if (isNaN(date.getTime())) return "날짜 미정";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const visibleEvents = events.slice(0, displayCount);

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

      <main className="grow max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
        <div className="md:col-span-2 space-y-6">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">IT 커리어 및 행사 일정</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">2026년 진행 예정인 IT 컨퍼런스 및 해커톤 일정을 날짜순으로 보여줍니다.</p>
          </section>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            {isLoading ? (
              <div className="py-10 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
            ) : visibleEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleEvents.map(event => (
                  <a
                    key={event.id}
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50/30 dark:hover:bg-gray-700 transition-all bg-white dark:bg-gray-800"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                          {event.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{event.host}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-2 h-10">
                        {event.title}
                      </h3>
                      <div className="text-right mt-1 shrink-0">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                          {formatDate(event.date)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">현재 이후로 예정된 일정이 없습니다.</p>
            )}

            {!isLoading && events.length > visibleEvents.length && (
              <div className="py-8 text-center mt-6">
                <button
                  onClick={loadMore}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  행사 더 보기
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6 mt-2 md:mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-sm font-bold mb-4 text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 dark:border-blue-400 pl-2">🌐 글로벌 자격증 (상시 접수)</h2>
            <ul className="text-sm space-y-3">
              {[
                { name: "AWS Certified", url: "https://aws.amazon.com/ko/certification/" },
                { name: "Oracle (Java OCP 등)", url: "https://education.oracle.com/" },
                { name: "Google Cloud (GCP)", url: "https://cloud.google.com/learn/certification" },
                { name: "Microsoft Azure", url: "https://learn.microsoft.com/ko-kr/credentials/certifications/" },
                { name: "Kubernetes (CKA/CKS)", url: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/" }
              ].map(cert => (
                <li key={cert.name}>
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="block p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-800 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    <div className="flex justify-between items-center group">
                      <span className="font-medium">{cert.name}</span>
                      <span className="text-gray-300 group-hover:text-blue-400 transition-colors">🔗</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
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