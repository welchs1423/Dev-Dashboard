interface Job {
  id: string;
  company: string;
  title: string;
  skills: string[]; 
  url: string;
}

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  isHidden: boolean;
  isClicked: boolean; // 읽음 처리 상태 추가
  memo?: string;
  onBookmark: (e: React.MouseEvent, jobId: string) => void;
  onHide: (e: React.MouseEvent, companyName: string) => void;
  onMemo: (e: React.MouseEvent, jobId: string) => void;
  onShare: (e: React.MouseEvent, job: Job) => void;
  onClickEvent: (jobId: string, url: string) => void; // 클릭 핸들러 추가
}

export default function JobCard({
  job,
  isBookmarked,
  isHidden,
  isClicked,
  memo,
  onBookmark,
  onHide,
  onMemo,
  onShare,
  onClickEvent
}: JobCardProps) {
  const getPlatformBadge = (id: string) => {
    if (id.startsWith('jumpit')) return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">점핏</span>;
    if (id.startsWith('saramin')) return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">사람인</span>;
    if (id.startsWith('wanted')) return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300">원티드</span>;
    return null;
  };

  return (
    <div 
      // isClicked가 true면 배경을 회색으로, 투명도를 60%로 낮춰서 '읽은 느낌' 부여
      className={`block p-5 border border-gray-100 dark:border-gray-700 rounded-xl transition-all group relative cursor-pointer ${isClicked ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60' : 'bg-white dark:bg-gray-800 hover:bg-blue-50/30 dark:hover:bg-gray-700'}`} 
      onClick={() => onClickEvent(job.id, job.url)}
    >
      <div className="flex justify-between items-start">
        <div className="pr-40">
          <div className="flex items-center gap-3 mb-2">
            {getPlatformBadge(job.id)}
            <p className={`text-sm font-medium ${isClicked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{job.company}</p>
            <div className="flex gap-1.5 ml-1">
              <a href={`https://www.jobplanet.co.kr/search?query=${encodeURIComponent(job.company)}`} target="_blank" rel="noopener noreferrer" className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${isClicked ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-[#00c362] text-white hover:bg-[#00a854]'}`} onClick={(e) => e.stopPropagation()}>잡플래닛</a>
              <a href={`https://www.teamblind.com/kr/company/${encodeURIComponent(job.company)}`} target="_blank" rel="noopener noreferrer" className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${isClicked ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-[#37abc8] text-white hover:bg-[#2f92ab]'}`} onClick={(e) => e.stopPropagation()}>블라인드</a>
            </div>
          </div>
          <h3 className={`font-bold transition-colors text-base ${isClicked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-600'}`}>
            {job.title}
          </h3>
        </div>
        <div className="absolute top-4 right-4 flex gap-1">
          <button onClick={(e) => onMemo(e, job.id)} className={`p-1.5 rounded-full transition-all ${memo ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}>📝</button>
          <button onClick={(e) => onShare(e, job)} className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50">🔗</button>
          <button onClick={(e) => onHide(e, job.company)} className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50">{isHidden ? '복구' : '🚫'}</button>
          <button onClick={(e) => onBookmark(e, job.id)} className={`p-1.5 rounded-full ${isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`}>{isBookmarked ? '★' : '☆'}</button>
        </div>
      </div>

      {memo && (
        <div className={`mt-3 p-3 text-xs rounded-lg border ${isClicked ? 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:border-gray-600' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-2"><span className="mt-0.5">📌</span><p className="whitespace-pre-wrap flex-1">{memo}</p></div>
        </div>
      )}
    </div>
  );
}