"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  company: string;
  title: string;
  skills: string[];
  url: string;
}

interface SkillStat {
  name: string;
  count: number;
  percentage: number;
}

export default function TrendPage() {
  const [stats, setStats] = useState<SkillStat[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    fetch('/jobs_data.json')
      .then((res) => res.json())
      .then((data: Job[]) => {
        // 메인과 동일하게 중복 제거 적용
        const uniqueJobs = data.filter((job, index, self) =>
          index === self.findIndex((t) => (
            t.company.trim() === job.company.trim() && t.title.trim() === job.title.trim()
          ))
        );

        setTotalJobs(uniqueJobs.length);
        const counts: Record<string, number> = {};
        uniqueJobs.forEach(job => {
          job.skills?.forEach(skill => {
            counts[skill] = (counts[skill] || 0) + 1;
          });
        });

        const sortedStats = Object.entries(counts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / uniqueJobs.length) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);

        setStats(sortedStats);
      });

    // 다크 모드 초기화 로직
    const savedTheme = localStorage.getItem('dev_dashboard_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      {/* 메인 페이지와 동일한 헤더 적용 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">채용공고</Link>
              <Link href="/trend" className="hover:text-blue-600 dark:hover:text-blue-400 font-bold">기술트렌드</Link>
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

      <main className="grow max-w-4xl mx-auto px-6 py-12 w-full">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 dark:text-gray-100">현재 시장에서 가장 핫한 기술은?</h2>
          <p className="text-gray-600 dark:text-gray-400">분석된 총 {totalJobs}개의 채용 공고 데이터를 기반으로 집계되었습니다.</p>
        </section>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-8 border-l-4 border-blue-500 pl-3 dark:text-gray-100">기술 스택 수요 Top 15</h3>
          
          <div className="space-y-6">
            {stats.map((skill, index) => (
              <div key={skill.name} className="group">
                <div className="flex justify-between text-sm mb-2 dark:text-gray-200">
                  <span className="font-semibold">{index + 1}. {skill.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{skill.count}건 ({skill.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-500 dark:bg-blue-400 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm leading-relaxed transition-colors duration-200">
          <p className="text-blue-800 dark:text-blue-300">
            💡 <strong>인사이트:</strong> 현재 채용 시장에서는 <strong>{stats[0]?.name}</strong>의 요구 비중이 가장 높습니다. 
            관련 기술 스택인 {stats.slice(1, 4).map(s => s.name).join(', ')} 등을 함께 학습하는 것이 이직 및 취업 경쟁력 확보에 유리할 수 있습니다.
          </p>
        </div>
      </main>

      {/* 메인 페이지와 동일한 푸터 적용 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-10 mt-12 transition-colors duration-200 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500">© 2026 Dev Dashboard</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-md leading-relaxed">
                본 서비스는 점핏(Jumpit), 사람인(Saramin), 원티드(Wanted)의 공개 데이터를 활용하여 모든 개발자의 커리어 성장을 돕기 위해 제작된 대시보드입니다. 
                채용 정보의 저작권은 각 채용 공고의 원작자 및 해당 플랫폼에 있습니다.
              </p>
            </div>
            <div className="flex gap-6 text-xs font-medium text-gray-400 dark:text-gray-500">
              <Link href="/privacy" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}