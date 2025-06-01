# coding=utf-8
"""Flask app to demonstrate Jira OAuth 2.0"""

from flask import Flask, request, redirect, session, jsonify
from requests_oauthlib import OAuth2Session
from atlassian.jira import Jira
import requests
import os
import json
import subprocess
import time
import uuid
from threading import Thread
from flask_cors import CORS
from void_chat_routes import setup_void_chat_routes
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
app.secret_key = "random_secret_key"

# Enable CORS for all routes
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})

# === Jira OAuth Config ===
client_id = os.getenv('CLIENT_ID')  # Remove the fallback
client_secret = os.getenv('CLIENT_SECRET')
redirect_uri = "http://localhost:3000/callback"

authorization_base_url = "https://auth.atlassian.com/authorize"
token_url = "https://auth.atlassian.com/oauth/token"

# === Vercel Deployment Configuration ===
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
REPO_NAME = os.getenv("REPO_NAME")
LOCAL_DIR = os.getenv("LOCAL_DIR")
FOLDER_TO_COMMIT = os.getenv("FOLDER_TO_COMMIT")
GITHUB_API = 'https://api.github.com'
VERCEL_TOKEN = os.getenv("VERCEL_TOKEN")  # Remove the hardcoded fallback

# Global dictionary to track build and deployment statuses
build_statuses = {}

@app.route("/login")
def login():
    scope = ["read:me", "read:jira-user", "read:jira-work"]
    audience = "api.atlassian.com"

    jira_oauth = OAuth2Session(client_id, scope=scope, redirect_uri=redirect_uri)
    authorization_url, state = jira_oauth.authorization_url(
        authorization_base_url,
        audience=audience,
    )
    session["oauth_state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    try:
        jira_oauth = OAuth2Session(client_id, state=session.get("oauth_state"), redirect_uri=redirect_uri)
        token_json = jira_oauth.fetch_token(
            token_url,
            client_secret=client_secret,
            authorization_response=request.url,
        )
        
        access_token = token_json['access_token']
        
        # Store token in session
        session['jira_token'] = access_token
        
        # Get Cloud ID from accessible-resources endpoint
        resources_response = requests.get(
            "https://api.atlassian.com/oauth/token/accessible-resources",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )
        
        if resources_response.status_code != 200 or not resources_response.json():
            return "No accessible Jira resources found."
            
        resources = resources_response.json()
        cloud_id = resources[0]["id"]
        
        # Store cloud_id in session
        session['cloud_id'] = cloud_id
        
        # Get tasks using the cloud ID
        tasks_response = requests.get(
            f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/search",
            params={
                "jql": "assignee=currentUser() OR status!=Done"
            },
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }
        )
        
        if tasks_response.status_code != 200:
            return f"Error fetching tasks: {tasks_response.status_code}"
            
        tasks_data = tasks_response.json()
        
        # Redirect to client application with the token
        client_redirect_url = "http://localhost:5173?token=" + access_token + "&cloud_id=" + cloud_id
        return redirect(client_redirect_url)
        
    except Exception as e:
        return f"Error during OAuth callback: {str(e)}"

def get_cloud_id(access_token):
    response = requests.get(
        "https://api.atlassian.com/oauth/token/accessible-resources",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        },
    )
    response.raise_for_status()
    resources = response.json()
    if not resources:
        return None
    return resources[0]["id"]  # First accessible Jira cloud instance

def get_projects(token_json, cloud_id):
    oauth2_dict = {
        "client_id": client_id,
        "token": {
            "access_token": token_json["access_token"],
            "token_type": "Bearer",
        },
    }

    jira = Jira(url=f"https://api.atlassian.com/ex/jira/{cloud_id}", oauth2=oauth2_dict)
    projects = jira.projects()
    return [project["name"] for project in projects] if projects else ["No projects found"]

def get_tasks(access_token, cloud_id):
    url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/search"
    query = {
        "jql": "assignee=currentUser() OR status!=Done"
    }
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }

    response = requests.get(url, headers=headers, params=query)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"Error fetching tasks: {response.status_code}"}

# API Endpoints for client application

@app.route("/api/auth/jira/token", methods=["POST"])
def exchange_token():
    try:
        data = request.json
        code = data.get("code")
        
        if not code:
            return jsonify({"error": "Authorization code is required"}), 400
            
        jira_oauth = OAuth2Session(client_id, redirect_uri=redirect_uri)
        token_json = jira_oauth.fetch_token(
            token_url,
            client_secret=client_secret,
            code=code
        )
        
        return jsonify(token_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/jira/resources", methods=["GET"])
def get_jira_resources():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Bearer token is required"}), 401
            
        token = auth_header.split(" ")[1]
        response = requests.get(
            "https://api.atlassian.com/oauth/token/accessible-resources",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/jira/profile", methods=["GET"])
def get_jira_profile():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Bearer token is required"}), 401
            
        token = auth_header.split(" ")[1]
        response = requests.get(
            "https://api.atlassian.com/me",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/jira/<cloud_id>/tasks", methods=["GET"])
def get_jira_tasks(cloud_id):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Bearer token is required"}), 401
            
        token = auth_header.split(" ")[1]
        tasks_data = get_tasks(token, cloud_id)
        return jsonify(tasks_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === Vercel Deployment Functions ===

def create_github_repo():
    """Create GitHub repository"""
    url = f'{GITHUB_API}/user/repos'
    headers = {'Authorization': f'token {GITHUB_TOKEN}'}
    data = {'name': REPO_NAME, 'private': False}
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 201:
        print('[✔] GitHub repo created')
        return True
    elif response.status_code == 422:
        print('[!] Repo already exists, proceeding...')
        return True
    else:
        raise Exception(f'GitHub Error: {response.text}')

def prepare_folder():
    """Prepare folder for deployment"""
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

def commit_folder():
    """Commit and push folder to GitHub"""
    path = prepare_folder()
    original_dir = os.getcwd()
    
    try:
        os.chdir(path)
        subprocess.run(['git', 'init'], check=True)
        subprocess.run(['git', 'add', '.'], check=True)
        subprocess.run(['git', 'commit', '-m', 'Initial commit from automation'], check=True)
        subprocess.run(['git', 'branch', '-M', 'main'], check=True)
        remote_url = f'https://{GITHUB_USERNAME}:{GITHUB_TOKEN}@github.com/{GITHUB_USERNAME}/{REPO_NAME}.git'
        subprocess.run(['git', 'remote', 'add', 'origin', remote_url], check=True)
        subprocess.run(['git', 'push', '-f', '-u', 'origin', 'main'], check=True)
        print('[✔] Folder committed and pushed to GitHub')
        return True
    finally:
        os.chdir(original_dir)

def deploy_to_vercel():
    """Deploy to Vercel"""
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
        "framework": "create-react-app"
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code in [200, 201]:
        print('[✔] Vercel project created')
        project = response.json()
        return f"https://{project_name}.vercel.app"
    else:
        raise Exception(f'Vercel Error: {response.status_code}, {response.text}')

def run_deployment():
    """Run complete deployment process"""
    try:
        create_github_repo()
        time.sleep(2)
        commit_folder()
        time.sleep(5)
        vercel_url = deploy_to_vercel()
        return vercel_url
    except Exception as e:
        raise Exception(f"Deployment failed: {str(e)}")

def simulate_build_process(task_id, task_data):
    """Simulate the AI agent build process"""
    try:
        build_statuses[task_id] = {
            'status': 'processing',
            'progress': 0,
            'message': 'AI agent started code generation...',
            'started_at': time.time()
        }
        
        # Simulate build steps
        steps = [
            (20, 'Analyzing task requirements...'),
            (40, 'Generating code structure...'),
            (60, 'Implementing functionality...'),
            (80, 'Running tests and validation...'),
            (100, 'Build completed successfully!')
        ]
        
        for progress, message in steps:
            time.sleep(10)  # Simulate work time (10 seconds per step)
            build_statuses[task_id].update({
                'progress': progress,
                'message': message
            })
        
        # Mark as completed
        build_statuses[task_id].update({
            'status': 'completed',
            'completed_at': time.time()
        })
        
    except Exception as e:
        build_statuses[task_id] = {
            'status': 'failed',
            'error': str(e),
            'failed_at': time.time()
        }

# === API Endpoints ===

@app.route("/api/deploy", methods=["POST"])
def deploy():
    """Manual deployment trigger"""
    try:
        data = request.get_json()
        task_title = data.get('taskTitle', 'Manual Deployment')
        
        print(f"Manual deployment triggered for task: {task_title}")
        
        # Validate required environment variables
        if not all([GITHUB_TOKEN, GITHUB_USERNAME, REPO_NAME, VERCEL_TOKEN]):
            return jsonify({
                'success': False,
                'error': 'Missing required environment variables for deployment'
            }), 400

        # Check if folder exists
        folder_path = os.path.join(LOCAL_DIR, FOLDER_TO_COMMIT)
        if not os.path.exists(folder_path):
            return jsonify({
                'success': False,
                'error': f'Deployment folder not found at: {folder_path}'
            }), 404

        # Run deployment
        vercel_url = run_deployment()
        
        return jsonify({
            'success': True,
            'message': 'Deployment completed successfully',
            'deployed_url': vercel_url,
            'platform': 'Vercel',
            'task_title': task_title
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Deployment failed: {str(e)}'
        }), 500

@app.route("/api/deploy/status", methods=["GET"])
def deployment_status():
    """Check deployment configuration status"""
    try:
        folder_path = os.path.join(LOCAL_DIR, FOLDER_TO_COMMIT)
        
        status = {
            "github_token_configured": bool(GITHUB_TOKEN),
            "github_username_configured": bool(GITHUB_USERNAME),
            "repo_name_configured": bool(REPO_NAME),
            "vercel_token_configured": bool(VERCEL_TOKEN),
            "deployment_folder_exists": os.path.exists(folder_path),
            "git_available": False
        }
        
        # Check if Git is available
        try:
            subprocess.run(["git", "--version"], capture_output=True, check=True)
            status["git_available"] = True
        except:
            pass
        
        status["ready_for_deployment"] = all([
            status["github_token_configured"],
            status["github_username_configured"],
            status["repo_name_configured"],
            status["vercel_token_configured"],
            status["deployment_folder_exists"],
            status["git_available"]
        ])
        
        return jsonify(success=True, status=status)
        
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

def create_app():
    app = Flask(__name__)
    # Remove the blueprint registration since we're integrating directly
    return app

app = setup_void_chat_routes(app)

if __name__ == "__main__":
    app.run(port=3000, debug=True)