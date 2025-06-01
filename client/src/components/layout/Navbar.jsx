import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { jiraToken, user, logoutJira } = useContext(AuthContext);
  const isJiraConnected = !!jiraToken;
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-900">NeuralFlow</Link>
        <nav className="flex items-center gap-4">
          <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
          <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          
          {isJiraConnected ? (
            <div className="flex items-center gap-4">
              <div className="text-sm text-green-600 font-medium hidden md:block">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Connected to Jira
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrls?.['48x48']} alt="Profile" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user?.displayName?.charAt(0) || user?.name?.charAt(0) || 'J'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.displayName || user?.name || 'Jira User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.emailAddress || user?.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/">My Tasks</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logoutJira} className="text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
