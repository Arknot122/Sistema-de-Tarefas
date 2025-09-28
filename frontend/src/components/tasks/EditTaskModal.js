import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee_id: '',
    due_date: null,
    estimated_hours: '',
    actual_hours: ''
  });
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (isOpen && task) {
      // Pre-populate form with task data
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee_id: task.assignee_id || '',
        due_date: task.due_date ? new Date(task.due_date) : null,
        estimated_hours: task.estimated_hours ? task.estimated_hours.toString() : '',
        actual_hours: task.actual_hours ? task.actual_hours.toString() : ''
      });
      
      fetchData();
    }
  }, [isOpen, task]);

  const fetchData = async () => {
    try {
      const [teamRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/team`),
        axios.get(`${API}/campaigns`)
      ]);
      setTeamMembers(teamRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
    if (!task) return;
    
    setLoading(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id || null,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null
      };

      await axios.put(`${API}/tasks/${task.id}`, updateData);
      toast.success('Tarefa atualizada com sucesso!');
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error.response?.data?.detail || 'Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const getCampaignName = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? `${campaign.title} - ${campaign.client_name}` : 'Campanha não encontrada';
  };

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return 'Não atribuído';
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Usuário não encontrado';
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="edit-task-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black flex items-center gap-2">
            <Save className="h-6 w-6 text-yellow-600" />
            Editar Tarefa
          </DialogTitle>
        </DialogHeader>
        
        {/* Campaign Info */}
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r mb-6">
          <p className="text-sm font-medium text-yellow-800">
            Campanha: {getCampaignName(task.campaign_id)}
          </p>
          <p className="text-xs text-yellow-700">
            Criada em: {new Date(task.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-black font-medium">Título da Tarefa *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Digite o título da tarefa"
                required
                data-testid="edit-task-title-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-black font-medium">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger 
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                  data-testid="edit-task-status-select"
                >
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-black font-medium">Prioridade</Label>
              <Select 
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger 
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                  data-testid="edit-task-priority-select"
                >
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignee_id" className="text-black font-medium">Responsável</Label>
              <Select 
                value={formData.assignee_id}
                onValueChange={(value) => handleSelectChange('assignee_id', value)}
              >
                <SelectTrigger 
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                  data-testid="edit-task-assignee-select"
                >
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Não atribuído</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-black font-medium">Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-1 justify-start text-left font-normal border-gray-300 hover:border-black"
                    data-testid="edit-task-due-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "PPP") : "Selecionar prazo"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.due_date && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateChange(null)}
                  className="mt-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remover prazo
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="estimated_hours" className="text-black font-medium">Horas Estimadas</Label>
              <Input
                id="estimated_hours"
                name="estimated_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.5"
                data-testid="edit-task-estimated-hours-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="actual_hours" className="text-black font-medium">Horas Realizadas</Label>
              <Input
                id="actual_hours"
                name="actual_hours"
                type="number"
                value={formData.actual_hours}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.5"
                data-testid="edit-task-actual-hours-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-black font-medium">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva os detalhes da tarefa..."
                rows={4}
                data-testid="edit-task-description-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 hover:border-black hover:bg-black hover:text-white"
              data-testid="cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              data-testid="save-task-button"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
