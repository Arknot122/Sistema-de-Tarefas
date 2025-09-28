import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import CreateTaskModal from '../tasks/CreateTaskModal';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Plus,
  CheckSquare,
  Clock,
  Target,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    fetchCampaignData();
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      const [campaignRes, tasksRes] = await Promise.all([
        axios.get(`${API}/campaigns/${id}`),
        axios.get(`${API}/tasks?campaign_id=${id}`)
      ]);
      
      setCampaign(campaignRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      toast.error('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, type = 'campaign') => {
    const badgeClasses = {
      campaign: {
        planning: 'badge-planning',
        active: 'badge-active',
        paused: 'badge-paused',
        completed: 'badge-completed'
      },
      task: {
        todo: 'badge-todo',
        in_progress: 'badge-in-progress',
        in_review: 'badge-in-review',
        completed: 'badge-completed'
      }
    };

    return (
      <Badge className={`badge ${badgeClasses[type][status] || 'badge-todo'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      urgent: 'badge-urgent'
    };

    return (
      <Badge className={`badge ${priorityClasses[priority] || 'badge-medium'}`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      in_review: tasks.filter(t => t.status === 'in_review').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-200 rounded-lg h-64"></div>
              <div className="bg-gray-200 rounded-lg h-96"></div>
            </div>
            <div className="bg-gray-200 rounded-lg h-80"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-black mb-2">Campaign not found</h2>
        <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist.</p>
        <Link to="/campaigns">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  const taskStats = getTaskStats();

  return (
    <div className="space-y-6" data-testid="campaign-detail">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/campaigns">
          <Button variant="ghost" size="sm" data-testid="back-to-campaigns">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-black">{campaign.title}</h1>
            {getStatusBadge(campaign.status, 'campaign')}
          </div>
          <p className="text-gray-600">
            {campaign.client_name} • {campaign.campaign_type.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            onClick={() => setShowCreateTask(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            data-testid="create-task-button"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Overview */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Campaign Overview</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-black text-sm">{formatDate(campaign.start_date)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium text-black text-sm">{formatDate(campaign.end_date)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium text-black text-sm">{formatCurrency(campaign.budget)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Team Size</p>
                  <p className="font-medium text-black text-sm">{campaign.assigned_team?.length || 0}</p>
                </div>
              </div>

              {campaign.description && (
                <div>
                  <h4 className="font-medium text-black mb-2">Description</h4>
                  <p className="text-gray-600">{campaign.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Tasks Section */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Tasks</h3>
                <Button 
                  onClick={() => setShowCreateTask(true)}
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 hover:border-black hover:bg-black hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="all">All ({taskStats.total})</TabsTrigger>
                  <TabsTrigger value="todo">To Do ({taskStats.todo})</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress ({taskStats.in_progress})</TabsTrigger>
                  <TabsTrigger value="in_review">Review ({taskStats.in_review})</TabsTrigger>
                  <TabsTrigger value="completed">Done ({taskStats.completed})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tasks created yet</p>
                    </div>
                  )}
                </TabsContent>

                {['todo', 'in_progress', 'in_review', 'completed'].map((status) => (
                  <TabsContent key={status} value={status} className="space-y-3">
                    {tasks.filter(task => task.status === status).map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Progress */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Task Progress</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-medium">{taskStats.completed}/{taskStats.total}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: taskStats.total > 0 ? `${(taskStats.completed / taskStats.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-600">{taskStats.in_progress}</p>
                    <p className="text-blue-600">In Progress</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-600">{taskStats.in_review}</p>
                    <p className="text-yellow-600">In Review</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowCreateTask(true)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300 hover:border-black hover:bg-black hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-300 hover:border-black hover:bg-black hover:text-white"
                >
                  <Target className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onTaskCreated={fetchCampaignData}
        campaignId={id}
      />
    </div>
  );

  function TaskCard({ task }) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-black mb-1">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {getStatusBadge(task.status, 'task')}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {task.due_date && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Due: {formatDate(task.due_date)}
              </div>
            )}
            {task.estimated_hours && (
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {task.estimated_hours}h
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700">
            Edit
          </Button>
        </div>
      </div>
    );
  }
};

export default CampaignDetail;