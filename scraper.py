import os
import json
import requests

def fetch_jumpit_jobs():
    url = "https://api.jumpit.co.kr/api/positions"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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
            job = {
                "id": item.get("id"),
                "company": item.get("companyName"),
                "title": item.get("title"),
                "skills": item.get("techStacks", [])
            }
            jobs.append(job)

        return jobs

    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return []
    except KeyError as e:
        print(f"Data Parsing Error: {e}")
        return []

def main():
    data = fetch_jumpit_jobs()

    save_dir = "public"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    file_path = os.path.join(save_dir, "jobs_data.json")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()