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

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [displayCount, setDisplayCount] = useState<number>(20);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    fetch('/jobs_data.json')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Data fetch error:", error);
        setIsLoading(false);
      });

    const savedBookmarks = localStorage.getItem('dev_dashboard_bookmarks');
    if (savedBookmarks) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBookmarkedJobs(JSON.parse(savedBookmarks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dev_dashboard_bookmarks', JSON.stringify(bookmarkedJobs));
  }, [bookmarkedJobs]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getTopSkills = () => {
    const skillCounts: Record<string, number> = {};
    jobs.forEach(job => {
      if (job.skills) {
        job.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });
    
    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(entry => entry[0]);
  };

  const topSkills = getTopSkills();
  const filterOptions = ["All", "Bookmark", ...topSkills];

  const filteredJobs = jobs.filter(job => {
    let matchSkill = false;
    if (selectedSkill === "All") {
      matchSkill = true;
    } else if (selectedSkill === "Bookmark") {
      matchSkill = bookmarkedJobs.includes(job.id);
    } else {
      matchSkill = job.skills && job.skills.includes(selectedSkill);
    }

    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = keyword === "" || 
      job.company.toLowerCase().includes(keyword) || 
      job.title.toLowerCase().includes(keyword);

    return matchSkill && matchSearch;
  });

  const visibleJobs = filteredJobs.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 20);
  };

  const toggleBookmark = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    setBookmarkedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPlatformBadge = (id: string) => {
    if (id.startsWith('jumpit')) {
      return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-600">점핏</span>;
    }
    if (id.startsWith('saramin')) {
      return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-green-100 text-green-600">사람인</span>;
    }
    if (id.startsWith('wanted')) {
      return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-cyan-100 text-cyan-600">원티드</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans relative">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Dev Dashboard</h1>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-blue-600">채용공고</Link>
            <Link href="/" className="hover:text-blue-600">기술트렌드</Link>
          </nav>
        </div>
      </header>

      <main className="grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 leading-relaxed">
            <h2 className="text-lg font-bold mb-3 text-gray-800">주니어 개발자를 위한 맞춤형 커리어 대시보드</h2>
            <p className="text-sm text-gray-600 mb-3">
              Dev Dashboard는 실시간 채용 데이터를 분석하여 주니어 개발자들에게 꼭 필요한 정보를 선별해 드립니다. 
              단순히 공고를 나열하는 것을 넘어, 현재 시장에서 요구하는 핵심 기술 스택의 변화를 추적합니다.
            </p>
            <p className="text-sm text-gray-600">
              성공적인 커리어의 시작을 위해 매일 아침 업데이트되는 공고 리스트를 확인하고, 본인에게 가장 적합한 포지션을 찾아보세요. 
              기술 스택 기반 필터링을 통해 효율적인 취업 준비를 도와드립니다.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">주요 기술 스택</h2>
              <p className="mt-1 text-lg font-bold text-gray-700">React, Java, Python</p>
            </div>
            <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-green-500">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">오늘의 채용 공고</h2>
              <p className="mt-1 text-lg font-bold text-gray-700">{isLoading ? "-" : jobs.length} 건 업데이트됨</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-2 border-b gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">최신 신입 및 주니어 공고</h2>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded mt-1 inline-block">제공: 점핏, 사람인, 원티드</span>
              </div>
              
              {!isLoading && (
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="회사명, 공고 제목 검색..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDisplayCount(20);
                    }}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
            
            {!isLoading && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filterOptions.map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      setSelectedSkill(skill);
                      setDisplayCount(20);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedSkill === skill
                        ? (skill === "Bookmark" ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-blue-600 text-white')
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {skill === "All" ? "전체 보기" : skill === "Bookmark" ? "⭐ 찜한 공고" : skill}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="block p-5 border border-gray-100 rounded-xl animate-pulse bg-white">
                    <div className="flex justify-between items-start">
                      <div className="w-full pr-8">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-12 bg-gray-200 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-5 w-3/4 bg-gray-200 rounded mb-4"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-100 rounded-md"></div>
                      <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
                      <div className="h-6 w-14 bg-gray-100 rounded-md"></div>
                    </div>
                  </div>
                ))
              ) : visibleJobs.length > 0 ? (
                visibleJobs.map((job) => {
                  const isBookmarked = bookmarkedJobs.includes(job.id);
                  return (
                    <a 
                      key={job.id} 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-5 border border-gray-100 rounded-xl hover:bg-blue-50/30 hover:border-blue-200 transition-all group relative"
                    >
                      <div className="flex justify-between items-start">
                        <div className="pr-12">
                          <div className="flex items-center gap-2 mb-1">
                            {getPlatformBadge(job.id)}
                            <p className="text-sm text-gray-500">{job.company}</p>
                          </div>
                          <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-base">
                            {job.title}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => toggleBookmark(e, job.id)}
                          className={`absolute top-5 right-5 text-xl transition-colors ${
                            isBookmarked ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                          }`}
                          aria-label="북마크"
                        >
                          {isBookmarked ? '★' : '☆'}
                        </button>
                      </div>
                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <span key={index} className="px-2.5 py-1 bg-white text-blue-600 text-[11px] rounded-md border border-blue-100 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400 italic">
                    검색 조건에 맞는 공고가 없습니다.
                  </p>
                </div>
              )}
            </div>

            {!isLoading && visibleJobs.length < filteredJobs.length && (
              <div className="mt-8 text-center">
                <button 
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                >
                  더 보기 ({visibleJobs.length} / {filteredJobs.length})
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-100 h-64 rounded-xl flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200">
            AdSense 광고 영역
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold mb-4 text-gray-800 border-l-4 border-blue-500 pl-2">IT 커리어 일정</h2>
            <ul className="text-xs space-y-4 text-gray-600">
              <li className="flex gap-2 underline decoration-gray-100 underline-offset-4">• 정보처리기사 실기 시험 접수</li>
              <li className="flex gap-2 underline decoration-gray-100 underline-offset-4">• 상반기 주요 IT 기업 공채 시작</li>
              <li className="flex gap-2 underline decoration-gray-100 underline-offset-4">• 부트캠프 및 교육생 모집 소식</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-400">© 2026 Dev Dashboard</p>
              <p className="text-[11px] text-gray-400 max-w-md leading-relaxed">
                본 서비스는 점핏(Jumpit), 사람인(Saramin), 원티드(Wanted)의 공개 데이터를 활용하여 주니어 개발자의 커리어 성장을 돕기 위해 제작된 대시보드입니다. 
                채용 정보의 저작권은 각 채용 공고의 원작자 및 해당 플랫폼에 있습니다.
              </p>
            </div>
            <div className="flex gap-6 text-xs font-medium text-gray-400">
              <Link href="/privacy" className="hover:text-blue-500 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-blue-500 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all z-50"
          aria-label="맨 위로 이동"
        >
          ↑
        </button>
      )}
    </div>
  );
}