import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import AddTeamMemberModal from './AddTeamMemberModal';
import EditTeamMemberModal from './EditTeamMemberModal';
import WorkloadChart from './WorkloadChart';
import { 
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  Target,
  Mail,
  Phone,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeamList = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, searchTerm]);

  const fetchData = async () => {
    try {
      const [membersRes, tasksRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/team`),
        axios.get(`${API}/tasks`),
        axios.get(`${API}/campaigns`)
      ]);
      
      setTeamMembers(membersRes.data);
      setTasks(tasksRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      account_manager: 'bg-blue-100 text-blue-800',
      creative_director: 'bg-purple-100 text-purple-800',
      copywriter: 'bg-green-100 text-green-800',
      designer: 'bg-pink-100 text-pink-800',
      analyst: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={`${roleColors[role] || 'bg-gray-100 text-gray-800'} border-0`}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getMemberStats = (memberId) => {
    const memberTasks = tasks.filter(task => task.assignee_id === memberId);
    const activeTasks = memberTasks.filter(task => 
      task.status !== 'completed'
    );
    const completedTasks = memberTasks.filter(task => 
      task.status === 'completed'
    );
    const overdueTasks = memberTasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < new Date() && 
      task.status !== 'completed'
    );

    const totalHours = memberTasks.reduce((sum, task) => 
      sum + (task.estimated_hours || 0), 0
    );

    return {
      totalTasks: memberTasks.length,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      totalHours
    };
  };

  const getWorkloadColor = (activeTasks) => {
    if (activeTasks === 0) return 'bg-gray-100 text-gray-600';
    if (activeTasks <= 3) return 'bg-green-100 text-green-600';
    if (activeTasks <= 6) return 'bg-yellow-100 text-yellow-600';
    return 'bg-red-100 text-red-600';
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await axios.delete(`${API}/team/${memberId}`);
        toast.success('Team member removed successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast.error('Failed to remove team member');
      }
    }
  };

  const formatDate = (dateString) => {
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
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="team-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their workload</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          data-testid="add-member-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-black">{teamMembers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-black">
                {teamMembers.filter(m => m.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <CheckSquare className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-black">
                {tasks.filter(t => t.status !== 'completed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-600">
                {tasks.filter(t => 
                  t.due_date && 
                  new Date(t.due_date) < new Date() && 
                  t.status !== 'completed'
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-black focus:ring-black"
            data-testid="search-input"
          />
        </div>
      </Card>

      {/* Workload Chart */}
      <WorkloadChart 
        teamMembers={teamMembers}
        tasks={tasks}
        campaigns={campaigns}
      />

      {/* Team Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="team-grid">
          {filteredMembers.map((member) => {
            const stats = getMemberStats(member.id);
            return (
              <Card key={member.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarFallback className="bg-yellow-400 text-black font-medium">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-black">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`member-menu-${member.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Role Badge */}
                  <div className="mb-4">
                    {getRoleBadge(member.role)}
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Workload</span>
                      <Badge className={`${getWorkloadColor(stats.activeTasks)} border-0`}>
                        {stats.activeTasks} active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Tasks</p>
                        <p className="font-semibold text-black">{stats.totalTasks}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Completed</p>
                        <p className="font-semibold text-green-600">{stats.completedTasks}</p>
                      </div>
                    </div>

                    {stats.overdueTasks > 0 && (
                      <div className="flex items-center text-sm text-red-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {stats.overdueTasks} overdue task{stats.overdueTasks !== 1 ? 's' : ''}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="h-4 w-4 mr-1" />
                      {stats.totalHours}h estimated workload
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Member since {formatDate(member.created_at)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-md">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">No team members found</h3>
          <p className="text-gray-600 mb-6">
            {teamMembers.length === 0 
              ? "Start building your team by adding members"
              : "Try adjusting your search criteria"
            }
          </p>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </Card>
      )}

      {/* Modals */}
      <AddTeamMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onMemberAdded={fetchData}
      />

      {selectedMember && (
        <EditTeamMemberModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          onMemberUpdated={fetchData}
        />
      )}
    </div>
  );
};

export default TeamList;