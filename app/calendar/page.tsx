"use client";

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CalendarEvent { id: string; title: string; date: string; host: string; url: string; type: string; }

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/events_data.json')
      .then((res) => res.json())
      .then((data: CalendarEvent[]) => {
        const sortedEvents = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(sortedEvents);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const loadMore = () => setDisplayCount(prev => prev + 10);
  const visible = events.slice(0, displayCount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "날짜 미정";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateDDay = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    if (isNaN(targetDate.getTime())) return null;

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return null;
  };

  const generateGoogleCalendarUrl = (title: string, dateString: string, url: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return url;

    const formatDt = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const start = formatDt(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    const end = formatDt(endDate);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      details: `행사 상세 링크: ${url}`
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <Header />
      <main className="grow max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
        <div className="md:col-span-2 space-y-6">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">IT 커리어 및 행사 일정</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">2026년 진행 예정인 IT 컨퍼런스 및 해커톤 일정을 날짜순으로 보여줍니다.</p>
          </section>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            {isLoading ? (
              <div className="py-10 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div></div>
            ) : visible.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visible.map(event => {
                  const dDay = calculateDDay(event.date);
                  return (
                    <div key={event.id} className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50/30 dark:hover:bg-gray-700 transition-all bg-white dark:bg-gray-800 relative group">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">{event.type}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{event.host}</span>
                        </div>
                        <a href={event.url} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-2 h-10 group-hover:text-blue-500 transition-colors">
                          {event.title}
                        </a>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                            {formatDate(event.date)}
                            {dDay && <span className="ml-2 font-bold text-red-500">{dDay}</span>}
                          </span>
                          <a
                            href={generateGoogleCalendarUrl(event.title, event.date, event.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="구글 캘린더에 추가"
                            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          >
                            📅
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-center text-gray-500 py-10">현재 이후로 예정된 일정이 없습니다.</p>}

            {!isLoading && events.length > visible.length && (
              <div className="py-8 text-center mt-6">
                <button onClick={loadMore} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">행사 더 보기</button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6 mt-2 md:mt-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-sm font-bold mb-4 text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 dark:border-blue-400 pl-2">🌐 글로벌 자격증 (상시 접수)</h2>
            <ul className="text-sm space-y-3">
              {[{ name: "AWS Certified", url: "https://aws.amazon.com/ko/certification/" }, { name: "Oracle (Java OCP 등)", url: "https://education.oracle.com/" }, { name: "Google Cloud (GCP)", url: "https://cloud.google.com/learn/certification" }, { name: "Microsoft Azure", url: "https://learn.microsoft.com/ko-kr/credentials/certifications/" }, { name: "Kubernetes (CKA/CKS)", url: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/" }].map(cert => (
                <li key={cert.name}>
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="block p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:text-blue-500 transition-colors">
                    <div className="flex justify-between items-center group">
                      <span className="font-medium">{cert.name}</span><span className="text-gray-300 group-hover:text-blue-400">🔗</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}