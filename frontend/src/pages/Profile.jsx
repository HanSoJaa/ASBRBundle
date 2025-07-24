import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { clearOldUserData } from '../utils/clearOldData';
import { motion } from 'framer-motion';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNum: '',
        email: '',
        address: '',
        profilePicture: null,
        password: ''
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const navigate = useNavigate();

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    // Check if user data has old format (_id instead of userID)
    useEffect(() => {
        if (clearOldUserData()) {
            toast.error('Please login again to continue');
            navigate('/login');
            return;
        }
    }, [navigate]);

    // Redirect if not logged in
    useEffect(() => {
        if (!token || !userData?.userID) {
            toast.error('Please login to view your profile');
            navigate('/login');
            return;
        }
    }, [token, userData, navigate]);

    // Fetch user details when component mounts
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userData?.userID || !token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `${backendUrl}/api/user/userProfile/${userData.userID}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    const userDetails = response.data.user;
                    setFormData({
                        name: userDetails.name || '',
                        phoneNum: userDetails.phoneNum || '',
                        email: userDetails.email || '',
                        address: userDetails.address || '',
                        profilePicture: null,
                        password: ''
                    });
                    
                    if (userDetails.profilePicture) {
                        setPreviewUrl(`${backendUrl}/${userDetails.profilePicture}`);
                    }
                } else {
                    toast.error(response.data.message || 'Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                const errorMessage = error.response?.data?.message || 'Failed to fetch user details';
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userData?.userID, token, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setFormData(prev => ({ ...prev, profilePicture: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (!formData.phoneNum.trim()) {
            toast.error('Phone number is required');
            return false;
        }
        if (!formData.address.trim()) {
            toast.error('Address is required');
            return false;
        }
        if (formData.password && formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);

        try {
            const requestData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phoneNum: formData.phoneNum.trim(),
                address: formData.address.trim(),
            };

            if (formData.password) {
                requestData.password = formData.password;
            }

            let response;
            if (formData.profilePicture instanceof File) {
                const formDataObj = new FormData();
                Object.keys(requestData).forEach(key => formDataObj.append(key, requestData[key]));
                formDataObj.append('profilePicture', formData.profilePicture);

                response = await axios.put(
                    `${backendUrl}/api/user/userProfile/${userData.userID}`,
                    formDataObj,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                response = await axios.put(
                    `${backendUrl}/api/user/userProfile/${userData.userID}`,
                    requestData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            if (response.data.success) {
                toast.success('Profile updated successfully');
                // Update local storage with new user data
                const updatedUserData = { ...userData, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                // Clear password field after successful update
                setFormData(prev => ({ ...prev, password: '' }));
                
                // Update preview URL if profile picture was updated
                if (response.data.user.profilePicture) {
                    setPreviewUrl(`${backendUrl}/${response.data.user.profilePicture}`);
                }
            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background-dark via-primary-dark to-secondary-light"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
        >
            <motion.form
                className="max-w-lg w-full bg-surface/90 border border-background-dark/10 rounded-3xl shadow-2xl p-10 flex flex-col gap-6 backdrop-blur-lg"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="relative flex items-center justify-center w-28 h-28">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Profile Preview"
                                className="w-28 h-28 rounded-full object-cover border-4 border-[#4682A9] shadow-lg bg-background-dark mx-auto"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-[#4682A9] shadow-lg bg-[#4682A9] mx-auto">
                                <span className="text-white text-4xl font-bold">{formData.name ? formData.name[0].toUpperCase() : 'U'}</span>
                            </div>
                        )}
                        <label className="absolute bottom-1 right-1 bg-black text-white rounded-full p-2 cursor-pointer shadow-lg hover:scale-105 transition-transform flex items-center justify-center w-8 h-8">
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </label>
                    </div>
                    <h2 className="text-2xl font-bold text-primary">My Profile</h2>
                        </div>
                <div className="flex flex-col gap-4">
                        <div>
                        <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
                            <input
                            type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Full Name"
                            required
                            />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-muted mb-1">Email</label>
                            <input
                            type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Email"
                            required
                            />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-muted mb-1">Phone Number</label>
                                <input
                            type="tel"
                                name="phoneNum"
                                value={formData.phoneNum}
                                onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Phone Number"
                            required
                            />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-muted mb-1">Address</label>
                        <input
                            type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Address"
                            required
                            />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Password <span className="text-xs text-muted">(leave blank to keep current)</span></label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="New Password"
                        />
                        <button type="button" className="text-xs text-accent mt-1" onClick={() => setShowPassword(v => !v)}>
                            {showPassword ? 'Hide' : 'Show'} Password
                        </button>
                    </div>
            </div>
                <motion.button
                    type="submit"
                    className="w-full bg-[#4682A9] text-white py-3 rounded-full font-bold mt-4 shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Save Changes
                </motion.button>
            </motion.form>
        </motion.div>
    );
};

export default Profile;
