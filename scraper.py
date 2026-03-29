import os
import json
import requests
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
        "career_cd": "1,2", 
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
                    skills = [s.strip() for s in sector_elem.text.strip().split(',') if s.strip()]
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

def main():
    jumpit_data = fetch_jumpit_jobs()
    saramin_data = fetch_saramin_jobs()
    
    all_jobs = jumpit_data + saramin_data

    save_dir = "public"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    file_path = os.path.join(save_dir, "jobs_data.json")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(all_jobs, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()