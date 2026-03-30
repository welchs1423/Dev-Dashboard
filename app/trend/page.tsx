"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Job {
  id: string;
  company: string;
  title: string;
  skills: string[];
}

interface SkillStat {
  skill: string;
  count: number;
}

export default function Trend() {
  const [stats, setStats] = useState<SkillStat[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/jobs_data.json')
      .then(res => res.json())
      .then((data: Job[]) => {
        const skillCounts: Record<string, number> = {};
        
        data.forEach(job => {
          if (job.skills && job.skills.length > 0) {
            const uniqueSkills = Array.from(new Set(job.skills));
            uniqueSkills.forEach(skill => {
              skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
          }
        });

        const sortedStats = Object.entries(skillCounts)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);

        setStats(sortedStats);
        setTotalJobs(data.length);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const maxCount = stats.length > 0 ? stats[0].count : 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <Header />
      <main className="grow max-w-4xl mx-auto px-6 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold mb-2">🔥 실시간 기술 트렌드</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            현재 수집된 {isLoading ? '...' : totalJobs}개의 최신 채용 공고를 분석하여 가장 많이 요구되는 기술 스택 TOP 15를 보여줍니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${100 - i * 8}%` }}></div>
                </div>
              ))}
            </div>
          ) : stats.length > 0 ? (
            <div className="space-y-5">
              {stats.map((stat, index) => (
                <div key={stat.skill} className="flex items-center gap-4 group">
                  <div className="w-20 sm:w-24 text-right shrink-0">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {stat.skill}
                    </span>
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-r-lg overflow-hidden relative flex items-center">
                    <div 
                      className="h-full bg-linear-to-r from-blue-500 to-cyan-400 group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-1000 ease-out"
                      style={{ width: `${(stat.count / maxCount) * 100}%` }}
                    ></div>
                    <span className="absolute left-3 text-xs font-bold text-white drop-shadow-md">
                      {stat.count}건
                    </span>
                  </div>
                  <div className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                    {index + 1}위
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              분석할 스택 데이터가 없습니다.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}