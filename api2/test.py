import requests
import json

url = 'http://127.0.0.1:5000/'
headers = {'Content-Type': 'application/json'}
data = {'query': 'What is the capital of France?', 'category': 'Algebra', 'difficulty': 'Level 5'}

response = requests.post(url, headers=headers, data=json.dumps(data))

print(f"Status Code: {response.status_code}")
print(f"Response Content: {response.text}")