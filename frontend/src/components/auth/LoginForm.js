import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">DemandHub</h1>
          <p className="text-gray-600">Marketing Consultancy Management</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 shadow-lg border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-black mb-2">Welcome back</h2>
            <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-button"
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-black font-medium hover:text-yellow-600 transition-colors"
                data-testid="register-link"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Demo Access</h4>
          <p className="text-xs text-yellow-700">
            Register with any email to get started, or use the registration form to create your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;