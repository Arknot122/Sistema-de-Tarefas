import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { 
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Target,
  CheckSquare2,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all'); // NOVO FILTRO

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, campaignFilter, assigneeFilter]);

  const fetchData = async () => {
    try {
      const [tasksRes, campaignsRes, teamRes] = await Promise.all([
        axios.get(`${API}/tasks`),
        axios.get(`${API}/campaigns`),
        axios.get(`${API}/team`)
      ]);
      setTasks(tasksRes.data);
      setCampaigns(campaignsRes.data);
      setTeamMembers(teamRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Campaign filter
    if (campaignFilter !== 'all') {
      filtered = filtered.filter(task => task.campaign_id === campaignFilter);
    }

    // NOVO: Assignee filter
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        filtered = filtered.filter(task => !task.assignee_id);
      } else {
        filtered = filtered.filter(task => task.assignee_id === assigneeFilter);
      }
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Status da tarefa atualizado');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Tarefa excluída com sucesso');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={`${statusClasses[status] || 'bg-gray-100 text-gray-800'} border-0`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${priorityClasses[priority] || 'bg-gray-100 text-gray-800'} border-0`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem prazo';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Atrasada ${Math.abs(diffDays)} dias`;
    } else if (diffDays === 0) {
      return 'Vence hoje';
    } else if (diffDays === 1) {
      return 'Vence amanhã';
    } else {
      return `Vence em ${diffDays} dias`;
    }
  };

  const getCampaignName = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.title : 'Campanha não encontrada';
  };

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return 'Não atribuído';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Usuário não encontrado';
  };

  const statusOptions = [
    { value: 'todo', label: 'A Fazer' },
    { value: 'in_progress', label: 'Em Progresso' },
    { value: 'in_review', label: 'Em Revisão' },
    { value: 'completed', label: 'Concluído' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tasks-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Gestão de Tarefas</h1>
          <p className="text-gray-600 mt-1">Controle completo das suas demandas e atribuições</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          data-testid="create-task-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters - MELHORADOS */}
      <Card className="p-4 border-0 shadow-md">
        <div className="space-y-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-black focus:ring-black"
              data-testid="search-input"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Filtrar por campanha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Campanhas</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* NOVO FILTRO POR RESPONSÁVEL */}
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Filtrar por responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Responsáveis</SelectItem>
                <SelectItem value="unassigned">Não Atribuídas</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>{filteredTasks.length} tarefa{filteredTasks.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4" data-testid="tasks-list">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-black">{task.title}</h3>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        <span>{getCampaignName(task.campaign_id)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{getAssigneeName(task.assignee_id)}</span>
                      </div>

                      {task.due_date && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className={
                            task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                              ? 'text-red-600 font-medium flex items-center'
                              : ''
                          }>
                            {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                      )}

                      {task.estimated_hours && (
                        <div className="flex items-center">
