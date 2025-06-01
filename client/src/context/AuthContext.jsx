import { createContext, useState, useEffect } from 'react';
import { exchangeCodeForToken, getAccessibleResources, getUserProfile, getUserTasks } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jiraToken, setJiraToken] = useState(localStorage.getItem('jiraToken') || null);
  const [jiraCloudId, setJiraCloudId] = useState(localStorage.getItem('jiraCloudId') || null);
  const [jiraTasks, setJiraTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deploymentStatus, setDeploymentStatus] = useState(null);

  useEffect(() => {
    const checkJiraAuth = async () => {
      // Check for Jira authentication on page load
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const cloudId = urlParams.get('cloud_id');
      
      // Handle direct token and cloud ID from Flask server redirect
      if (token && cloudId) {
        try {
          // Save token and cloud ID to local storage
          localStorage.setItem('jiraToken', token);
          localStorage.setItem('jiraCloudId', cloudId);
          setJiraToken(token);
          setJiraCloudId(cloudId);
          
          // Load user data with the new token
          await loadJiraUserData();
          
          // Clean up URL after processing
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error processing token from redirect:', error);
          // If token is invalid, clear it
          if (error.message.includes('401')) {
            logoutJira();
          }
        }
      } else if (jiraToken) {
        // If we already have a token, load the user's Jira data
        try {
          await loadJiraUserData();
        } catch (error) {
          console.error('Error loading Jira user data:', error);
          // If token is invalid, clear it
          if (error.message.includes('401')) {
            logoutJira();
          }
        }
      }
      
      setIsLoading(false);
    };

    checkJiraAuth();
  }, []);

  // Load Jira user data
  const loadJiraUserData = async () => {
    try {
      if (!jiraToken || !jiraCloudId) {
        console.error('Missing Jira token or cloud ID');
        return;
      }
      
      // Get user profile
      const userProfile = await getUserProfile(jiraToken);
      console.log('User profile loaded:', userProfile);
      setUser(userProfile);
      
      // Get tasks
      await handleRefreshTasks();
      
      return userProfile;
    } catch (error) {
      console.error('Error loading Jira user data:', error);
      throw error;
    }
  };

  // Handle Jira callback after OAuth redirect
  const handleJiraCallback = async (code) => {
    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await exchangeCodeForToken(code);
      const accessToken = tokenResponse.access_token;
      
      // Save the token to local storage and state
      localStorage.setItem('jiraToken', accessToken);
      setJiraToken(accessToken);
      
      // Get accessible resources (Jira sites)
      const resources = await getAccessibleResources(accessToken);
      if (resources && resources.length > 0) {
        const cloudId = resources[0].id;
        
        // Save the cloud ID to local storage and state
        localStorage.setItem('jiraCloudId', cloudId);
        setJiraCloudId(cloudId);
        
        // Load user profile
        const userProfile = await getUserProfile(accessToken);
        setUser(userProfile);
        
        // Load tasks
        const tasksResponse = await getUserTasks(accessToken, cloudId);
        setJiraTasks(tasksResponse.issues || []);
      }
    } catch (error) {
      console.error('Error in handleJiraCallback:', error);
      throw error;
    }
  };

  // Logout from Jira
  const logoutJira = () => {
    localStorage.removeItem('jiraToken');
    localStorage.removeItem('jiraCloudId');
    setJiraToken(null);
    setJiraCloudId(null);
    setJiraTasks([]);
    setUser(null);
  };

  // Initiate Jira OAuth flow
  const initiateJiraAuth = () => {
    // Use the Flask server's login endpoint which will handle the OAuth flow
    window.location.href = 'http://localhost:3000/login';
  };

  // Refresh Jira tasks
  const handleRefreshTasks = async () => {
    try {
      if (!jiraToken || !jiraCloudId) {
        console.error('Missing Jira token or cloud ID');
        return;
      }
      
      const tasksResponse = await getUserTasks(jiraToken, jiraCloudId);
      if (tasksResponse && tasksResponse.issues) {
        setJiraTasks(tasksResponse.issues);
      } else {
        console.warn('No issues found in the tasks response:', tasksResponse);
        setJiraTasks([]);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      throw error;
    }
  };

  // Trigger deployment manually
  const triggerDeployment = async (taskTitle = 'Manual Deployment') => {
    try {
      setDeploymentStatus('deploying');
      
      const response = await fetch('http://localhost:3000/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskTitle }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeploymentStatus('success');
        return {
          success: true,
          deployedUrl: result.deployed_url,
          message: result.message,
          platform: result.platform || 'Vercel'
        };
      } else {
        setDeploymentStatus('error');
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus('error');
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Reset deployment status
  const resetDeploymentStatus = () => {
    setDeploymentStatus(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jiraToken,
        jiraCloudId,
        jiraTasks,
        isLoading,
        deploymentStatus,
        initiateJiraAuth,
        logoutJira,
        handleRefreshTasks,
        loadJiraUserData,
        triggerDeployment,
        resetDeploymentStatus,
        isJiraConnected: !!jiraToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;