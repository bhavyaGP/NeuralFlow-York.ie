import os
import subprocess
import requests
import json
import time

# Tokens and Config
GITHUB_TOKEN = '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'
GITHUB_USERNAME = 'bhavyagp'
REPO_NAME = 'york'
LOCAL_DIR = r'C:\Users\91878\Desktop\check'  # Local root folder
FOLDER_TO_COMMIT = 'NEW'
GITHUB_API = 'https://api.github.com'
VERCEL_TOKEN = '3j5WQ1sDWO1tM5qGBdGUYuqf'  # Replace with your actual Vercel token

# Step 1: Create GitHub repo
def create_github_repo():
    url = f'{GITHUB_API}/user/repos'
    headers = {'Authorization': f'token {GITHUB_TOKEN}'}
    data = {'name': REPO_NAME, 'private': False}
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 201:
        print('[✔] GitHub repo created')
    elif response.status_code == 422:
        print('[!] Repo already exists, proceeding...')
    else:
        raise Exception(f'GitHub Error: {response.text}')

# Step 2: Prepare folder
def prepare_folder():
    path = os.path.join(LOCAL_DIR, FOLDER_TO_COMMIT)
    if not os.path.exists(path):
        os.makedirs(path)

    # Create a basic index.html if it doesn't exist
    index_path = os.path.join(path, 'index.html')
    if not os.path.exists(index_path):
        with open(index_path, 'w') as f:
            f.write('<html><body><h1>Hello from Vercel!</h1></body></html>')
        print('[✔] Created index.html')

    return path

# Step 3: Commit and push folder to GitHub
def commit_folder():
    path = prepare_folder()
    os.chdir(path)
    subprocess.run(['git', 'init'])
    subprocess.run(['git', 'add', '.'])
    subprocess.run(['git', 'commit', '-m', 'Initial commit from automation'])
    subprocess.run(['git', 'branch', '-M', 'main'])
    remote_url = f'https://{GITHUB_USERNAME}:{GITHUB_TOKEN}@github.com/{GITHUB_USERNAME}/{REPO_NAME}.git'
    subprocess.run(['git', 'remote', 'add', 'origin', remote_url])
    subprocess.run(['git', 'push', '-f', '-u', 'origin', 'main'])
    print('[✔] Folder committed and pushed to GitHub')

# Step 4: Trigger deploy on Vercel
def deploy_to_vercel():
    url = 'https://api.vercel.com/v9/projects'
    headers = {
        'Authorization': f'Bearer {VERCEL_TOKEN}',
        'Content-Type': 'application/json'
    }

    project_name = f"{REPO_NAME.replace('_', '-')}-{int(time.time())}"

    payload = {
        "name": project_name,
        "gitRepository": {
            "type": "github",
            "repo": f"{GITHUB_USERNAME}/{REPO_NAME}"
        },
        "framework": "create-react-app"  # Set to "create-react-app" for React applications
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code in [200, 201]:
        print('[✔] Vercel project created')
        project = response.json()
        return f"https://{project_name}.vercel.app"
    else:
        raise Exception(f'Vercel Error: {response.status_code}, {response.text}')



# Step 5: Run all steps
def run():
    create_github_repo()
    time.sleep(2)
    commit_folder()
    time.sleep(5)
    url = deploy_to_vercel()
    return url

if __name__ == "__main__":
    try:
        vercel_url = run()
        print(f"\n✅ Your app is live at: {vercel_url}")
    except Exception as e:
        print(f"\n❌ Deployment failed: {str(e)}")