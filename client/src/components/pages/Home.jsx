import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AuthContext from '../../context/AuthContext';
import { sendTaskToVoid, previewVoidMessage, openVoidWithTask } from '../../services/api';

const Home = () => {
  const { 
    initiateJiraAuth, 
    jiraToken, 
    jiraCloudId, 
    user, 
    jiraTasks, 
    handleRefreshTasks, 
    deploymentStatus, 
    triggerDeployment, 
    resetDeploymentStatus 
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const isJiraConnected = !!jiraToken && !!jiraCloudId;
  
  // Function to handle OAuth2 authentication with Jira
  const handleJiraSignIn = () => {
    initiateJiraAuth();
  };
  
  // Load tasks when component mounts or when jiraToken changes
  useEffect(() => {
    if (isJiraConnected) {
      refreshTasks();
    }
  }, [isJiraConnected, jiraToken]);
  
  // Function to refresh tasks
  const refreshTasks = async () => {
    setLoading(true);
    try {
      await handleRefreshTasks();
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show deployment notification
  useEffect(() => {
    if (deploymentStatus === 'success') {
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        resetDeploymentStatus();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deploymentStatus, resetDeploymentStatus]);

  return (
    <div className="flex flex-col items-center">
      {/* Deployment Status Notification */}
      {deploymentStatus && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-lg ${
            deploymentStatus === 'deploying' ? 'bg-purple-50 border border-purple-200' :
            deploymentStatus === 'success' ? 'bg-green-50 border border-green-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {deploymentStatus === 'deploying' && (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                  <span className="text-purple-700 font-medium">Deploying to Vercel...</span>
                </>
              )}
              {deploymentStatus === 'success' && (
                <>
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-green-700 font-medium">Deployed successfully! 🚀</span>
                </>
              )}
              {deploymentStatus === 'error' && (
                <>
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <span className="text-red-700 font-medium">Deployment failed</span>
                </>
              )}
              <button 
                onClick={resetDeploymentStatus}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Streamline Your Workflow
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Connect with Jira to manage your tasks efficiently
        </p>
        
        {/* Sign in with Jira Button or Dashboard Link */}
        {isJiraConnected ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
              Connected to Jira
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={refreshTasks}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-auto transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Tasks'}
              </Button>
              <Button 
                asChild
                variant="outline"
                className="px-6 py-2 h-auto transition-all duration-200"
              >
                <a href="/dashboard">View Profile</a>
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleJiraSignIn}
            className="text-white bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg h-auto transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Sign in with Jira
            <JiraIcon className="ml-2 h-6 w-6" />
          </Button>
        )}
        
        {/* Show user info if connected to Jira */}
        {isJiraConnected && user && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">Connected as {user.name || user.email}</p>
          </div>
        )}
      </section>

      {/* Jira Tasks Section */}
      {isJiraConnected && (
        <section className="py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Your Jira Tasks</h2>
              <Button 
                onClick={refreshTasks} 
                variant="outline"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Tasks'}
              </Button>
            </div>
            
            {jiraTasks && jiraTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jiraTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">No active tasks found</p>
                <Button 
                  onClick={refreshTasks} 
                  variant="outline" 
                  className="mt-4"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Tasks'}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Features Section */}
      <section className="py-16 bg-white w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose NeuralFlow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Automated Workflows" 
              description="Set up automated workflows that trigger actions based on Jira updates."
              icon="⚙️"
            />
            <FeatureCard 
              title="Task Management" 
              description="Efficiently manage and prioritize your Jira tasks in one place."
              icon="📋"
            />
            <FeatureCard 
              title="Team Collaboration" 
              description="Improve team collaboration with shared workflows and task visibility."
              icon="👥"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to boost your productivity?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using NeuralFlow to streamline their workflows.
          </p>
          <Button 
            onClick={handleJiraSignIn}
            className="text-white bg-blue-600 hover:bg-blue-700"
            disabled={isJiraConnected}
          >
            <JiraIcon className="mr-2 h-4 w-4" />
            {isJiraConnected ? 'Connected to Jira' : 'Get Started with Jira'}
          </Button>
        </div>
      </section>
    </div>
  );
};

// Jira Icon Component
const JiraIcon = ({ className }) => {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11.5 16.5L15 13L11.5 9.5" />
      <path d="M8.5 9.5L5 13L8.5 16.5" />
    </svg>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task }) => {
  const { triggerDeployment } = useContext(AuthContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  
  // Handle case where task might be null or undefined
  if (!task || !task.fields) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Invalid Task Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This task data cannot be displayed</p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-500';
    
    const priorityName = priority.name?.toLowerCase() || '';
    
    switch (priorityName) {
      case 'highest':
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
      case 'lowest':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusName = status.name?.toLowerCase() || '';
    
    if (statusName.includes('to do') || statusName.includes('backlog')) {
      return 'bg-gray-100 text-gray-800';
    } else if (statusName.includes('progress') || statusName.includes('review')) {
      return 'bg-blue-100 text-blue-800';
    } else if (statusName.includes('done') || statusName.includes('complete')) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-purple-100 text-purple-800';
    }
  };

  // Extract description - handle different formats from Jira API
  const getDescription = () => {
    const description = task.fields.description;
    if (!description) return 'No description provided';
    
    // Handle Jira's Atlassian Document Format (ADF)
    if (typeof description === 'object' && description.content) {
      try {
        // Try to extract text from ADF format
        return description.content
          .filter(item => item.type === 'paragraph')
          .map(para => para.content?.map(text => text.text).join('') || '')
          .join('\n') || 'No description provided';
      } catch (e) {
        return 'Description format not supported';
      }
    }
    
    return description;
  };

  // Function to get preview of the task message
  const getTaskPreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Format task data for Void Chat
      const taskData = {
        title: task.fields.summary || 'Untitled Task',
        description: getDescription()
      };
      
      // Get preview from API
      const result = await previewVoidMessage(taskData);
      setPreview(result.preview);
    } catch (err) {
      setError(err.message || 'Failed to get preview');
      console.error('Preview error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to send task to Void
  const sendToVoid = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Format task data for Void Chat
      const taskData = {
        title: task.fields.summary || 'Untitled Task',
        description: getDescription()
      };
      
      // Send task to Void
      const result = await sendTaskToVoid(taskData);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to send task to Void');
      console.error('Send to Void error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to deploy manually
  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setDeploymentResult(null);
    
    try {
      const taskTitle = task.fields.summary || 'Untitled Task';
      const result = await triggerDeployment(taskTitle);
      
      if (result.success) {
        setDeploymentResult({
          success: true,
          url: result.deployedUrl,
          message: result.message
        });
      } else {
        setError(result.error || 'Deployment failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to deploy');
      console.error('Deploy error:', err);
    } finally {
      setIsDeploying(false);
    }
  };
  
  return (
    <>
      <Card 
        className="group shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] bg-gradient-to-br from-white via-gray-50 to-blue-50/30 border-l-4 border-l-blue-500" 
        onClick={() => {
          setIsDialogOpen(true);
          getTaskPreview();
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold line-clamp-2 text-gray-800 group-hover:text-blue-700 transition-colors">
                {task.fields.summary || 'Untitled Task'}
              </CardTitle>
              <CardDescription className="text-sm mt-1 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {task.key || 'No ID'}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{task.fields.issuetype?.name || 'Task'}</span>
              </CardDescription>
            </div>
            {task.fields.priority && (
              <div className="flex flex-col items-center">
                <div 
                  className={`w-4 h-4 rounded-full ${getPriorityColor(task.fields.priority)} shadow-lg ring-2 ring-white`} 
                  title={`Priority: ${task.fields.priority.name || 'Unknown'}`}
                />
                <span className="text-xs text-gray-500 mt-1 font-medium">
                  {task.fields.priority.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {getDescription()}
          </p>
          {task.fields.components && task.fields.components.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {task.fields.components.slice(0, 2).map(component => (
                <span key={component.id} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                  {component.name}
                </span>
              ))}
              {task.fields.components.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-md">
                  +{task.fields.components.length - 2} more
                </span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Badge className={`${getStatusColor(task.fields.status)} font-medium`}>
            {task.fields.status?.name || 'No Status'}
          </Badge>
          <div className="flex items-center gap-2">
            {/* Deploy Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dialog from opening
                handleDeploy();
              }}
              disabled={isDeploying}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none"
            >
              {isDeploying ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                  <span className="text-xs">Deploying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span className="text-xs">Deploy</span>
                </div>
              )}
            </Button>
            
            {task.fields.assignee?.avatarUrls?.['24x24'] && (
              <img 
                src={task.fields.assignee.avatarUrls['24x24']} 
                alt={task.fields.assignee.displayName}
                className="w-6 h-6 rounded-full border border-gray-200"
              />
            )}
            <span className="text-xs text-gray-500">
              {task.fields.assignee ? task.fields.assignee.displayName || task.fields.assignee.name || 'User' : 'Unassigned'}
            </span>
          </div>
        </CardFooter>
      </Card>
      
      {/* Enhanced Task Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-blue-50/20">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {task.fields.summary || 'Untitled Task'}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3 text-base">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                    {task.key || 'No ID'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{task.fields.issuetype?.name || 'Task'}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{task.fields.priority?.name || 'No Priority'}</span>
                </DialogDescription>
              </div>
              {task.fields.priority && (
                <div className={`w-6 h-6 rounded-full ${getPriorityColor(task.fields.priority)} shadow-lg ring-2 ring-white`} />
              )}
            </div>
          </DialogHeader>
          
          <div className="mt-6 space-y-6">
            {/* Description Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Description
              </h3>
              <div className="bg-gray-50 p-4 rounded-md text-gray-700 leading-relaxed whitespace-pre-wrap">
                {getDescription()}
              </div>
            </div>
            
            {/* Task Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                <Badge className={`${getStatusColor(task.fields.status)} text-sm px-3 py-1`}>
                  {task.fields.status?.name || 'No Status'}
                </Badge>
              </div>
              
              {/* Assignee */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Assignee</h4>
                <div className="flex items-center gap-2">
                  {task.fields.assignee?.avatarUrls?.['24x24'] && (
                    <img 
                      src={task.fields.assignee.avatarUrls['24x24']} 
                      alt={task.fields.assignee.displayName}
                      className="w-6 h-6 rounded-full border border-gray-200"
                    />
                  )}
                  <span className="text-gray-700">
                    {task.fields.assignee ? task.fields.assignee.displayName || task.fields.assignee.name || 'User' : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Components and Labels */}
            {(task.fields.components?.length > 0 || task.fields.labels?.length > 0) && (
              <div className="space-y-4">
                {task.fields.components && task.fields.components.length > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Components</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.fields.components.map(component => (
                        <Badge key={component.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {component.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {task.fields.labels && task.fields.labels.length > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.fields.labels.map(label => (
                        <Badge key={label} variant="secondary" className="bg-gray-100 text-gray-700">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Void Preview Section */}
            {(preview || isLoading) && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  Void Chat Preview
                </h3>
                {isLoading ? (
                  <div className="flex items-center gap-3 p-4">
                    <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                    <span className="text-gray-600">Generating preview...</span>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-md text-sm font-mono text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto border border-gray-200">
                    {preview}
                  </div>
                )}
              </div>
            )}
            
            {/* Success Message with Deployment Info */}
            {success && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Task successfully sent to AI Agent! 🚀</span>
                    <div className="text-sm text-green-600 mt-1">
                      AI agent is building your application. Deployment to Vercel will start automatically when complete.
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-8 border-t border-gray-200 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="min-w-[100px]">
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying}
                variant="outline"
                className="min-w-[120px] bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none"
              >
                {isDeploying ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deploying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    Deploy to Vercel
                  </div>
                )}
              </Button>
              <Button 
                onClick={sendToVoid} 
                disabled={isLoading || success}
                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : success ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Sent!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Do Task in Void
                  </div>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Home;
