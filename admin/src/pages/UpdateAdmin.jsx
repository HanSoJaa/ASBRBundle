import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateAdmin = ({ token }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState({
        adminID: '',
        name: '',
        phoneNum: '',
        email: '',
        role: 'admin',
        address: '',
        profilePicture: null,
        password: ''
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchAdminDetails = async () => {
            if (!id || !token) {
                toast.error('Invalid request');
                navigate('/list-admin');
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${backendUrl}/api/admin/${id}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.success) {
                    const adminData = response.data.admin;
                    setAdmin({
                        adminID: adminData.adminID || '',
                        name: adminData.name || '',
                        phoneNum: adminData.phoneNum || '',
                        email: adminData.email || '',
                        role: adminData.role || 'admin',
                        address: adminData.address || '',
                        profilePicture: adminData.profilePicture || null,
                        password: ''
                    });

                    if (adminData.profilePicture) {
                        setPreviewUrl(`${backendUrl}/${adminData.profilePicture}`);
                    }
                } else {
                    toast.error(response.data.message || 'Failed to fetch admin details');
                    navigate('/list-admin');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch admin details');
                navigate('/list-admin');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminDetails();
    }, [id, token, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdmin(prev => ({ ...prev, [name]: value }));
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

            setAdmin(prev => ({ ...prev, profilePicture: file }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!admin.name || !admin.email || !admin.phoneNum || !admin.address) {
                toast.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            const requestData = {
                name: admin.name,
                email: admin.email,
                phoneNum: admin.phoneNum,
                role: admin.role,
                address: admin.address,
                adminID: admin.adminID
            };

            if (admin.password) {
                requestData.password = admin.password;
            }

            let response;
            if (admin.profilePicture instanceof File) {
                const formData = new FormData();
                Object.keys(requestData).forEach(key => formData.append(key, requestData[key]));
                formData.append('profilePicture', admin.profilePicture);

                response = await axios.put(
                    `${backendUrl}/api/admin/${id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                response = await axios.put(
                    `${backendUrl}/api/admin/${id}`,
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
                toast.success('Admin updated successfully');
                navigate('/list-admin');
            } else {
                toast.error(response.data.message || 'Failed to update admin');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update admin');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#4682A9] p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682A9]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#4682A9] p-4">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-3xl max-w-lg w-full p-8 md:p-12 flex flex-col items-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Update Admin</h2>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-[#4682A9] bg-white/30 flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-6xl">👤</span>
                            )}
                        </div>
                        <label className="mt-2 text-white/80 font-semibold">Profile Picture</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4682A9]/80 file:text-white hover:file:bg-[#4682A9]" />
                        <p className="text-xs text-white/60 mt-1">Max 5MB. JPG, PNG, GIF.</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-white/80 font-semibold">Admin ID</label>
                        <input type="text" name="adminID" value={admin.adminID} disabled className="rounded-full bg-white/20 text-white/80 px-4 py-2 text-lg cursor-not-allowed" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-white/80 font-semibold">Name</label>
                        <input type="text" name="name" value={admin.name} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-white/80 font-semibold">Email</label>
                        <input type="email" name="email" value={admin.email} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
                    </div>
                    <div className="flex flex-col gap-1 relative">
                        <label className="text-white/80 font-semibold">Password <span className="text-xs text-white/60">(Leave blank to keep current)</span></label>
                        <input type={showPassword ? 'text' : 'password'} name="password" value={admin.password} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg pr-12 focus:ring-2 focus:ring-[#4682A9] outline-none" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-[#4682A9] text-lg font-bold focus:outline-none">
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-white/80 font-semibold">Phone Number</label>
                        <input type="tel" name="phoneNum" value={admin.phoneNum} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-white/80 font-semibold">Role</label>
                        <select name="role" value={admin.role} onChange={handleInputChange} className="rounded-full bg-black/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none appearance-none">
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-white/80 font-semibold">Address</label>
                        <textarea name="address" value={admin.address} onChange={handleInputChange} className="rounded-2xl bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none resize-none" rows="3" required />
                    </div>
                    <div className="flex items-center justify-between gap-4 mt-2">
                        <button type="submit" disabled={loading} className={`flex-1 rounded-full bg-[#4682A9] text-white font-extrabold text-lg py-3 shadow-lg transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#35607a] hover:scale-105'}`}>
                            {loading ? 'Updating...' : 'Update Admin'}
                        </button>
                        <button type="button" onClick={() => navigate('/list-admin')} className="flex-1 rounded-full bg-white/20 text-white font-bold text-lg py-3 shadow hover:bg-white/30 transition-all duration-200">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateAdmin;
