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

  useEffect(() => {
    fetch('/jobs_data.json')
      .then((res) => res.json())
      .then((data: Job[]) => {
        setTotalJobs(data.length);
        const counts: Record<string, number> = {};
        data.forEach(job => {
          job.skills?.forEach(skill => {
            counts[skill] = (counts[skill] || 0) + 1;
          });
        });

        const sortedStats = Object.entries(counts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / data.length) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15); // 상위 15개만 표시

        setStats(sortedStats);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600">채용공고</Link>
            <Link href="/trend" className="text-blue-600 dark:text-blue-400">기술트렌드</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">현재 시장에서 가장 핫한 기술은?</h2>
          <p className="text-gray-600 dark:text-gray-400">분석된 총 {totalJobs}개의 채용 공고 데이터를 기반으로 집계되었습니다.</p>
        </section>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <h3 className="text-lg font-bold mb-8 border-l-4 border-blue-500 pl-3">기술 스택 수요 Top 15</h3>
          
          <div className="space-y-6">
            {stats.map((skill, index) => (
              <div key={skill.name} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">{index + 1}. {skill.name}</span>
                  <span className="text-gray-500">{skill.count}건 ({skill.percentage}%)</span>
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

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm leading-relaxed">
          <p className="text-blue-800 dark:text-blue-300">
            💡 <strong>인사이트:</strong> 현재 주니어 채용 시장에서는 <strong>{stats[0]?.name}</strong>의 요구 비중이 가장 높습니다. 
            관련 기술 스택인 {stats.slice(1, 4).map(s => s.name).join(', ')} 등을 함께 학습하는 것이 취업 경쟁력 확보에 유리할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}