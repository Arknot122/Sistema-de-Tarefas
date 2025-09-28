import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Users, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

const QuickTaskAssignment = ({ isOpen, onClose, onTaskCreated, preSelectedMember = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campaign_id: '',
    assignee_id: preSelectedMember?.id || '',
    priority: 'medium',
    due_date: null,
    estimated_hours: ''
  });
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      resetForm();
    }
  }, [isOpen, preSelectedMember]);

  const fetchData = async () => {
    try {
      const [campaignsRes, teamRes, tasksRes] = await Promise.all([
        axios.get(`${API}/campaigns`),
        axios.get(`${API}/team`),
        axios.get(`${API}/tasks`)
      ]);
      setCampaigns(campaignsRes.data.filter(c => c.status !== 'completed'));
      setTeamMembers(teamRes.data.filter(m => m.is_active));
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      campaign_id: '',
      assignee_id: preSelectedMember?.id || '',
      priority: 'medium',
      due_date: null,
      estimated_hours: ''
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getMemberWorkload = (memberId) => {
    const memberTasks = tasks.filter(task => 
      task.assignee_id === memberId && task.status !== 'completed'
    );
    return memberTasks.length;
  };

  const getWorkloadColor = (workload) => {
    if (workload === 0) return 'bg-gray-100 text-gray-600';
    if (workload <= 3) return 'bg-green-100 text-green-600';
    if (workload <= 6) return 'bg-yellow-100 text-yellow-600';
    return 'bg-red-100 text-red-600';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      due_date: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        assignee_id: formData.assignee_id || null
      };

      await axios.post(`${API}/tasks`, submitData);
      toast.success('Task assigned successfully!');
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.detail || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = priorityOptions.find(p => p.value === formData.priority);
  const selectedMember = teamMembers.find(m => m.id === formData.assignee_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="quick-assign-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            {preSelectedMember ? `Assign Task to ${preSelectedMember.name}` : 'Quick Task Assignment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Task Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-black font-medium">Task Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
                data-testid="task-title-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaign_id" className="text-black font-medium">Campaign *</Label>
                <Select 
                  value={formData.campaign_id}
                  onValueChange={(value) => handleSelectChange('campaign_id', value)} 
                  required
                >
                  <SelectTrigger 
                    className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                    data-testid="campaign-select"
                  >
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        <div className="flex items-center gap-2">
                          <span>{campaign.title}</span>
                          <Badge className="badge badge-active text-xs">
                            {campaign.client_name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-black font-medium">Priority</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger 
                    className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                    data-testid="priority-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0].replace('bg-', 'bg-')}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-1 justify-start text-left font-normal border-gray-300 hover:border-black"
                      data-testid="due-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, "PPP") : "Select due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={handleDateChange}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="estimated_hours" className="text-black font-medium">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  name="estimated_hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  data-testid="estimated-hours-input"
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-black font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description..."
                rows={3}
                data-testid="task-description-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>
          </div>

          {/* Team Member Selection */}
          <div className="space-y-4">
            <Label className="text-black font-medium">Assign to Team Member</Label>
            
            {/* Member Selection */}
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {teamMembers.map((member) => {
                const workload = getMemberWorkload(member.id);
                const isSelected = formData.assignee_id === member.id;
                
                return (
                  <div
                    key={member.id}
                    onClick={() => handleSelectChange('assignee_id', member.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`member-option-${member.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-yellow-400 text-black font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-black">{member.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {member.role.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${getWorkloadColor(workload)} border-0 text-xs`}>
                          {workload} active tasks
                        </Badge>
                        {isSelected && (
                          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Member Summary */}
            {selectedMember && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-black">Assigning to: {selectedMember.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">
                      {selectedMember.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Current Load:</span>
                    <span className="font-medium">
                      {getMemberWorkload(selectedMember.id)} tasks
                    </span>
                  </div>
                  {selectedPriority && (
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${selectedPriority.color.split(' ')[0]}`} />
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-medium">{selectedPriority.label}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 hover:border-black hover:bg-black hover:text-white"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.assignee_id}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              data-testid="assign-task-submit-button"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Assigning...
                </div>
              ) : (
                'Assign Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickTaskAssignment;