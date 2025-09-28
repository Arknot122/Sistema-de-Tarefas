import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'creative_director', label: 'Creative Director' },
  { value: 'copywriter', label: 'Copywriter' },
  { value: 'designer', label: 'Designer' },
  { value: 'analyst', label: 'Analyst' }
];

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);

    const result = await register({
      email: formData.email,
      name: formData.name,
      password: formData.password,
      role: formData.role
    });
    
    if (result.success) {
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">DemandHub</h1>
          <p className="text-gray-600">Marketing Consultancy Management</p>
        </div>

        {/* Register Card */}
        <Card className="p-6 shadow-lg border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-black mb-2">Create your account</h2>
            <p className="text-gray-600 text-sm">Join your marketing team today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                data-testid="name-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-black font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                data-testid="email-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-black font-medium">Role</Label>
              <Select onValueChange={handleRoleChange} required>
                <SelectTrigger 
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                  data-testid="role-select"
                >
                  <SelectValue placeholder="Select your role" />
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
              <Label htmlFor="password" className="text-black font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                data-testid="password-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-black font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                data-testid="confirm-password-input"
                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="register-button"
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-black font-medium hover:text-yellow-600 transition-colors"
                data-testid="login-link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;