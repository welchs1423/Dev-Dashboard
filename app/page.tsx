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

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const savedMemos = localStorage.getItem('dev_dashboard_memos');
      if (savedMemos) {
        setMemos(JSON.parse(savedMemos));
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
    localStorage.setItem('dev_dashboard_memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prevCount) => prevCount + 20);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(loaderRef.current);
      }
    };
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

  const platformOptions = [
    { id: "All", label: "전체 플랫폼" },
    { id: "jumpit", label: "점핏" },
    { id: "saramin", label: "사람인" },
    { id: "wanted", label: "원티드" }
  ];

  const filteredJobs = jobs.filter(job => {
    if (selectedSkill === "Hidden") {
      return hiddenCompanies.includes(job.company);
    }

    if (hiddenCompanies.includes(job.company)) {
      return false;
    }

    const matchPlatform = selectedPlatform === "All" || job.id.startsWith(selectedPlatform);

    let matchSkill = false;
    if (selectedSkill === "All") {
      matchSkill = true;
    } else if (selectedSkill === "Bookmark") {
      matchSkill = bookmarkedJobs.includes(job.id);
    } else if (selectedSkill === "Custom") {
      if (customSkills.length === 0) {
        matchSkill = true;
      } else {
        matchSkill = customSkills.every(custom => 
          job.skills && job.skills.some(s => s.toLowerCase().includes(custom.toLowerCase()))
        );
      }
    } else {
      matchSkill = job.skills && job.skills.includes(selectedSkill);
    }

    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = keyword === "" || 
      job.company.toLowerCase().includes(keyword) || 
      job.title.toLowerCase().includes(keyword);

    return matchSkill && matchSearch && matchPlatform;
  });

  const visibleJobs = filteredJobs.slice(0, displayCount);

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

  const handleShare = async (e: React.MouseEvent, job: Job) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: job.title,
      text: `${job.company} - ${job.title}`,
      url: job.url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(job.url);
        alert('공고 링크가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleMemo = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const existingMemo = memos[jobId] || "";
    const newMemo = window.prompt("이 공고에 대한 메모를 남겨주세요 (비워두면 삭제됩니다):", existingMemo);
    
    if (newMemo !== null) {
      setMemos(prev => {
        const updated = { ...prev };
        if (newMemo.trim() === "") {
          delete updated[jobId];
        } else {
          updated[jobId] = newMemo;
        }
        return updated;
      });
    }
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

  const addCurrentSkill = () => {
    const newSkill = currentInput.trim();
    if (newSkill !== '') {
      if (!customSkills.includes(newSkill)) {
        setCustomSkills(prev => [...prev, newSkill]);
      }
      setCurrentInput("");
      setSelectedSkill("Custom");
      setDisplayCount(20);
    }
  };

  const handleCustomSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCurrentSkill();
    } else if (e.key === 'Backspace' && currentInput === '' && customSkills.length > 0) {
      const newSkills = [...customSkills];
      newSkills.pop();
      setCustomSkills(newSkills);
      if (newSkills.length === 0) setSelectedSkill("All");
      setDisplayCount(20);
    }
  };

  const handleCustomSkillBlur = () => {
    addCurrentSkill();
  };

  const removeCustomSkill = (skillToRemove: string) => {
    const newSkills = customSkills.filter(skill => skill !== skillToRemove);
    setCustomSkills(newSkills);
    if (newSkills.length === 0 && selectedSkill === "Custom") {
      setSelectedSkill("All");
    }
    setDisplayCount(20);
  };

  const exportData = () => {
    const data = {
      bookmarks: bookmarkedJobs,
      hidden: hiddenCompanies,
      memos: memos
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dev_dashboard_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        if (data.bookmarks && Array.isArray(data.bookmarks)) {
          setBookmarkedJobs(data.bookmarks);
        }
        if (data.hidden && Array.isArray(data.hidden)) {
          setHiddenCompanies(data.hidden);
        }
        if (data.memos && typeof data.memos === 'object') {
          setMemos(data.memos);
        }
        alert('데이터 복원이 완료되었습니다.');
      } catch (err) {
        console.error("Import failed:", err);
        alert('잘못된 백업 파일입니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b dark:border-gray-700 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">최신 채용 공고</h2>
              </div>
              
              {!isLoading && (
                <div className="w-full sm:w-64 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="회사명, 제목 검색 (/ 또는 Cmd+K)"
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
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPlatform(p.id); setDisplayCount(20); }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                        selectedPlatform === p.id
                          ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
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
                  
                  <div className={`flex flex-wrap items-center gap-1.5 px-3 py-1.5 ml-1 rounded-full border transition-all ${
                    selectedSkill === "Custom" || customSkills.length > 0
                      ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700' 
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}>
                    {customSkills.map((skill, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-[11px] font-bold rounded-md">
                        {skill}
                        <button
                          onClick={() => removeCustomSkill(skill)}
                          className="hover:text-red-500 focus:outline-none flex items-center justify-center"
                          title="태그 삭제"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={customSkills.length === 0 ? "🔍 다중 스택 입력 후 Enter" : "추가 스택..."}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={handleCustomSkillKeyDown}
                      onBlur={handleCustomSkillBlur}
                      onFocus={() => {
                        if (customSkills.length > 0) setSelectedSkill("Custom");
                      }}
                      className={`bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none placeholder-gray-400 transition-all ${
                        customSkills.length === 0 ? 'w-40 focus:w-48' : 'w-24 focus:w-32'
                      }`}
                    />
                  </div>
                </div>
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
                    <div 
                      key={job.id} 
                      className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-blue-50/30 dark:hover:bg-gray-700 transition-all group relative bg-white dark:bg-gray-800 cursor-pointer"
                      onClick={() => window.open(job.url, '_blank')}
                    >
                      <div className="flex justify-between items-start">
                        <div className="pr-40">
                          <div className="flex items-center gap-3 mb-2">
                            {getPlatformBadge(job.id)}
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{job.company}</p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                  href={`https://www.google.com/search?q=잡플래닛 ${encodeURIComponent(job.company)}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 transition-colors" 
                                  title="잡플래닛 검색" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  JP
                                </a>
                                <a 
                                  href={`https://www.google.com/search?q=블라인드 ${encodeURIComponent(job.company)}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 transition-colors" 
                                  title="블라인드 검색" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  B
                                </a>
                              </div>
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">
                            {job.title}
                          </h3>
                        </div>
                        <div className="absolute top-4 right-4 flex gap-1 items-center">
                          <button
                            onClick={(e) => handleMemo(e, job.id)}
                            className={`p-1.5 rounded-full transition-all ${
                              memos[job.id] 
                                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 hover:scale-110 active:scale-95' 
                                : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-110 active:scale-95'
                            }`}
                            title="메모 남기기"
                          >
                            📝
                          </button>
                          <button
                            onClick={(e) => handleShare(e, job)}
                            className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-110 active:scale-95 transition-all"
                            title="공유하기"
                          >
                            🔗
                          </button>
                          <button
                            onClick={(e) => toggleHiddenCompany(e, job.company)}
                            className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110 active:scale-95 transition-all"
                            title={isHidden ? '숨김 해제' : '기업 숨기기'}
                          >
                            {isHidden ? '복구' : '🚫'}
                          </button>
                          <button
                            onClick={(e) => toggleBookmark(e, job.id)}
                            className={`p-1.5 rounded-full hover:scale-110 active:scale-95 transition-all ${
                              isBookmarked 
                                ? 'text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30' 
                                : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                            }`}
                            title={isBookmarked ? '북마크 해제' : '북마크'}
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

                      {memos[job.id] && (
                        <div 
                          className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded-lg border border-yellow-200 dark:border-yellow-800/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-500 mt-0.5">📌</span>
                            <p className="whitespace-pre-wrap flex-1">{memos[job.id]}</p>
                          </div>
                        </div>
                      )}
                    </div>
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
              <div ref={loaderRef} className="py-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">다음 공고를 불러오는 중입니다...</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-sm font-bold mb-4 text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 dark:border-blue-400 pl-2">데이터 백업 / 복원</h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">로컬스토리지에 저장된 찜, 메모, 숨긴 기업 목록을 JSON 파일로 내보내거나 불러옵니다.</p>
            <div className="flex gap-2">
              <button onClick={exportData} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">백업하기</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">복원하기</button>
              <input type="file" accept=".json" ref={fileInputRef} onChange={importData} className="hidden" />
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200">
            AdSense 광고 영역
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 dark:border-blue-400 pl-2">IT 커리어 일정</h2>
              <Link href="/calendar" className="text-[10px] text-blue-500 hover:underline">전체보기</Link>
            </div>
            <ul className="text-xs space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2 underline decoration-gray-100 dark:decoration-gray-700 underline-offset-4">• 정보처리기사 실기 시험 접수</li>
              <li className="flex gap-2 underline decoration-gray-100 dark:decoration-gray-700 underline-offset-4">• 상반기 주요 IT 기업 공채 시작</li>
              <li className="flex gap-2 underline decoration-gray-100 dark:decoration-gray-700 underline-offset-4">• 부트캠프 및 교육생 모집 소식</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-10 mt-12 pb-24 md:pb-10 transition-colors duration-200">
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
          className="fixed bottom-24 md:bottom-8 right-8 p-3 w-12 h-12 flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 hover:-translate-y-1 transition-all z-40"
        >
          ↑
        </button>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-50 transition-colors duration-200 pb-safe">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-blue-600 dark:text-blue-400">
          <span className="text-xl mb-1">💼</span>
          <span className="text-[10px] font-medium">채용공고</span>
        </Link>
        <Link href="/trend" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span className="text-xl mb-1">📈</span>
          <span className="text-[10px] font-medium">트렌드</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
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