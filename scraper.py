import os
import json
import requests
import re
from datetime import datetime

def fetch_jumpit_jobs():
    url = "https://api.jumpit.co.kr/api/positions"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    params = {"sort": "reg_dt", "page": 1}
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        data = response.json()
        jobs = []
        for item in data.get("result", {}).get("positions", []):
            job_id = item.get("id")
            jobs.append({
                "id": f"jumpit_{job_id}",
                "company": item.get("companyName"),
                "title": item.get("title"),
                "skills": item.get("techStacks", []),
                "url": f"https://www.jumpit.co.kr/position/{job_id}"
            })
        return jobs
    except: return []

def fetch_saramin_jobs():
    url = "https://www.saramin.co.kr/zf_user/search/recruit"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    params = {"searchword": "개발자", "recruitPage": 1, "recruitSort": "reg_dt"}
    try:
        from bs4 import BeautifulSoup
        response = requests.get(url, headers=headers, params=params, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        jobs = []
        for item in soup.select('.item_recruit'):
            try:
                job_id = item.get('value')
                company = item.select_one('.corp_name a').text.strip()
                title_elem = item.select_one('.job_tit a')
                jobs.append({
                    "id": f"saramin_{job_id}",
                    "company": company,
                    "title": title_elem.text.strip(),
                    "skills": [],
                    "url": "https://www.saramin.co.kr" + title_elem['href']
                })
            except: continue
        return jobs
    except: return []

def fetch_wanted_jobs():
    url = "https://www.wanted.co.kr/api/v4/jobs"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    params = {"country": "kr", "tag_type_ids": "518", "limit": "20", "job_sort": "job.latest_order"}
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        data = response.json()
        jobs = []
        for item in data.get("data", []):
            jobs.append({
                "id": f"wanted_{item.get('id')}",
                "company": item.get("company", {}).get("name"),
                "title": item.get("position"),
                "skills": [],
                "url": f"https://www.wanted.co.kr/wd/{item.get('id')}"
            })
        return jobs
    except: return []

def fetch_it_events_universal():
    url = "https://raw.githubusercontent.com/brave-people/Dev-Event/master/README.md"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        lines = response.text.split('\n')
        
        events = []
        now = datetime.now()
        
        for idx, line in enumerate(lines):
            # [제목](링크) 추출
            link_match = re.search(r'\[(.*?)\]\((https?://.*?)\)', line)
            if not link_match: continue
            
            title = link_match.group(1).strip()
            link = link_match.group(2).strip()
            
            if any(x in link.lower() for x in ["brave-people", "contributing"]): continue
            
            # MM/DD 또는 MM.DD 형식 추출
            date_match = re.search(r'(\d{1,2})[./](\d{1,2})', line)
            if date_match:
                month = int(date_match.group(1))
                day = int(date_match.group(2))
                try:
                    event_date = datetime(2026, month, day)
                    # 2026년 오늘 기준 종료된 이벤트 제외
                    if event_date.date() < now.date(): continue
                    full_date = event_date.strftime('%Y-%m-%dT09:00:00Z')
                except: continue
            else: continue

            events.append({
                "id": f"event_{idx}",
                "title": title,
                "date": full_date,
                "host": "IT 커뮤니티",
                "url": link,
                "type": "IT 행사"
            })
            
        return sorted(events, key=lambda x: x['date'])
    except Exception as e:
        print(f"Universal Parsing Error: {e}")
        return []

def main():
    save_dir = "public"
    if not os.path.exists(save_dir): os.makedirs(save_dir)

    all_jobs = fetch_jumpit_jobs() + fetch_saramin_jobs() + fetch_wanted_jobs()
    with open(os.path.join(save_dir, "jobs_data.json"), "w", encoding="utf-8") as f:
        json.dump(all_jobs, f, ensure_ascii=False, indent=2)

    all_events = fetch_it_events_universal()
    with open(os.path.join(save_dir, "events_data.json"), "w", encoding="utf-8") as f:
        json.dump(all_events, f, ensure_ascii=False, indent=2)
        
    print(f"Job crawling completed: {len(all_jobs)} jobs saved.")
    print(f"Event crawling completed: {len(all_events)} events saved.")

if __name__ == "__main__":
    main()