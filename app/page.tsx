"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  company: string;
  title: string;
  skills: string[];
  url: string;
}

interface NewsItem {
  title: string;
  url: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState<number>(0);
  
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [displayCount, setDisplayCount] = useState<number>(20);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/jobs_data.json')
      .then((res) => res.json())
      .then((data: Job[]) => {
        const uniqueJobs = data.filter((job, index, self) =>
          index === self.findIndex((t) => (
            t.company.trim() === job.company.trim() && t.title.trim() === job.title.trim()
          ))
        );
        const jumpit = uniqueJobs.filter(j => j.id.startsWith('jumpit'));
        const saramin = uniqueJobs.filter(j => j.id.startsWith('saramin'));
        const wanted = uniqueJobs.filter(j => j.id.startsWith('wanted'));
        const mixedJobs: Job[] = [];
        const maxLength = Math.max(jumpit.length, saramin.length, wanted.length);
        for (let i = 0; i < maxLength; i++) {
          if (jumpit[i]) mixedJobs.push(jumpit[i]);
          if (saramin[i]) mixedJobs.push(saramin[i]);
          if (wanted[i]) mixedJobs.push(wanted[i]);
        }
        setJobs(mixedJobs);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    fetch('/news_data.json')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) setNews(data);
      })
      .catch(() => {});

    setTimeout(() => {
      const savedBookmarks = localStorage.getItem('dev_dashboard_bookmarks');
      if (savedBookmarks) setBookmarkedJobs(JSON.parse(savedBookmarks));
      const savedHidden = localStorage.getItem('dev_dashboard_hidden');
      if (savedHidden) setHiddenCompanies(JSON.parse(savedHidden));
      const savedMemos = localStorage.getItem('dev_dashboard_memos');
      if (savedMemos) setMemos(JSON.parse(savedMemos));
      
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
    localStorage.setItem('dev_dashboard_hidden', JSON.stringify(hiddenCompanies));
    localStorage.setItem('dev_dashboard_memos', JSON.stringify(memos));
  }, [bookmarkedJobs, hiddenCompanies, memos]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setDisplayCount((prev) => prev + 20);
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
        setSearchQuery("");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [news.length]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('dev_dashboard_theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const getTopSkills = () => {
    const skillCounts: Record<string, number> = {};
    jobs.forEach(job => {
      job.skills?.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    return Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(entry => entry[0]);
  };

  const topSkills = getTopSkills();
  const filterOptions = ["All", "Bookmark", "Hidden", ...topSkills];
  const platformOptions = [
    { id: "All", label: "전체 플랫폼" },
    { id: "jumpit", label: "점핏" },
    { id: "saramin", label: "사람인" },
    { id: "wanted", label: "원티드" }
  ];

  const filteredJobs = jobs.filter(job => {
    if (selectedSkill === "Hidden") return hiddenCompanies.includes(job.company);
    if (hiddenCompanies.includes(job.company)) return false;

    const matchPlatform = selectedPlatform === "All" || job.id.startsWith(selectedPlatform);
    let matchSkill = selectedSkill === "All" || (selectedSkill === "Bookmark" ? bookmarkedJobs.includes(job.id) : job.skills?.includes(selectedSkill));
    
    if (selectedSkill === "Custom") {
      matchSkill = customSkills.length === 0 || customSkills.every(s => job.skills?.some(js => js.toLowerCase().includes(s.toLowerCase())));
    }

    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = keyword === "" || job.company.toLowerCase().includes(keyword) || job.title.toLowerCase().includes(keyword);

    return matchSkill && matchSearch && matchPlatform;
  });

  const visibleJobs = filteredJobs.slice(0, displayCount);

  const toggleBookmark = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); e.stopPropagation();
    setBookmarkedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };

  const toggleHiddenCompany = (e: React.MouseEvent, companyName: string) => {
    e.preventDefault(); e.stopPropagation();
    setHiddenCompanies(prev => prev.includes(companyName) ? prev.filter(n => n !== companyName) : [...prev, companyName]);
  };

  const handleShare = async (e: React.MouseEvent, job: Job) => {
    e.preventDefault(); e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: `${job.company} - ${job.title}`, url: job.url });
      } else {
        await navigator.clipboard.writeText(job.url);
        alert('링크가 복사되었습니다.');
      }
    } catch (err) {}
  };

  const handleMemo = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); e.stopPropagation();
    const newMemo = window.prompt("메모를 남겨주세요:", memos[jobId] || "");
    if (newMemo !== null) {
      setMemos(prev => {
        const updated = { ...prev };
        if (newMemo.trim() === "") delete updated[jobId];
        else updated[jobId] = newMemo;
        return updated;
      });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const getPlatformBadge = (id: string) => {
    if (id.startsWith('jumpit')) return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">점핏</span>;
    if (id.startsWith('saramin')) return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">사람인</span>;
    if (id.startsWith('wanted')) return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300">원티드</span>;
    return null;
  };

  const addCurrentSkill = () => {
    const newSkill = currentInput.trim();
    if (newSkill !== '' && !customSkills.includes(newSkill)) {
      setCustomSkills(prev => [...prev, newSkill]);
      setCurrentInput("");
      setSelectedSkill("Custom");
      setDisplayCount(20);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 transition-colors duration-200 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-bold">채용공고</Link>
              <Link href="/trend" className="hover:text-blue-600 dark:hover:text-blue-400">기술트렌드</Link>
              <Link href="/calendar" className="hover:text-blue-600 dark:hover:text-blue-400">IT 캘린더</Link>
            </nav>
            <button onClick={toggleDarkMode} className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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

      <main className="grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          {news.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center overflow-hidden">
              <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded mr-3 shrink-0">IT 뉴스</span>
              <div className="flex-1 truncate">
                <a href={news[currentNewsIndex].url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
                  {news[currentNewsIndex].title}
                </a>
              </div>
            </div>
          )}

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b dark:border-gray-700 gap-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">최신 채용 공고</h2>
              {!isLoading && (
                <div className="w-full sm:w-64 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="회사명, 제목 검색 (/ 또는 Cmd+K)"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setDisplayCount(20); }}
                    className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            {!isLoading && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPlatform(p.id); setDisplayCount(20); }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                        selectedPlatform === p.id ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 border-transparent' : 'bg-white text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {filterOptions.map(skill => (
                    <button
                      key={skill}
                      onClick={() => { setSelectedSkill(skill); setDisplayCount(20); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedSkill === skill ? (skill === "Bookmark" ? 'bg-yellow-500 text-white' : skill === "Hidden" ? 'bg-red-500 text-white' : 'bg-blue-600 text-white') : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {skill === "All" ? "전체 보기" : skill === "Bookmark" ? "⭐ 찜한 공고" : skill === "Hidden" ? "🚫 숨긴 기업" : skill}
                    </button>
                  ))}
                  
                  <div className={`flex flex-wrap items-center gap-1.5 px-3 py-1.5 ml-1 rounded-full border transition-all ${selectedSkill === "Custom" || customSkills.length > 0 ? 'bg-blue-50 border-blue-300' : 'bg-white dark:bg-gray-700 border-gray-200'}`}>
                    {customSkills.map((skill, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">
                        {skill}
                        <button onClick={() => {
                          const newSkills = customSkills.filter(s => s !== skill);
                          setCustomSkills(newSkills);
                          if(newSkills.length === 0 && selectedSkill === "Custom") setSelectedSkill("All");
                        }} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="추가 스택..."
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') addCurrentSkill(); else if (e.key === 'Backspace' && currentInput === '') { const n=[...customSkills]; n.pop(); setCustomSkills(n); if(n.length===0) setSelectedSkill("All"); } }}
                      onBlur={addCurrentSkill}
                      className="bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none w-24"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl animate-pulse bg-white dark:bg-gray-800">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))
              ) : visibleJobs.length > 0 ? (
                visibleJobs.map((job) => {
                  const isBookmarked = bookmarkedJobs.includes(job.id);
                  const isHidden = hiddenCompanies.includes(job.company);
                  
                  return (
                    <div key={job.id} className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50/30 dark:hover:bg-gray-700 transition-all group relative bg-white dark:bg-gray-800 cursor-pointer" onClick={() => window.open(job.url, '_blank')}>
                      <div className="flex justify-between items-start">
                        <div className="pr-40">
                          <div className="flex items-center gap-3 mb-2">
                            {getPlatformBadge(job.id)}
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{job.company}</p>
                            <div className="flex gap-1.5 ml-1">
                              <a href={`https://www.jobplanet.co.kr/search?query=${encodeURIComponent(job.company)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-0.5 bg-[#00c362] text-white rounded font-bold hover:bg-[#00a854] transition-colors" onClick={(e) => e.stopPropagation()}>잡플래닛</a>
                              <a href={`https://www.teamblind.com/kr/company/${encodeURIComponent(job.company)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-0.5 bg-[#37abc8] text-white rounded font-bold hover:bg-[#2f92ab] transition-colors" onClick={(e) => e.stopPropagation()}>블라인드</a>
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors text-base">{job.title}</h3>
                        </div>
                        <div className="absolute top-4 right-4 flex gap-1">
                          <button onClick={(e) => handleMemo(e, job.id)} className={`p-1.5 rounded-full transition-all ${memos[job.id] ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}>📝</button>
                          <button onClick={(e) => handleShare(e, job)} className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50">🔗</button>
                          <button onClick={(e) => toggleHiddenCompany(e, job.company)} className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50">{isHidden ? '복구' : '🚫'}</button>
                          <button onClick={(e) => toggleBookmark(e, job.id)} className={`p-1.5 rounded-full ${isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`}>{isBookmarked ? '★' : '☆'}</button>
                        </div>
                      </div>
                      
                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => <span key={index} className="px-2.5 py-1 bg-white dark:bg-gray-700 text-blue-600 text-[11px] rounded-md border border-blue-100 dark:border-gray-600 font-medium">{skill}</span>)}
                        </div>
                      )}

                      {memos[job.id] && (
                        <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-200" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-start gap-2"><span className="mt-0.5">📌</span><p className="whitespace-pre-wrap flex-1">{memos[job.id]}</p></div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10"><p className="text-sm text-gray-400">검색 조건에 맞는 공고가 없습니다.</p></div>
              )}
            </div>

            {!isLoading && visibleJobs.length < filteredJobs.length && (
              <div ref={loaderRef} className="py-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-xl flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200 dark:border-gray-700">
            AdSense 광고 영역
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 pl-2">IT 커리어 일정</h2>
              <Link href="/calendar" className="text-[10px] text-blue-500 hover:underline">전체보기</Link>
            </div>
            <ul className="text-xs space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2 underline underline-offset-4">• 정보처리기사 실기 시험 접수</li>
              <li className="flex gap-2 underline underline-offset-4">• 상반기 주요 IT 기업 공채 시작</li>
              <li className="flex gap-2 underline underline-offset-4">• 부트캠프 및 교육생 모집 소식</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-10 mt-12 pb-24 md:pb-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-bold text-gray-400">© 2026 Dev Dashboard</p>
        </div>
      </footer>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-24 md:bottom-8 right-8 p-3 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:-translate-y-1 transition-all z-40">↑</button>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-50">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-blue-600"><span className="text-xl mb-1">💼</span><span className="text-[10px] font-medium">채용공고</span></Link>
        <Link href="/trend" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600"><span className="text-xl mb-1">📈</span><span className="text-[10px] font-medium">트렌드</span></Link>
        <Link href="/calendar" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600"><span className="text-xl mb-1">📅</span><span className="text-[10px] font-medium">캘린더</span></Link>
        <button onClick={toggleDarkMode} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600"><span className="text-xl mb-1">{isDarkMode ? '🌙' : '☀️'}</span><span className="text-[10px] font-medium">테마</span></button>
      </nav>
    </div>
  );
}