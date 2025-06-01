import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
