from flask import request, jsonify
from app import VoidChatPaster

# Global instance
paster = VoidChatPaster()

def setup_void_chat_routes(app):
    """Add VoidChat API routes to existing Flask app"""
    
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
