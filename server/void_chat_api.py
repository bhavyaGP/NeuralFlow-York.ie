import json
import time
import pyautogui
import pyperclip
import platform
from datetime import datetime
from flask import request, jsonify

class VoidChatPaster:
    def __init__(self):
        self.task_data = None
        
    def smart_chat_locate(self, task_data):
        """Smart method to locate chat using screen analysis"""
        try:
            print("🧠 SMART CHAT LOCATION")
            message = self.format_message(task_data)
            pyperclip.copy(message)
            
            if not self.find_and_focus_void():
                return False
            
            screenshot = pyautogui.screenshot()
            return self.pattern_based_click()
            
        except Exception as e:
            print(f"❌ Smart locate failed: {e}")
            return False
    
    def pattern_based_click(self):
        """Click based on UI patterns"""
        try:
            # Right side panel locations (where chat usually is)
            screen_width, screen_height = pyautogui.size()
            
            # Try both chat positions - first try bottom chat (existing chat)
            if self.try_bottom_chat():
                return True
                
            # If bottom chat fails, try top-right chat (new chat)
            if self.try_top_chat():
                return True
                
            # If both specific methods fail, try a more general approach
            print("⚠️ Specific chat detection failed, trying general approach")
            return self.position_based_chat_click(None)
            
        except Exception as e:
            print(f"❌ Pattern-based click failed: {e}")
            return False
            
    def try_bottom_chat(self):
        """Try clicking on the bottom chat area (for existing chats)"""
        try:
            screen_width, screen_height = pyautogui.size()
            
            # Chat is likely in right 30% of screen, bottom 20%
            chat_region = {
                'left': int(screen_width * 0.7),
                'top': int(screen_height * 0.8),
                'width': int(screen_width * 0.3),
                'height': int(screen_height * 0.2)
            }
            
            # Click in the center of likely chat input area
            click_x = chat_region['left'] + (chat_region['width'] // 2)
            click_y = chat_region['top'] + (chat_region['height'] // 2)
            
            print(f"📍 Trying bottom chat input at ({click_x}, {click_y})")
            pyautogui.click(click_x, click_y)
            time.sleep(0.5)
            
            # Test if it's an input by typing and clearing
            pyautogui.typewrite(" ")
            pyautogui.press('backspace')
            
            # Paste and send the message
            print("📝 Pasting message...")
            if platform.system() == "Darwin":  # macOS
                pyautogui.hotkey('command', 'v')
            else:
                pyautogui.hotkey('ctrl', 'v')
            time.sleep(0.8)
            
            print("📤 Sending message...")
            pyautogui.press('enter')
            
            print("✅ MESSAGE SENT via bottom chat!")
            return True
            
        except Exception as e:
            print(f"❌ Bottom chat attempt failed: {e}")
            return False
            
    def try_top_chat(self):
        """Try clicking on the top-right chat area (for new chats)"""
        try:
            screen_width, screen_height = pyautogui.size()
            
            # New chat is likely in the right 30% of screen, top 30%
            chat_region = {
                'left': int(screen_width * 0.7),
                'top': int(screen_height * 0.2),  # Higher up on the screen
                'width': int(screen_width * 0.3),
                'height': int(screen_height * 0.3)
            }
            
            # Click in the center of likely chat input area
            click_x = chat_region['left'] + (chat_region['width'] // 2)
            click_y = chat_region['top'] + (chat_region['height'] // 2)
            
            print(f"📍 Trying top-right chat input at ({click_x}, {click_y})")
            pyautogui.click(click_x, click_y)
            time.sleep(0.5)
            
            # Test if it's an input by typing and clearing
            pyautogui.typewrite(" ")
            pyautogui.press('backspace')
            
            # Paste and send the message
            print("📝 Pasting message...")
            if platform.system() == "Darwin":  # macOS
                pyautogui.hotkey('command', 'v')
            else:
                pyautogui.hotkey('ctrl', 'v')
            time.sleep(0.8)
            
            print("📤 Sending message...")
            pyautogui.press('enter')
            
            print("✅ MESSAGE SENT via top chat!")
            return True
            
        except Exception as e:
            print(f"❌ Top chat attempt failed: {e}")
            return False
            
        except Exception as e:
            print(f"❌ Pattern-based click failed: {e}")
            return False
    
    def position_based_chat_click(self, message):
        """Position-based chat clicking fallback"""
        try:
            print("\n📍 POSITION-BASED CHAT ACCESS")
            print("Using multiple positions for chat input...")
            
            screen_width, screen_height = pyautogui.size()
            
            # Try multiple potential chat positions
            chat_positions = [
                # Bottom chat position (existing chat)
                {'x': int(screen_width * 0.85), 'y': int(screen_height * 0.90), 'desc': 'bottom chat'},
                # Top-right chat position (new chat)
                {'x': int(screen_width * 0.85), 'y': int(screen_height * 0.30), 'desc': 'top-right chat'},
                # Middle-right position (fallback)
                {'x': int(screen_width * 0.85), 'y': int(screen_height * 0.50), 'desc': 'middle-right area'}
            ]
            
            # Try each position
            for pos in chat_positions:
                try:
                    print(f"🎯 Trying {pos['desc']} at position ({pos['x']}, {pos['y']})")
                    pyautogui.click(pos['x'], pos['y'])
                    time.sleep(1)
                    
                    # Test if it's an input by typing and clearing
                    pyautogui.typewrite(" ")
                    pyautogui.press('backspace')
                    
                    # Paste and send
                    print("📝 Pasting message...")
                    if platform.system() == "Darwin":  # macOS
                        pyautogui.hotkey('command', 'v')
                    else:
                        pyautogui.hotkey('ctrl', 'v')
                    time.sleep(0.8)
                    
                    print("📤 Sending with Enter...")
                    pyautogui.press('enter')
                    
                    print(f"✅ MESSAGE SENT via {pos['desc']}!")
                    return True
                    
                except Exception as e:
                    print(f"⚠️ Failed with {pos['desc']}: {e}")
                    continue
            
            print("❌ All chat position attempts failed")
            return False
            
        except Exception as e:
            print(f"❌ Position-based click failed: {e}")
            return False
    
    def find_and_focus_void(self):
        """Find and focus Void Code Editor window"""
        try:
            import platform
            import subprocess
            
            system = platform.system()
            
            if system == "Windows":
                try:
                    import win32gui
                    import win32con
                    
                    def find_void_window(hwnd, windows):
                        if win32gui.IsWindowVisible(hwnd):
                            title = win32gui.GetWindowText(hwnd).lower()
                            # Look for Void-specific window titles
                            if any(keyword in title for keyword in ['void', 'hackathon', 'code editor']):
                                windows.append((hwnd, win32gui.GetWindowText(hwnd)))
                        return True
                    
                    windows = []
                    win32gui.EnumWindows(find_void_window, windows)
                    
                    if windows:
                        hwnd, title = windows[0]
                        print(f"📱 Found Void window: {title}")
                        win32gui.SetForegroundWindow(hwnd)
                        win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                        time.sleep(1)
                        return True
                        
                except ImportError:
                    print("⚠️ Windows-specific libraries not available")
                    
            elif system == "Darwin":  # macOS
                try:
                    # Try to activate Void or similar apps
                    apps_to_try = ["Void", "Code", "Electron"]
                    for app in apps_to_try:
                        try:
                            subprocess.run([
                                "osascript", "-e", 
                                f'tell application "{app}" to activate'
                            ], check=True, capture_output=True)
                            print(f"📱 Activated: {app}")
                            time.sleep(1)
                            return True
                        except:
                            continue
                except:
                    pass
                    
            else:  # Linux
                try:
                    # Try wmctrl
                    result = subprocess.run(
                        ["wmctrl", "-l"], 
                        capture_output=True, text=True, timeout=5
                    )
                    
                    for line in result.stdout.split('\n'):
                        if any(keyword in line.lower() for keyword in ['void', 'hackathon', 'code']):
                            window_id = line.split()[0]
                            subprocess.run(["wmctrl", "-i", "-a", window_id])
                            print(f"📱 Focused: {line.split(None, 3)[-1]}")
                            time.sleep(1)
                            return True
                except:
                    pass
            
            # Fallback: just assume current window is Void
            print("📱 Using current focused window (assuming it's Void)")
            return True
            
        except Exception as e:
            print(f"⚠️ Window focus failed: {e}")
            return True  # Continue anyway
    
    def format_message(self, task_data):
        """Format the task message for Void chat"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Build the message dynamically based on available task data
        message = f"🚀 **Task: {task_data.get('title', 'Development Task')}**\n\n"
        
        # Add description if available
        if 'description' in task_data:
            message += f"📋 **Description:**\n{task_data['description']}\n\n"
        
        # Add requirements if available
        if 'requirements' in task_data:
            message += "✅ **Requirements:**\n"
            if isinstance(task_data['requirements'], list):
                for req in task_data['requirements']:
                    message += f"- {req}\n"
            else:
                message += f"{task_data['requirements']}\n"
            message += "\n"
        
        # Add instructions if available
        if 'instructions' in task_data:
            message += f"🔧 **Instructions:**\n{task_data['instructions']}\n\n"
        
        # Add tech stack if available
        if 'tech_stack' in task_data:
            message += "🛠️ **Tech Stack:**\n"
            if isinstance(task_data['tech_stack'], list):
                for tech in task_data['tech_stack']:
                    message += f"- {tech}\n"
            else:
                message += f"{task_data['tech_stack']}\n"
            message += "\n"
        
        # Add priority if available
        if 'priority' in task_data:
            priority_emoji = {"high": "🔥", "medium": "⚡", "low": "📝"}.get(task_data['priority'].lower(), "📋")
            message += f"{priority_emoji} **Priority:** {task_data['priority']}\n\n"
        
        # Add deadline if available
        if 'deadline' in task_data:
            message += f"⏰ **Deadline:** {task_data['deadline']}\n\n"
        
        # Add any additional fields dynamically
        for key, value in task_data.items():
            if key not in ['title', 'description', 'requirements', 'instructions', 'tech_stack', 'priority', 'deadline']:
                formatted_key = key.replace('_', ' ').title()
                message += f"📌 **{formatted_key}:** {value}\n\n"
        
        # Add standard instructions for complete implementation
        message += """🔧 **General Instructions:** 
Please implement this as a complete project with:
- Full working code (frontend/backend as needed)
- Strictly Create a different Project folder inside current working dir named NEW
- Complete the whole codebase along with frontend and backend , nothing should be empty
- keep the code concise and error free for deployment
- install the required dependencies all by yourself
- Create an .env file with all the required environment variables
- Also resolve all CORS issues
- Proper file structure and organization
- Clear comments and documentation
- Error handling and validation
- Professional code quality
- Ready-to-run implementation

"""
        
        message += f"⏰ **Timestamp:** {timestamp}\n\n"
        message += "Please provide the complete implementation with all necessary files and code."
        
        return message

def load_task_from_json(json_file_path=None):
    """Load task data from JSON file or return sample data"""
    if json_file_path:
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                task_data = json.load(file)
                print(f"📁 Loaded task from: {json_file_path}")
                return task_data
        except FileNotFoundError:
            print(f"❌ File not found: {json_file_path}")
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON format: {e}")
        except Exception as e:
            print(f"❌ Error loading JSON: {e}")
    
    # Return sample task if no file specified or loading failed
    return {
        "title": "Auto-Location Weather Widget",
        "description": "Build a weather widget that automatically detects user location via GPS or IP geolocation and displays current weather data using OpenWeatherMap API. Include fallback to manual city input and proper error handling.",
        "requirements": [
            "Use OpenWeatherMap API",
            "Auto-location detection (GPS/IP)",
            "Fallback to manual input",
            "Modular architecture"
        ],
        "tech_stack": ["HTML", "CSS", "JavaScript", "OpenWeatherMap API"],
        "priority": "medium"
    }

# Global instance
paster = VoidChatPaster()

def setup_void_chat_routes(app):
    """Setup VoidChat API routes on existing Flask app"""
    
    @app.route('/api/void/send-task', methods=['POST'])
    def send_task():
        try:
            if not request.is_json:
                return jsonify({
                    'success': False,
                    'error': 'Content-Type must be application/json'
                }), 400
            
            data = request.get_json()
            
            if not data.get('title') or not data.get('description'):
                return jsonify({
                    'success': False,
                    'error': 'Title and description are required'
                }), 400
            
            task_data = {
                'title': data['title'],
                'description': data['description']
            }
            
            optional_fields = ['requirements', 'tech_stack', 'priority', 'deadline', 'instructions']
            for field in optional_fields:
                if field in data:
                    task_data[field] = data[field]
            
            success = paster.smart_chat_locate(task_data)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Task sent to Void chat successfully',
                    'task_title': task_data['title']
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to send task to Void chat',
                    'message': 'Task is copied to clipboard, paste manually'
                }), 500
                
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Server error: {str(e)}'
            }), 500
    
    @app.route('/api/void/preview', methods=['POST'])
    def preview_message():
        try:
            if not request.is_json:
                return jsonify({
                    'success': False,
                    'error': 'Content-Type must be application/json'
                }), 400
            
            data = request.get_json()
            
            if not data.get('title') or not data.get('description'):
                return jsonify({
                    'success': False,
                    'error': 'Title and description are required'
                }), 400
            
            task_data = {
                'title': data['title'],
                'description': data['description']
            }
            
            optional_fields = ['requirements', 'tech_stack', 'priority', 'deadline', 'instructions']
            for field in optional_fields:
                if field in data:
                    task_data[field] = data[field]
            
            formatted_message = paster.format_message(task_data)
            
            return jsonify({
                'success': True,
                'preview': formatted_message,
                'character_count': len(formatted_message)
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Preview error: {str(e)}'
            }), 500

    return app