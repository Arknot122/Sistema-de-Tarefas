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
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const campaignTypes = [
  { value: 'brand_launch', label: 'Brand Launch' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'content_strategy', label: 'Content Strategy' },
  { value: 'seo', label: 'SEO' },
  { value: 'ppc', label: 'PPC' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_marketing', label: 'Email Marketing' },
  { value: 'pr', label: 'PR' },
  { value: 'events', label: 'Events' }
];

const CreateCampaignModal = ({ isOpen, onClose, onCampaignCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campaign_type: '',
    client_name: '',
    budget: '',
    start_date: null,
    end_date: null,
    assigned_team: []
  });
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      resetForm();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team`);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      campaign_type: '',
      client_name: '',
      budget: '',
      start_date: null,
      end_date: null,
      assigned_team: []
    });
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

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date ? formData.start_date.toISOString() : null,
        end_date: formData.end_date ? formData.end_date.toISOString() : null
      };

      await axios.post(`${API}/campaigns`, submitData);
      toast.success('Campaign created successfully!');
      onCampaignCreated();
      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-campaign-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">Create New Campaign</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-black font-medium">Campaign Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter campaign title"
                required
                data-testid="campaign-title-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="client_name" className="text-black font-medium">Client Name *</Label>
              <Input
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Enter client name"
                required
                data-testid="client-name-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="campaign_type" className="text-black font-medium">Campaign Type *</Label>
              <Select onValueChange={(value) => handleSelectChange('campaign_type', value)} required>
                <SelectTrigger 
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                  data-testid="campaign-type-select"
                >
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget" className="text-black font-medium">Budget ($)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                data-testid="budget-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label className="text-black font-medium">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-1 justify-start text-left font-normal border-gray-300 hover:border-black"
                    data-testid="start-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => handleDateChange('start_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-black font-medium">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-1 justify-start text-left font-normal border-gray-300 hover:border-black"
                    data-testid="end-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => handleDateChange('end_date', date)}
                    initialFocus
                    disabled={(date) => formData.start_date && date < formData.start_date}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-black font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter campaign description..."
                rows={4}
                data-testid="campaign-description-input"
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              data-testid="create-campaign-submit-button"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;