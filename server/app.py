import json
import time
import pyautogui
import pyperclip
import platform
from datetime import datetime

class VoidChatPaster:
    def __init__(self):
        self.task_data = None
        
    def smart_chat_locate(self, task_data):
        """Smart method to locate chat using screen analysis"""
        try:
            print("🧠 SMART CHAT LOCATION")
            print("=" * 30)
            
            message = self.format_message(task_data)
            pyperclip.copy(message)
            
            print("📋 Task copied to clipboard")
            print("🔍 Analyzing screen for chat elements...")
            
            # Focus Void window
            if not self.find_and_focus_void():
                print("❌ Could not focus Void window")
                return False
            
            # Take screenshot and analyze
            screenshot = pyautogui.screenshot()
            
            # Look for text patterns that indicate chat area
            chat_indicators = [
                "CHAT",
                "chat",
                "Send",
                "Type a message",
                "Enter message",
                "@",
                "Enter instructions",
                "to mention",
                "to add a selection"
            ]
            
            print("🔍 Looking for chat indicators on screen...")
            
            # Try OCR if available
            try:
                import pytesseract
                from PIL import Image
                
                # Convert screenshot to text
                text = pytesseract.image_to_string(screenshot)
                print("📖 Screen text analysis completed")
                
                # Check if chat-related text is found
                chat_found = any(indicator in text for indicator in chat_indicators)
                
                if chat_found:
                    print("✅ Chat elements detected on screen")
                    # Use pattern matching to find likely input area
                    return self.pattern_based_click()
                else:
                    print("⚠️ No chat indicators found in screen text")
                    
            except ImportError:
                print("📝 OCR not available, using position-based method")
            
            # Fallback to position-based clicking
            return self.position_based_chat_click(message)
            
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
        message += """🔧 **

Optimized Frontend-Only React Project Generator Prompt (Minimal, Fast, Production-Ready for Vercel)

Objective:
Generate a concise, production-ready frontend-only React project using Vite. Code must be minimal, clean, functional, instantly deployable to Vercel, and directly testable in-browser.

Use Vite and React.
Focus only on client-side (frontend).
Include vercel.json for clean deployment.
Use JavaScript or TypeScript as needed.

Project Structure:
	•	Create a folder named NEW
	•	If unrelated to earlier projects, auto-increment like: NEW 2, NEW 3, etc.

Frontend (client):
	•	Scaffold using Vite + React
	•	Use this structure only if needed:
	•	components/ – Reusable UI components
	•	pages/ – Route-level components
	•	services/ – API call logic
	•	utils/ – Utility functions
	•	App.jsx – Root component
	•	main.jsx – Entry point
	•	index.html

Include:
	•	React Router with minimal clean routing
	•	Responsive and accessible layout
	•	Basic form validation and error handling
	•	.env file for API base URL
Warn and auto-fix if any keys are hardcoded
	•	vercel.json for routing and deployment configuration
	•	Minimal test using Vitest, auto-run without prompt

Code Quality:
	•	Auto-add ESLint and Prettier
	•	Format all code automatically
	•	Keep code clean and readable
	•	Do not generate unused or placeholder files

Testing:
    •	Just create the test file, no need to run it


Deployment-Ready:
	•	Include vercel.json with required rewrites
	•	Ensure Vite config works for deployment
	•	Provide working build script and preview command
	•	Use .env for any required VITE_ environment variables
	•	Do not include any server-side or backend code

Documentation:
	•	Generate README.md inside NEW/
	•	Include setup instructions
	•	Development and build commands
	•	Tech stack used
	•	Simple Vercel deployment steps
	•	Keep documentation minimal and clear

Execution Notes:
    •	npm install @vitejs/plugin-react --save-dev run this command once 
	•	Avoid extra or redundant files
	•	Only generate files necessary for a working, clean frontend
	•	Final code should work immediately out of the box
use this as vercel.json everytime, dont create new one. 

"""

        
        message += f"⏰ **Timestamp:** {timestamp}\n\n"
        message += "Please provide the complete implementation with all necessary files and code."
        
        return message

def load_task_from_json(json_file_path=None):
   
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