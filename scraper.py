import os
import json
import requests
import re
import time  # 🚀 차단 방지용 매너 타임 추가

COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9"
}

def extract_skills_from_title(title):
    skills = []
    title_lower = title.lower()
    keyword_map = {
        "java": "Java", "python": "Python", "react": "React", "vue": "Vue",
        "node": "Node.js", "spring": "Spring", "c++": "C++", "c#": "C#",
        "devops": "DevOps", "aws": "AWS", "ios": "iOS", "android": "Android",
        "백엔드": "Backend", "프론트": "Frontend", "데이터": "Data",
        "인프라": "Infra", "ai": "AI", "머신러닝": "Machine Learning",
        "db": "DB", "dba": "DBA", "퍼블리셔": "Publisher", "보안": "Security",
        "go": "Go", "php": "PHP", "ruby": "Ruby", "unity": "Unity", "unreal": "Unreal"
    }
    for key, val in keyword_map.items():
        if key in title_lower:
            if key == "go" and not re.search(r'\bgo\b', title_lower):
                continue
            skills.append(val)
    return skills

def fetch_jumpit_jobs():
    jobs = []
    # 🚀 1페이지부터 3페이지까지 딥 스크래핑
    for page in range(1, 4):
        url = "https://api.jumpit.co.kr/api/positions"
        params = {"sort": "reg_dt", "page": page}
        try:
            response = requests.get(url, headers=COMMON_HEADERS, params=params, timeout=10)
            data = response.json()
            for item in data.get("result", {}).get("positions", []):
                job_id = item.get("id")
                title = item.get("title")
                skills = item.get("techStacks", [])
                if not skills: skills = extract_skills_from_title(title)
                jobs.append({
                    "id": f"jumpit_{job_id}",
                    "company": item.get("companyName"),
                    "title": title,
                    "skills": skills,
                    "url": f"https://www.jumpit.co.kr/position/{job_id}"
                })
            time.sleep(1) # 차단 방지를 위한 1초 휴식
        except: continue
    return jobs

def fetch_saramin_jobs():
    jobs = []
    try:
        from bs4 import BeautifulSoup
        # 🚀 1페이지부터 3페이지까지 딥 스크래핑
        for page in range(1, 4):
            url = "https://www.saramin.co.kr/zf_user/search/recruit"
            params = {"searchword": "개발자", "recruitPage": page, "recruitSort": "reg_dt"}
            response = requests.get(url, headers=COMMON_HEADERS, params=params, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            for item in soup.select('.item_recruit'):
                try:
                    job_id = item.get('value')
                    company = item.select_one('.corp_name a').text.strip()
                    title = item.select_one('.job_tit a').text.strip()
                    url_href = "https://www.saramin.co.kr" + item.select_one('.job_tit a')['href']
                    skills = extract_skills_from_title(title)
                    jobs.append({
                        "id": f"saramin_{job_id}",
                        "company": company, "title": title, "skills": skills, "url": url_href
                    })
                except: continue
            time.sleep(1) # 1초 휴식
        return jobs
    except: return []

def fetch_wanted_jobs():
    url = "https://www.wanted.co.kr/api/v4/jobs"
    # 🚀 limit을 20에서 100으로 대폭 상향 (한 번에 와장창 가져오기)
    params = {"country": "kr", "tag_type_ids": "518", "limit": "100", "job_sort": "job.latest_order"}
    try:
        response = requests.get(url, headers=COMMON_HEADERS, params=params, timeout=10)
        data = response.json()
        jobs = []
        for item in data.get("data", []):
            title = item.get("position")
            skills = extract_skills_from_title(title)
            jobs.append({
                "id": f"wanted_{item.get('id')}",
                "company": item.get("company", {}).get("name"),
                "title": title, "skills": skills, "url": f"https://www.wanted.co.kr/wd/{item.get('id')}"
            })
        return jobs
    except: return []

# 🚀 신규 추가: 프로그래머스 (Wide 스크래핑)
def fetch_programmers_jobs():
    jobs = []
    try:
        from bs4 import BeautifulSoup
        # 프로그래머스 1~2페이지 수집
        for page in range(1, 3):
            url = f"https://career.programmers.co.kr/job?page={page}"
            response = requests.get(url, headers=COMMON_HEADERS, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            for item in soup.select('.list-position-item'):
                try:
                    title_el = item.select_one('.position-title a')
                    company_el = item.select_one('.company-name')
                    if not title_el or not company_el: continue
                    
                    job_id = title_el['href'].split('/')[-1]
                    title = title_el.text.strip()
                    company = company_el.text.strip()
                    url_href = "https://career.programmers.co.kr" + title_el['href']
                    skills = extract_skills_from_title(title)

                    jobs.append({
                        "id": f"programmers_{job_id}",
                        "company": company,
                        "title": title,
                        "skills": skills,
                        "url": url_href
                    })
                except: continue
            time.sleep(1)
        return jobs
    except: return []

def fetch_it_news():
    url = "https://news.hada.io/"
    try:
        from bs4 import BeautifulSoup
        response = requests.get(url, headers=COMMON_HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        news = []
        for item in soup.select('.topictitle a'):
            title = item.text.strip()
            link = item.get('href', '')
            if not link.startswith('http'): link = "https://news.hada.io" + link
            news.append({"title": title, "url": link})
        return news[:15]
    except Exception as e:
        print(f"News Parsing Error: {e}")
        return []

def main():
    save_dir = "public"
    if not os.path.exists(save_dir): os.makedirs(save_dir)

    # 🚀 프로그래머스 추가 수집 병합
    all_jobs = fetch_jumpit_jobs() + fetch_saramin_jobs() + fetch_wanted_jobs() + fetch_programmers_jobs()
    with open(os.path.join(save_dir, "jobs_data.json"), "w", encoding="utf-8") as f:
        json.dump(all_jobs, f, ensure_ascii=False, indent=2)

    all_news = fetch_it_news()
    with open(os.path.join(save_dir, "news_data.json"), "w", encoding="utf-8") as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)
        
    print(f"Job crawling completed: {len(all_jobs)} jobs saved.")
    print(f"News crawling completed: {len(all_news)} news saved.")

if __name__ == "__main__":
    main()