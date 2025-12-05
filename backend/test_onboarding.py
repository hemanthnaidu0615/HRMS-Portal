import requests
import json
import sys

BASE_URL = "http://localhost:8080/api"

def login():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "testadmin@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Login Status: {response.status_code}")
        if response.status_code == 200:
            return response.json().get("token")
        else:
            print(f"Login Failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login Exception: {e}")
        return None

def create_department(token):
    url = f"{BASE_URL}/orgadmin/structure/departments"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"name": "Engineering"}
    
    response = requests.post(url, json=payload, headers=headers)
    print(f"Create Dept Status: {response.status_code}")
    print(f"Create Dept Response: {response.text}")

def main():
    token = login()
    if token:
        create_department(token)
    else:
        print("Skipping department creation due to login failure.")

if __name__ == "__main__":
    main()
