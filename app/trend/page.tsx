"use client";

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
interface Job {
  skills?: string[];
}

interface SkillData {
  name: string;
  count: number;
}

export default function TrendPage() {
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/jobs_data.json')
      .then(res => res.json())
      .then((data: Job[]) => {
        const counts: Record<string, number> = {};
        data.forEach(job => {
          if (job.skills) {
            job.skills.forEach(skill => {
              // 대소문자 통일 및 특정 키워드 병합 로직 (필요시 확장)
              const s = skill.toUpperCase();
              counts[s] = (counts[s] || 0) + 1;
            });
          }
        });
        
        // 상위 20개 스택 추출
        const sorted = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);

        setSkillsData(sorted);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const maxCount = skillsData.length > 0 ? Math.max(...skillsData.map(s => s.count)) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <Header />
      <main className="grow max-w-4xl mx-auto px-6 py-12 w-full">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">실시간 기술 스택 트렌드</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">현재 수집된 전체 채용 공고를 기반으로 가장 많이 요구되는 기술 스택을 분석합니다.</p>
        </section>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-10 transition-colors duration-200">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <span className="text-blue-500">🔥</span> Top 20 요구 기술 스택
          </h3>
          
          <div className="space-y-6">
            {isLoading ? (
              <div className="py-10 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div></div>
            ) : skillsData.length > 0 ? (
              skillsData.map((skill, idx) => (
                <div key={skill.name} className="flex items-center gap-4 group">
                  <div className="w-8 text-right text-sm font-bold text-gray-400 dark:text-gray-500">{idx + 1}</div>
                  <div className="w-24 text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{skill.name}</div>
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(skill.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                    {skill.count}건
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}