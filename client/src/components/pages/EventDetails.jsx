import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading - would be replaced with actual API call
    setTimeout(() => {
      setEvent({
        id,
        title: 'Sample Jira Task',
        description: 'This is a sample Jira task that would be fetched from the Jira API.',
        status: 'In Progress',
        assignee: 'John Doe',
        priority: 'Medium',
        dueDate: '2025-06-15',
        createdAt: '2025-05-20',
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/edit-event/${id}`}>Edit</Link>
            </Button>
            <Button variant="destructive">Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{event.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">{event.status}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Assignee</h3>
              <p className="mt-1">{event.assignee}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Priority</h3>
              <p className="mt-1">{event.priority}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <p className="mt-1">{event.dueDate}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1">{event.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link to="/">Back to Tasks</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EventDetails;
