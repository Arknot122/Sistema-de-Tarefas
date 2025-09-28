import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
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

const EditTeamMemberModal = ({ isOpen, onClose, member, onMemberUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        role: member.role || '',
        is_active: member.is_active !== undefined ? member.is_active : true
      });
    }
  }, [member]);

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

  const handleActiveChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/team/${member.id}`, formData);
      toast.success('Team member updated successfully!');
      onMemberUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error(error.response?.data?.detail || 'Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="edit-member-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">Edit Team Member</DialogTitle>
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
              data-testid="edit-member-name-input"
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
              data-testid="edit-member-email-input"
              className="mt-1 border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-black font-medium">Role *</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} required>
              <SelectTrigger 
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                data-testid="edit-member-role-select"
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

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="is_active" className="text-black font-medium">Active Member</Label>
              <p className="text-sm text-gray-600">
                Inactive members cannot access the system
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleActiveChange}
              data-testid="edit-member-active-switch"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              data-testid="update-member-submit-button"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Member'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamMemberModal;