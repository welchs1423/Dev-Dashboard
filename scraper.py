import os
import json
import requests
import re
from bs4 import BeautifulSoup

def fetch_jumpit_jobs():
    url = "https://api.jumpit.co.kr/api/positions"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    params = {
        "sort": "reg_dt",
        "page": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        jobs = []
        positions = data.get("result", {}).get("positions", [])

        for item in positions:
            job_id = item.get("id")
            jobs.append({
                "id": f"jumpit_{job_id}",
                "company": item.get("companyName"),
                "title": item.get("title"),
                "skills": item.get("techStacks", []),
                "url": f"https://www.jumpit.co.kr/position/{job_id}"
            })
        return jobs
    except Exception as e:
        print(f"Jumpit error: {e}")
        return []

def fetch_saramin_jobs():
    url = "https://www.saramin.co.kr/zf_user/search/recruit"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    }
    params = {
        "searchword": "개발자",
        "recruitPage": 1,
        "recruitSort": "reg_dt"
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        jobs = []
        
        item_list = soup.select('.item_recruit')
        for item in item_list:
            try:
                job_id = item.get('value')
                company = item.select_one('.corp_name a').text.strip()
                title_elem = item.select_one('.job_tit a')
                title = title_elem.text.strip()
                link = "https://www.saramin.co.kr" + title_elem['href']
                
                sector_elem = item.select_one('.job_sector')
                skills = []
                if sector_elem:
                    raw_skills = [s.strip() for s in sector_elem.text.strip().split(',') if s.strip()]
                    for s in raw_skills:
                        if "등록일" in s or "수정일" in s or re.search(r'\d{2}/\d{2}/\d{2}', s):
                            continue
                        if s.startswith("외"):
                            continue
                        skills.append(s)
                    skills = skills[:5]

                jobs.append({
                    "id": f"saramin_{job_id}",
                    "company": company,
                    "title": title,
                    "skills": skills,
                    "url": link
                })
            except Exception:
                continue
        return jobs
    except Exception as e:
        print(f"Saramin error: {e}")
        return []

def fetch_wanted_jobs():
    url = "https://www.wanted.co.kr/api/v4/jobs"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    params = {
        "country": "kr",
        "tag_type_ids": "518",
        "locations": "all",
        "limit": "20",
        "offset": "0",
        "job_sort": "job.latest_order"
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        jobs = []
        
        for item in data.get("data", []):
            job_id = item.get("id")
            company_name = item.get("company", {}).get("name")
            title = item.get("position")
            
            jobs.append({
                "id": f"wanted_{job_id}",
                "company": company_name,
                "title": title,
                "skills": [],
                "url": f"https://www.wanted.co.kr/wd/{job_id}"
            })
        return jobs
    except Exception as e:
        print(f"Wanted error: {e}")
        return []

def fetch_festa_events():
    url = "https://festa.io/api/v1/events?page=1&pageSize=20&order=startDate&excludeExternalEvents=false"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        events = []
        for item in data.get("rows", []):
            host_info = item.get('hostOrganization', 'Festa')
            if isinstance(host_info, dict):
                host_name = host_info.get('name', 'Festa')
            else:
                host_name = host_info

            events.append({
                "id": f"festa_{item['eventId']}",
                "title": item['name'],
                "date": item['startDate'],
                "host": host_name,
                "url": f"https://festa.io/events/{item['eventId']}",
                "type": "행사"
            })
        return events
    except Exception as e:
        print(f"Festa error: {e}")
        return []

def fetch_static_certs():
    return [
        {
            "id": "cert_info_process_1",
            "title": "2026년 정기 기사 1회 필기 (정보처리기사 등)",
            "date": "2026-02-15T09:00:00Z",
            "host": "Q-Net",
            "url": "https://www.q-net.or.kr",
            "type": "자격증"
        },
        {
            "id": "cert_info_process_2",
            "title": "2026년 정기 기사 1회 실기 (정보처리기사 등)",
            "date": "2026-04-20T09:00:00Z",
            "host": "Q-Net",
            "url": "https://www.q-net.or.kr",
            "type": "자격증"
        },
        {
            "id": "cert_sqld_1",
            "title": "2026년 제 52회 SQLD 자격검정",
            "date": "2026-03-10T10:00:00Z",
            "host": "한국데이터산업진흥원",
            "url": "https://www.dataq.or.kr",
            "type": "자격증"
        },
        {
            "id": "cert_aws_1",
            "title": "AWS Certified Solutions Architect",
            "date": "2026-05-01T00:00:00Z",
            "host": "AWS",
            "url": "https://aws.amazon.com/ko/certification/",
            "type": "자격증"
        }
    ]

def main():
    jumpit_data = fetch_jumpit_jobs()
    saramin_data = fetch_saramin_jobs()
    wanted_data = fetch_wanted_jobs()
    
    all_jobs = jumpit_data + saramin_data + wanted_data
    
    it_events = fetch_festa_events()
    certs = fetch_static_certs()
    all_events = it_events + certs

    save_dir = "public"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    jobs_file_path = os.path.join(save_dir, "jobs_data.json")
    with open(jobs_file_path, "w", encoding="utf-8") as f:
        json.dump(all_jobs, f, ensure_ascii=False, indent=2)

    events_file_path = os.path.join(save_dir, "events_data.json")
    with open(events_file_path, "w", encoding="utf-8") as f:
        json.dump(all_events, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()