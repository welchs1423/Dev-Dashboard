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
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

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

    setTimeout(() => {
      const savedBookmarks = localStorage.getItem('dev_dashboard_bookmarks');
      if (savedBookmarks) {
        setBookmarkedJobs(JSON.parse(savedBookmarks));
      }

      const savedHidden = localStorage.getItem('dev_dashboard_hidden');
      if (savedHidden) {
        setHiddenCompanies(JSON.parse(savedHidden));
      }
      
      const savedTheme = localStorage.getItem('dev_dashboard_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem('dev_dashboard_bookmarks', JSON.stringify(bookmarkedJobs));
  }, [bookmarkedJobs]);

  useEffect(() => {
    localStorage.setItem('dev_dashboard_hidden', JSON.stringify(hiddenCompanies));
  }, [hiddenCompanies]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
  const filterOptions = ["All", "Bookmark", "Hidden", ...topSkills];

  const filteredJobs = jobs.filter(job => {
    if (selectedSkill === "Hidden") {
      return hiddenCompanies.includes(job.company);
    }

    if (hiddenCompanies.includes(job.company)) {
      return false;
    }

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

  const toggleHiddenCompany = (e: React.MouseEvent, companyName: string) => {
    e.preventDefault();
    e.stopPropagation();

    setHiddenCompanies(prev => {
      if (prev.includes(companyName)) {
        return prev.filter(name => name !== companyName);
      } else {
        return [...prev, companyName];
      }
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPlatformBadge = (id: string) => {
    if (id.startsWith('jumpit')) {
      return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">점핏</span>;
    }
    if (id.startsWith('saramin')) {
      return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">사람인</span>;
    }
    if (id.startsWith('wanted')) {
      return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300">원티드</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-bold">채용공고</Link>
              <Link href="/trend" className="hover:text-blue-600 dark:hover:text-blue-400">기술트렌드</Link>
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

      <main className="grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 leading-relaxed transition-colors duration-200">
            <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">모든 개발자를 위한 맞춤형 커리어 대시보드</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Dev Dashboard는 실시간 채용 데이터를 분석하여 개발자들에게 꼭 필요한 정보를 선별해 드립니다. 
              단순히 공고를 나열하는 것을 넘어, 현재 시장에서 요구하는 핵심 기술 스택의 변화를 추적합니다.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              성공적인 커리어 관리를 위해 매일 아침 업데이트되는 공고 리스트를 확인하고, 본인에게 가장 적합한 포지션을 찾아보세요. 
              기술 스택 기반 필터링을 통해 효율적인 이직 및 취업 준비를 도와드립니다.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-blue-500 dark:border-l-blue-400 transition-colors duration-200">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">주요 기술 스택</h2>
              <p className="mt-1 text-lg font-bold text-gray-700 dark:text-gray-200">React, Java, Python</p>
            </div>
            <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-green-500 dark:border-l-green-400 transition-colors duration-200">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">오늘의 채용 공고</h2>
              <p className="mt-1 text-lg font-bold text-gray-700 dark:text-gray-200">{isLoading ? "-" : jobs.length} 건 업데이트됨</p>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-2 border-b dark:border-gray-700 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">최신 채용 공고</h2>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">제공: 점핏, 사람인, 원티드</span>
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
                    className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        ? (skill === "Bookmark" ? 'bg-yellow-500 text-white border-yellow-500' : skill === "Hidden" ? 'bg-red-500 text-white border-red-500' : 'bg-blue-600 text-white')
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {skill === "All" ? "전체 보기" : skill === "Bookmark" ? "⭐ 찜한 공고" : skill === "Hidden" ? "🚫 숨긴 기업" : skill}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl animate-pulse bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="w-full pr-8">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                      <div className="h-6 w-20 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                      <div className="h-6 w-14 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    </div>
                  </div>
                ))
              ) : visibleJobs.length > 0 ? (
                visibleJobs.map((job) => {
                  const isBookmarked = bookmarkedJobs.includes(job.id);
                  const isHidden = hiddenCompanies.includes(job.company);
                  
                  return (
                    <a 
                      key={job.id} 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50/30 dark:hover:bg-gray-700 transition-all group relative bg-white dark:bg-gray-800"
                    >
                      <div className="flex justify-between items-start">
                        <div className="pr-20">
                          <div className="flex items-center gap-2 mb-1">
                            {getPlatformBadge(job.id)}
                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.company}</p>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">
                            {job.title}
                          </h3>
                        </div>
                        <div className="absolute top-5 right-5 flex gap-3">
                          <button
                            onClick={(e) => toggleHiddenCompany(e, job.company)}
                            className="text-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            {isHidden ? '복구' : '🚫'}
                          </button>
                          <button
                            onClick={(e) => toggleBookmark(e, job.id)}
                            className={`text-xl transition-colors ${
                              isBookmarked ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400 dark:hover:text-yellow-400'
                            }`}
                          >
                            {isBookmarked ? '★' : '☆'}
                          </button>
                        </div>
                      </div>
                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <span key={index} className="px-2.5 py-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 text-[11px] rounded-md border border-blue-100 dark:border-gray-600 font-medium">
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
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {selectedSkill === "Hidden" 
                      ? "숨긴 기업이 없습니다." 
                      : "검색 조건에 맞는 공고가 없습니다."}
                  </p>
                </div>
              )}
            </div>

            {!isLoading && visibleJobs.length < filteredJobs.length && (
              <div className="mt-8 text-center">
                <button 
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                >
                  더 보기 ({visibleJobs.length} / {filteredJobs.length})
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200">
            AdSense 광고 영역
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-sm font-bold mb-4 text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 dark:border-blue-400 pl-2">IT 커리어 일정</h2>
            <ul className="text-xs space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2 underline decoration-gray-100 dark:decoration-gray-700 underline-offset-4">• 정보처리기사 실기 시험 접수</li>
              <li className="flex gap-2 underline decoration-gray-100 dark:decoration-gray-700 underline-offset-4">• 상반기 주요 IT 기업 공채 시작</li>
              <li className="flex gap-2 underline decoration-gray-100 dark:decoration-gray-700 underline-offset-4">• 부트캠프 및 교육생 모집 소식</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-10 mt-12 transition-colors duration-200">
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

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 w-12 h-12 flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 hover:-translate-y-1 transition-all z-50"
        >
          ↑
        </button>
      )}
    </div>
  );
}