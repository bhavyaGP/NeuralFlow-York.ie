import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AuthContext from '../../context/AuthContext';
import { getUserProfile } from '../../services/api';

const Dashboard = () => {
  const { jiraToken, logoutJira } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!jiraToken) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await getUserProfile(jiraToken);
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [jiraToken, navigate]);

  const handleLogout = () => {
    logoutJira();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 text-center">
              {profile?.avatarUrls?.['48x48'] && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={profile.avatarUrls['48x48']} 
                    alt="Profile" 
                    className="rounded-full h-24 w-24 border-4 border-blue-500"
                  />
                </div>
              )}
              <CardTitle className="text-2xl font-bold">
                {profile?.displayName || profile?.name || 'Jira User'}
              </CardTitle>
              <CardDescription>
                {profile?.emailAddress || profile?.email || 'No email available'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-2 gap-2 my-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Account ID</div>
                  <div className="font-medium truncate">{profile?.accountId || 'N/A'}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Locale</div>
                  <div className="font-medium">{profile?.locale || 'en-US'}</div>
                </div>
              </div>
              
              {profile?.timezone && (
                <div className="bg-green-50 p-3 rounded-lg my-2">
                  <div className="text-sm text-gray-500">Timezone</div>
                  <div className="font-medium">{profile.timezone}</div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleLogout} 
                variant="destructive" 
                className="w-full"
              >
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Jira Account Overview</CardTitle>
                  <CardDescription>
                    Summary of your Jira account and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatCard 
                        title="Account Type" 
                        value={profile?.accountType || 'Standard'} 
                        icon="👤"
                      />
                      <StatCard 
                        title="Active" 
                        value={profile?.active ? 'Yes' : 'No'} 
                        icon="✅"
                      />
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-medium text-blue-700 mb-2">Account Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-white">
                          Read Jira Work
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          Read Jira User
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          Read Profile
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent actions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ActivityItem 
                      title="Logged In" 
                      description="Successfully authenticated with Jira"
                      time="Just now"
                      icon="🔐"
                    />
                    <ActivityItem 
                      title="Profile Viewed" 
                      description="Accessed your Jira profile information"
                      time="Just now"
                      icon="👁️"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Activity</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Detailed history of your Jira activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="relative pl-8 border-l-2 border-gray-200 py-2">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                      <h3 className="font-medium">Authenticated with Jira</h3>
                      <p className="text-sm text-gray-500">Just now</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-gray-200 py-2">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-green-500"></div>
                      <h3 className="font-medium">Profile Information Retrieved</h3>
                      <p className="text-sm text-gray-500">Just now</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-gray-200 py-2">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                      <h3 className="font-medium">Tasks Loaded</h3>
                      <p className="text-sm text-gray-500">Just now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your Jira integration preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">Auto-refresh Tasks</h3>
                        <p className="text-sm text-gray-500">Automatically refresh tasks every 5 minutes</p>
                      </div>
                      <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                        <div className="w-6 h-6 bg-white rounded-full absolute left-0 shadow"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive email notifications for task updates</p>
                      </div>
                      <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                        <div className="w-6 h-6 bg-white rounded-full absolute right-0 shadow"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">Dark Mode</h3>
                        <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                      </div>
                      <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                        <div className="w-6 h-6 bg-white rounded-full absolute left-0 shadow"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon }) => (
  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
    <div className="text-2xl mr-3">{icon}</div>
    <div>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

const ActivityItem = ({ title, description, time, icon }) => (
  <div className="flex items-start">
    <div className="text-xl mr-3 mt-1">{icon}</div>
    <div className="flex-1">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

export default Dashboard;
