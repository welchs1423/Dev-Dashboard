"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsTicker from '../components/NewsTicker';
import JobCard from '../components/JobCard';
import StatsSummary from '../components/StatsSummary';

interface Job { id: string; company: string; title: string; skills: string[]; url: string; }
interface NewsItem { title: string; url: string; }

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [displayCount, setDisplayCount] = useState<number>(20);
  
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [clickedJobs, setClickedJobs] = useState<string[]>([]); // 열어본 공고 상태 추가
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/jobs_data.json').then(res => res.json()).then((data: Job[]) => {
      const uniqueJobs = data.filter((job, index, self) => index === self.findIndex((t) => t.company.trim() === job.company.trim() && t.title.trim() === job.title.trim()));
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
      setJobs(mixedJobs); setIsLoading(false);
    }).catch(() => setIsLoading(false));

    fetch('/news_data.json').then(res => res.json()).then(data => { if (data && data.length > 0) setNews(data); }).catch(() => {});

    setTimeout(() => {
      const savedBookmarks = localStorage.getItem('dev_dashboard_bookmarks'); if (savedBookmarks) setBookmarkedJobs(JSON.parse(savedBookmarks));
      const savedHidden = localStorage.getItem('dev_dashboard_hidden'); if (savedHidden) setHiddenCompanies(JSON.parse(savedHidden));
      const savedMemos = localStorage.getItem('dev_dashboard_memos'); if (savedMemos) setMemos(JSON.parse(savedMemos));
      const savedClicked = localStorage.getItem('dev_dashboard_clicked'); if (savedClicked) setClickedJobs(JSON.parse(savedClicked));
    }, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem('dev_dashboard_bookmarks', JSON.stringify(bookmarkedJobs));
    localStorage.setItem('dev_dashboard_hidden', JSON.stringify(hiddenCompanies));
    localStorage.setItem('dev_dashboard_memos', JSON.stringify(memos));
    localStorage.setItem('dev_dashboard_clicked', JSON.stringify(clickedJobs));
  }, [bookmarkedJobs, hiddenCompanies, memos, clickedJobs]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setDisplayCount(prev => prev + 20); }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInputRef.current?.focus(); }
      else if (e.key === '/' && document.activeElement !== searchInputRef.current) { e.preventDefault(); searchInputRef.current?.focus(); }
      else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) { searchInputRef.current?.blur(); setSearchQuery(""); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 통계용 스택 추출 로직은 유지
  const getTopSkills = () => {
    const skillCounts: Record<string, number> = {};
    jobs.forEach(job => job.skills?.forEach(skill => skillCounts[skill] = (skillCounts[skill] || 0) + 1));
    return Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(entry => entry[0]);
  };

  // 스택 필터 지우고 핵심 필터만 남김
  const filterOptions = ["All", "Bookmark", "Memo", "Unread", "Hidden"];
  const platformOptions = [{ id: "All", label: "전체 플랫폼" }, { id: "jumpit", label: "점핏" }, { id: "saramin", label: "사람인" }, { id: "wanted", label: "원티드" }];

  const filteredJobs = jobs.filter(job => {
    if (selectedFilter === "Hidden") return hiddenCompanies.includes(job.company);
    if (hiddenCompanies.includes(job.company)) return false;

    const matchPlatform = selectedPlatform === "All" || job.id.startsWith(selectedPlatform);
    let matchCondition = false;
    
    if (selectedFilter === "All") matchCondition = true;
    else if (selectedFilter === "Bookmark") matchCondition = bookmarkedJobs.includes(job.id);
    else if (selectedFilter === "Memo") matchCondition = !!memos[job.id];
    else if (selectedFilter === "Unread") matchCondition = !clickedJobs.includes(job.id); // 안 읽은 공고만 보기 필터

    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = keyword === "" || job.company.toLowerCase().includes(keyword) || job.title.toLowerCase().includes(keyword);

    return matchCondition && matchSearch && matchPlatform;
  });

  const visibleJobs = filteredJobs.slice(0, displayCount);

  const toggleBookmark = (e: React.MouseEvent, jobId: string) => { e.preventDefault(); e.stopPropagation(); setBookmarkedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]); };
  const toggleHiddenCompany = (e: React.MouseEvent, companyName: string) => { e.preventDefault(); e.stopPropagation(); setHiddenCompanies(prev => prev.includes(companyName) ? prev.filter(n => n !== companyName) : [...prev, companyName]); };
  const handleShare = async (e: React.MouseEvent, job: Job) => { e.preventDefault(); e.stopPropagation(); try { if (navigator.share) await navigator.share({ title: job.title, text: `${job.company} - ${job.title}`, url: job.url }); else { await navigator.clipboard.writeText(job.url); alert('링크가 복사되었습니다.'); } } catch {} };
  const handleMemo = (e: React.MouseEvent, jobId: string) => { e.preventDefault(); e.stopPropagation(); const newMemo = window.prompt("메모를 남겨주세요:", memos[jobId] || ""); if (newMemo !== null) setMemos(prev => { const updated = { ...prev }; if (newMemo.trim() === "") delete updated[jobId]; else updated[jobId] = newMemo; return updated; }); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // 공고 클릭 시 읽음 처리 및 새 창 열기
  const handleJobClick = (jobId: string, url: string) => {
    if (!clickedJobs.includes(jobId)) {
      setClickedJobs(prev => [...prev, jobId]);
    }
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <Header />
      <main className="grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="md:col-span-2 space-y-6">
          <StatsSummary jobs={jobs} topSkills={getTopSkills()} />
          <NewsTicker news={news} />
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b dark:border-gray-700 gap-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">최신 채용 공고</h2>
              {!isLoading && (
                <div className="w-full sm:w-64 relative">
                  <input ref={searchInputRef} type="text" placeholder="회사명, 제목 검색 (/ 또는 Cmd+K)" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setDisplayCount(20); }} className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>

            {!isLoading && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map(p => <button key={p.id} onClick={() => { setSelectedPlatform(p.id); setDisplayCount(20); }} className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${selectedPlatform === p.id ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 border-transparent' : 'bg-white text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'}`}>{p.label}</button>)}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {filterOptions.map(filter => (
                    <button key={filter} onClick={() => { setSelectedFilter(filter); setDisplayCount(20); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedFilter === filter ? (filter === "Bookmark" ? 'bg-yellow-500 text-white' : filter === "Memo" ? 'bg-blue-500 text-white' : filter === "Hidden" ? 'bg-red-500 text-white' : filter === "Unread" ? 'bg-green-500 text-white' : 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900') : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      {filter === "All" ? "전체 보기" : filter === "Bookmark" ? "⭐ 찜한 공고" : filter === "Memo" ? "📝 내 메모" : filter === "Unread" ? "👀 안 읽은 공고" : "🚫 숨긴 기업"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl animate-pulse bg-white dark:bg-gray-800"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div><div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div></div>)
                : visibleJobs.length > 0 ? visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobs.includes(job.id)} isHidden={hiddenCompanies.includes(job.company)} isClicked={clickedJobs.includes(job.id)} memo={memos[job.id]} onBookmark={toggleBookmark} onHide={toggleHiddenCompany} onMemo={handleMemo} onShare={handleShare} onClickEvent={handleJobClick} />
                )) : <div className="text-center py-10"><p className="text-sm text-gray-400">검색 조건에 맞는 공고가 없습니다.</p></div>}
            </div>

            {!isLoading && visibleJobs.length < filteredJobs.length && <div ref={loaderRef} className="py-8 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div></div>}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-xl flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200 dark:border-gray-700">AdSense 광고 영역</div>
        </aside>
      </main>
      <Footer />
      {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-24 md:bottom-8 right-8 p-3 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:-translate-y-1 transition-all z-40">↑</button>}
    </div>
  );
}