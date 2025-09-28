import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  User,
  Plus,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyTasksDashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, overdue

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  const fetchMyTasks = async () => {
    try {
      const [tasksRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/tasks`),
        axios.get(`${API}/campaigns`)
      ]);
      
      // Filter tasks assigned to current user
      const userTasks = tasksRes.data.filter(task => task.assignee_id === user.id);
      setMyTasks(userTasks);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      toast.error('Erro ao carregar suas tarefas');
    } finally {
      setLoading(false);
    }
  };

  const getTaskStats = () => {
    const total = myTasks.length;
    const completed = myTasks.filter(t => t.status === 'completed').length;
    const inProgress = myTasks.filter(t => t.status === 'in_progress').length;
    const inReview = myTasks.filter(t => t.status === 'in_review').length;
    const todo = myTasks.filter(t => t.status === 'todo').length;
    
    const today = new Date();
    const overdue = myTasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < today && 
      t.status !== 'completed'
    ).length;
    
    const dueToday = myTasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      const taskDate = new Date(t.due_date);
      return taskDate.toDateString() === today.toDateString();
    }).length;

    const thisWeek = myTasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      const taskDate = new Date(t.due_date);
      const weekFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
      return taskDate >= today && taskDate <= weekFromNow;
    }).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      inReview,
      todo,
      overdue,
      dueToday,
      thisWeek,
      completionRate
    };
  };

  const getFilteredTasks = () => {
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return myTasks.filter(t => {
          if (!t.due_date || t.status === 'completed') return false;
          const taskDate = new Date(t.due_date);
          return taskDate.toDateString() === today.toDateString();
        });
      
      case 'week':
        return myTasks.filter(t => {
          if (!t.due_date || t.status === 'completed') return false;
          const taskDate = new Date(t.due_date);
          const weekFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
          return taskDate >= today && taskDate <= weekFromNow;
        });
      
      case 'overdue':
        return myTasks.filter(t => 
          t.due_date && 
          new Date(t.due_date) < today && 
          t.status !== 'completed'
        );
      
      default:
        return myTasks.filter(t => t.status !== 'completed');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status: newStatus });
      setMyTasks(myTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      todo: { class: 'bg-gray-100 text-gray-800', label: 'A Fazer' },
      in_progress: { class: 'bg-blue-100 text-blue-800', label: 'Em Progresso' },
      in_review: { class: 'bg-yellow-100 text-yellow-800', label: 'Em Revisão' },
      completed: { class: 'bg-green-100 text-green-800', label: 'Concluído' }
    };

    const config = statusConfig[status] || statusConfig.todo;
    return (
      <Badge className={`${config.class} border-0 text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'bg-green-100 text-green-800', label: 'Baixa' },
      medium: { class: 'bg-yellow-100 text-yellow-800', label: 'Média' },
      high: { class: 'bg-orange-100 text-orange-800', label: 'Alta' },
      urgent: { class: 'bg-red-100 text-red-800', label: 'Urgente' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <Badge className={`${config.class} border-0 text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getCampaignName = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.title : 'Campanha não encontrada';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem prazo';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
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

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="my-tasks-dashboard">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-black">Minhas Demandas</h1>
          <p className="text-gray-600 mt-1">
            Olá <strong>{user?.name}</strong>, aqui estão suas tarefas e pendências
          </p>
        </div>
        <Link to="/tasks">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tarefas</p>
              <p className="text-3xl font-bold text-black">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Progresso</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vencem Hoje</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.dueToday}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Atrasadas</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 border-0 shadow-md">
        <h3 className="text-lg font-semibold text-black mb-4">Progresso Geral</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Taxa de Conclusão</span>
            <span className="font-medium">{stats.completed}/{stats.total} ({stats.completionRate.toFixed(1)}%)</span>
          </div>
          <Progress value={stats.completionRate} className="h-3" />
          
          <div className="grid grid-cols-4 gap-4 text-sm mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-600">{stats.todo}</p>
              <p className="text-gray-500">A Fazer</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-600">{stats.inProgress}</p>
              <p className="text-blue-500">Em Progresso</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-600">{stats.inReview}</p>
              <p className="text-yellow-500">Em Revisão</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-600">{stats.completed}</p>
              <p className="text-green-500">Concluídas</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Filters */}
      <Card className="p-4 border-0 shadow-md">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-black text-white' : 'border-gray-300'}
            >
              Todas Ativas ({myTasks.filter(t => t.status !== 'completed').length})
            </Button>
            <Button
              variant={filter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('today')}
              className={filter === 'today' ? 'bg-black text-white' : 'border-gray-300'}
            >
              Hoje ({stats.dueToday})
            </Button>
            <Button
              variant={filter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('week')}
              className={filter === 'week' ? 'bg-black text-white' : 'border-gray-300'}
            >
              Esta Semana ({stats.thisWeek})
            </Button>
            <Button
              variant={filter === 'overdue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('overdue')}
              className={filter === 'overdue' ? 'bg-red-600 text-white hover:bg-red-700' : 'border-gray-300'}
            >
              Atrasadas ({stats.overdue})
            </Button>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <Card className="border-0 shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-black">
            {filter === 'all' && 'Todas as Tarefas Ativas'}
            {filter === 'today' && 'Tarefas para Hoje'}
            {filter === 'week' && 'Tarefas desta Semana'}
            {filter === 'overdue' && 'Tarefas Atrasadas'}
          </h3>
        </div>
        
        <div className="p-6">
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-black">{task.title}</h4>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {getCampaignName(task.campaign_id)}
                        </div>
                        
                        {task.due_date && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
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
                            <Clock className="h-4 w-4 mr-1" />
                            {task.estimated_hours}h estimadas
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Concluir
                        </Button>
                      )}
                      
                      <Link to={`/tasks`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filter === 'all' && 'Nenhuma tarefa ativa no momento'}
                {filter === 'today' && 'Nenhuma tarefa para hoje'}
                {filter === 'week' && 'Nenhuma tarefa para esta semana'}
                {filter === 'overdue' && 'Nenhuma tarefa atrasada - parabéns!'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyTasksDashboard;
