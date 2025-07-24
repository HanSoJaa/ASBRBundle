import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';


const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: request, 2: verify PIN, 3: reset password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phoneNum: '',
    pin: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/forgot-password/request`, {
        email: formData.email,
        phoneNum: formData.phoneNum
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setStep(2);
      } else {
        toast.error(response.data.message || 'Failed to send reset PIN');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify PIN
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/forgot-password/verify`, {
        email: formData.email,
        phoneNum: formData.phoneNum,
        pin: formData.pin
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setStep(3);
      } else {
        toast.error(response.data.message || 'Invalid PIN');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/user/forgot-password/reset`, {
        email: formData.email,
        phoneNum: formData.phoneNum,
        pin: formData.pin,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <h2 className="text-3xl font-extrabold text-primary drop-shadow mb-2 text-center">Forgot Password</h2>
      <p className="text-center text-sm text-muted mb-6">Enter your email and phone number to receive a reset PIN</p>
      <form className="space-y-6" onSubmit={handleRequestReset}>
        <div className="flex flex-col gap-4">
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
        </div>
        <motion.button
            type="submit"
            disabled={loading}
          className="w-full bg-[#4682A9] text-white py-3 rounded-full font-bold mt-2 shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          >
            {loading ? (
            <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              </span>
            ) : (
              'Send Reset PIN'
            )}
        </motion.button>
      </form>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 className="text-3xl font-extrabold text-primary drop-shadow mb-2 text-center">Enter Reset PIN</h2>
      <p className="text-center text-sm text-muted mb-6">Check your email for the 4-digit PIN</p>
      <form className="space-y-6" onSubmit={handleVerifyPin}>
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-muted mb-1">4-Digit PIN</label>
          <input
            id="pin"
            name="pin"
            type="text"
            maxLength="4"
            pattern="[0-9]{4}"
            required
            className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="0000"
            value={formData.pin}
            onChange={handleChange}
          />
        </div>
        <motion.button
            type="submit"
            disabled={loading}
          className="w-full bg-[#4682A9] text-white py-3 rounded-full font-bold mt-2 shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          >
            {loading ? (
            <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              </span>
            ) : (
              'Verify PIN'
            )}
        </motion.button>
      </form>
    </>
  );

  const renderStep3 = () => (
    <>
      <h2 className="text-3xl font-extrabold text-primary drop-shadow mb-2 text-center">Reset Password</h2>
      <p className="text-center text-sm text-muted mb-6">Enter your new password</p>
      <form className="space-y-6" onSubmit={handleResetPassword}>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-muted mb-1">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted mb-1">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>
        <motion.button
            type="submit"
            disabled={loading}
          className="w-full bg-[#4682A9] text-white py-3 rounded-full font-bold mt-2 shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          >
            {loading ? (
            <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              </span>
            ) : (
              'Reset Password'
            )}
        </motion.button>
      </form>
    </>
  );

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background-dark via-primary-dark to-secondary-light"
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
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        <div className="text-center">
          <Link to="/login" className="font-medium text-[#4682A9] hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword; 