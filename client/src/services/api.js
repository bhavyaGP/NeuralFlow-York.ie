// Jira API Service

// Base URL for the Flask server
const API_BASE_URL = 'http://localhost:3000';

/**
 * Exchanges the authorization code for an access token
 * @param {string} code - The authorization code received from Jira OAuth
 * @returns {Promise<Object>} - The response containing the access token
 */
export const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/jira/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to exchange code for token');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Gets the accessible Jira resources for the authenticated user
 * @param {string} accessToken - The Jira access token
 * @returns {Promise<Array>} - Array of accessible Jira resources
 */
export const getAccessibleResources = async (accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jira/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get accessible resources');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting accessible resources:', error);
    throw error;
  }
};

/**
 * Gets the user's Jira tasks
 * @param {string} accessToken - The Jira access token
 * @param {string} cloudId - The Jira cloud ID
 * @returns {Promise<Object>} - The response containing the user's tasks
 */
export const getUserTasks = async (accessToken, cloudId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jira/${cloudId}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user tasks');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user tasks:', error);
    throw error;
  }
};

/**
 * Gets the current user's profile from Jira
 * @param {string} accessToken - The Jira access token
 * @returns {Promise<Object>} - The response containing the user's profile
 */
export const getUserProfile = async (accessToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jira/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// VoidChat API functions
export const sendTaskToVoid = async (taskData) => {
  try {
    const response = await fetch('http://localhost:3000/api/void/send-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send task to Void');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending task to Void:', error);
    throw error;
  }
};

export const previewVoidMessage = async (taskData) => {
  try {
    const response = await fetch('http://localhost:3000/api/void/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to preview message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error previewing message:', error);
    throw error;
  }
};

/**
 * Opens Void IDE and sends a task
 * @param {Object} taskData - The task data to send
 * @returns {Promise<Object>} - The response from the Void Chat API
 */
export const openVoidWithTask = async (taskData) => {
  try {
    // First, try to open Void IDE
    // This is a client-side function that will attempt to open the Void IDE app
    // using a custom URL scheme
    window.open('void://');
    
    // Then send the task to the API
    // We add a small delay to allow the app to open
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return await sendTaskToVoid(taskData);
  } catch (error) {
    console.error('Error opening Void with task:', error);
    throw error;
  }
};

// Deployment API functions
export const deployProject = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Deploy project error:', error);
    throw error;
  }
};

export const getDeploymentStatus = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/deploy/status');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get deployment status error:', error);
    throw error;
  }
};
