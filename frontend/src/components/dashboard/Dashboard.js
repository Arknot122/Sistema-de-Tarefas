import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FolderOpen, 
  CheckSquare, 
  Users, 
  AlertTriangle,
  Plus,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, campaignsRes, tasksRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/campaigns`),
        axios.get(`${API}/tasks`)
      ]);

      setStats(statsRes.data);
      setCampaigns(campaignsRes.data.slice(0, 5)); // Show only recent 5
      setTasks(tasksRes.data.slice(0, 8)); // Show only recent 8
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-96"></div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening with your marketing campaigns today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/campaigns">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-3xl font-bold text-black mt-1" data-testid="active-campaigns-count">
                {stats?.campaigns?.active || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-black mt-1" data-testid="total-tasks-count">
                {Object.values(stats?.tasks || {}).reduce((sum, count) => sum + count, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600 mt-1" data-testid="overdue-tasks-count">
                {stats?.overdue_tasks || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-black mt-1" data-testid="team-members-count">
                {stats?.team_members || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Campaigns */}
        <Card className="border-0 shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Recent Campaigns</h3>
              <Link to="/campaigns">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black">
                  View all
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {campaigns.length > 0 ? (
              <div className="space-y-4" data-testid="recent-campaigns-list">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-black mb-1">{campaign.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{campaign.client_name}</p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(campaign.status, 'campaign')}
                        <span className="text-xs text-gray-500 capitalize">
                          {campaign.campaign_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(campaign.end_date)}
                      </div>
                      <Link to={`/campaigns/${campaign.id}`}>
                        <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No campaigns yet</p>
                <Link to="/campaigns">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                    Create your first campaign
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card className="border-0 shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Recent Tasks</h3>
              <Link to="/tasks">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black">
                  View all
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {tasks.length > 0 ? (
              <div className="space-y-3" data-testid="recent-tasks-list">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-black mb-1 text-sm">{task.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(task.status, 'task')}
                        {getPriorityBadge(task.priority)}
                      </div>
                      {task.due_date && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Due: {formatDate(task.due_date)}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 text-xs">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No tasks yet</p>
                <Link to="/tasks">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                    Create your first task
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-black">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/campaigns" data-testid="quick-action-campaign">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 cursor-pointer">
                <FolderOpen className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="font-medium text-black mb-1">Create Campaign</h4>
                <p className="text-sm text-gray-600">Start a new marketing campaign</p>
              </div>
            </Link>
            
            <Link to="/tasks" data-testid="quick-action-task">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 cursor-pointer">
                <CheckSquare className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="font-medium text-black mb-1">Add Task</h4>
                <p className="text-sm text-gray-600">Create a new task for your team</p>
              </div>
            </Link>
            
            <Link to="/team" data-testid="quick-action-team">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 cursor-pointer">
                <Users className="h-8 w-8 text-gray-400 mb-2" />
                <h4 className="font-medium text-black mb-1">Manage Team</h4>
                <p className="text-sm text-gray-600">View and manage team members</p>
              </div>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;