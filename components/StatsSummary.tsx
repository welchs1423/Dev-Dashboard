interface Job {
  id: string;
  skills?: string[];
}

interface StatsSummaryProps {
  jobs: Job[];
  topSkills: string[];
}

export default function StatsSummary({ jobs, topSkills }: StatsSummaryProps) {
  const totalJobs = jobs.length;
  const jumpitCount = jobs.filter(j => j.id.startsWith('jumpit')).length;
  const saraminCount = jobs.filter(j => j.id.startsWith('saramin')).length;
  const wantedCount = jobs.filter(j => j.id.startsWith('wanted')).length;

  if (totalJobs === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">오늘 수집된 공고</span>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{totalJobs}</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">개</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">플랫폼별 비율</span>
        <div className="flex w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div style={{ width: `${(jumpitCount/totalJobs)*100}%` }} className="bg-blue-500"></div>
          <div style={{ width: `${(saraminCount/totalJobs)*100}%` }} className="bg-green-500"></div>
          <div style={{ width: `${(wantedCount/totalJobs)*100}%` }} className="bg-cyan-500"></div>
        </div>
        <div className="flex justify-between text-[10px] font-medium text-gray-500">
          <span>점핏 {jumpitCount}</span>
          <span>사람인 {saraminCount}</span>
          <span>원티드 {wantedCount}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">실시간 Top 3 스택</span>
        <div className="flex gap-2">
          {topSkills.slice(0, 3).map((skill, idx) => (
            <span key={skill} className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-md border border-gray-200 dark:border-gray-600 flex-1 text-center truncate">
              {idx + 1}. {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}