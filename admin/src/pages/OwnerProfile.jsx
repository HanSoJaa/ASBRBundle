import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OwnerProfile = ({ token, adminData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        adminID: '',
        name: '',
        phoneNum: '',
        email: '',
        role: 'owner',
        address: '',
        profilePicture: null,
        password: ''
    });
    const [previewUrl, setPreviewUrl] = useState(null);

    // Fetch owner details when component mounts
    useEffect(() => {
        const fetchOwnerDetails = async () => {
            try {
                const response = await axios.get(
                    `${backendUrl}/api/admin/owner/${adminData.adminID}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    const ownerData = response.data.admin;
                    setFormData({
                        adminID: ownerData.adminID || '',
                        name: ownerData.name || '',
                        phoneNum: ownerData.phoneNum || '',
                        email: ownerData.email || '',
                        role: 'owner',
                        address: ownerData.address || '',
                        profilePicture: null,
                        password: ownerData.password || ''
                    });
                    setPreviewUrl(ownerData.profilePicture ? `${backendUrl}/${ownerData.profilePicture}` : null);
                } else {
                    toast.error('Failed to fetch owner details');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch owner details');
            } finally {
                setLoading(false);
            }
        };

        if (adminData?.adminID) {
            fetchOwnerDetails();
        } else {
            setLoading(false);
        }
    }, [adminData?.adminID, token]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name || !formData.email || !formData.phoneNum || !formData.address) {
                toast.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            const requestData = {
                name: formData.name,
                email: formData.email,
                phoneNum: formData.phoneNum,
                role: formData.role,
                address: formData.address,
                adminID: formData.adminID
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
                        `${backendUrl}/api/admin/owner/${adminData.adminID}`,
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
                        `${backendUrl}/api/admin/owner/${adminData.adminID}`,
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
                // Refresh the page to show updated data
                //window.location.reload()
                toast.success('Profile updated successfully');
                // Update local storage with new admin data
                const updatedAdminData = { ...adminData, ...response.data.admin };
                localStorage.setItem('adminData', JSON.stringify(updatedAdminData));
                ;

            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#4682A9] p-4">
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-3xl max-w-lg w-full p-8 md:p-12 flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Owner Profile</h2>
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
          <label className="text-white/80 font-semibold">Owner ID</label>
          <input type="text" name="adminID" value={formData.adminID} disabled className="rounded-full bg-white/20 text-white/80 px-4 py-2 text-lg cursor-not-allowed" />
                </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
                </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
                </div>
        <div className="flex flex-col gap-1 relative">
          <label className="text-white/80 font-semibold">Password <span className="text-xs text-white/60">(Leave blank to keep current)</span></label>
          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg pr-12 focus:ring-2 focus:ring-[#4682A9] outline-none" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-[#4682A9] text-lg font-bold focus:outline-none">
            {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Phone Number</label>
          <input type="tel" name="phoneNum" value={formData.phoneNum} onChange={handleInputChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
                </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Role</label>
          <span className="inline-block rounded-full bg-[#4682A9] text-white px-4 py-1 text-lg font-bold tracking-wide shadow">Owner</span>
                </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Address</label>
          <textarea name="address" value={formData.address} onChange={handleInputChange} className="rounded-2xl bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none resize-none" rows="3" required />
                </div>
        <button type="submit" disabled={loading} className={`w-full mt-4 rounded-full bg-[#4682A9] text-white font-extrabold text-lg py-3 shadow-lg transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#35607a] hover:scale-105'}`}>
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
            </form>
    </div>
        </div>
    );
};

export default OwnerProfile;