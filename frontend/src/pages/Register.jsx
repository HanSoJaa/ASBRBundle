import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';


const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNum: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate phone number
    const cleanPhoneNum = formData.phoneNum.replace(/\D/g, '');
    if (cleanPhoneNum.length < 10 || cleanPhoneNum.length > 13) {
      toast.error('Phone number must be between 10-13 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        name: formData.name,
        email: formData.email,
        phoneNum: cleanPhoneNum,
        password: formData.password
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Registration successful!');
        navigate('/');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background-dark via-primary-dark to-secondary-light"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
    >
      <motion.div
        className="max-w-md w-full space-y-8 bg-surface/90 border border-background-dark/10 rounded-3xl shadow-2xl p-10 backdrop-blur-lg"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-primary drop-shadow mb-2">
            Create your account
          </h2>
          <p className="text-center text-sm text-muted mb-6">
            Or{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phoneNum" className="block text-sm font-medium text-muted mb-1">Phone Number</label>
              <input
                id="phoneNum"
                name="phoneNum"
                type="tel"
                required
                className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Phone Number"
                value={formData.phoneNum}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          <motion.button
              type="submit"
              disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-full text-white bg-[#4682A9] shadow-lg hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:ring-offset-2 transition-all"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                </span>
              ) : (
                'Create Account'
              )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Register; 