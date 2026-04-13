import urllib.request
import json

url = "http://127.0.0.1:8000/v1/research/run"
headers = {
    "X-Job-API-Key": "my-secret-job-key-2026",
    "Content-Type": "application/json"
}
data = {
    "topic": "technology trends Vietnam developer market NodeJS ReactJS Java 2026",
    "sources": "web,reddit,hn",
    "depth": "quick"
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode())
except Exception as e:
    print(f"Error: {e}")
