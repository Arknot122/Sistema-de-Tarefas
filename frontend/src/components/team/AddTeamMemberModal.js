import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'creative_director', label: 'Creative Director' },
  { value: 'copywriter', label: 'Copywriter' },
  { value: 'designer', label: 'Designer' },
  { value: 'analyst', label: 'Analyst' }
];

const AddTeamMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, formData);
      toast.success('Team member added successfully!');
      onMemberAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error(error.response?.data?.detail || 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="add-member-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">Add Team Member</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="name" className="text-black font-medium">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              data-testid="member-name-input"
              className="mt-1 border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-black font-medium">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              data-testid="member-email-input"
              className="mt-1 border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-black font-medium">Role *</Label>
            <Select onValueChange={handleRoleChange} required>
              <SelectTrigger 
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                data-testid="member-role-select"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password" className="text-black font-medium">Temporary Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter temporary password"
              required
              data-testid="member-password-input"
              className="mt-1 border-gray-300 focus:border-black focus:ring-black"
            />
            <p className="text-xs text-gray-600 mt-1">
              Member can change this password after first login
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-300 hover:border-black hover:bg-black hover:text-white"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              data-testid="add-member-submit-button"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Member'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberModal;