import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddAdmin = ({ token }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNum: '',
        email: '',
        password: '',
        role: 'admin',
        address: '',
        showPassword: false,
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = (e) => {
        if (e.target.name === 'profilePicture') {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error('Please upload an image file');
                    return;
                }
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('Image size should be less than 5MB');
                    return;
                }
                setProfilePicture(file);
                // Create preview URL
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate form data
            if (!formData.name || !formData.email || !formData.password || !formData.phoneNum || !formData.address || !profilePicture) {
                toast.error('All fields are required');
                setLoading(false);
                return;
            }

            if (formData.password.length < 8) {
                toast.error('Password must be at least 8 characters');
                setLoading(false);
                return;
            }

            if (formData.phoneNum.length < 10) {
                toast.error('Please enter a valid phone number');
                setLoading(false);
                return;
            }

            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            formDataToSend.append('profilePicture', profilePicture);

            const response = await axios.post(
                `${backendUrl}/api/admin/add`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Admin added successfully');
                navigate('/list-admin');
            } else {
                toast.error(response.data.message || 'Error adding admin');
            }
        } catch (error) {
            console.error('Error adding admin:', error);
            toast.error(error.response?.data?.message || 'Error adding admin');
        } finally {
            setLoading(false);
        }
    };

    return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#4682A9] p-4">
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-3xl max-w-lg w-full p-8 md:p-12 flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Add New Admin</h2>
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
          <input type="file" accept="image/*" name="profilePicture" onChange={handleChange} className="mt-1 text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4682A9]/80 file:text-white hover:file:bg-[#4682A9]" required />
          <p className="text-xs text-white/60 mt-1">Max 5MB. JPG, PNG, GIF.</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Phone Number</label>
          <input type="tel" name="phoneNum" value={formData.phoneNum} onChange={handleChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none" required />
        </div>
        <div className="flex flex-col gap-1 relative">
          <label className="text-white/80 font-semibold">Password</label>
          <input type={formData.showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="rounded-full bg-white/20 text-white px-4 py-2 text-lg pr-12 focus:ring-2 focus:ring-[#4682A9] outline-none" required />
          <button type="button" onClick={() => setFormData(f => ({ ...f, showPassword: !f.showPassword }))} className="absolute right-4 top-9 text-[#4682A9] text-lg font-bold focus:outline-none">
            {formData.showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className="rounded-full bg-black/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none appearance-none">
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/80 font-semibold">Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} className="rounded-2xl bg-white/20 text-white px-4 py-2 text-lg focus:ring-2 focus:ring-[#4682A9] outline-none resize-none" rows="3" required />
        </div>
        <button type="submit" disabled={loading} className={`w-full mt-4 rounded-full bg-[#4682A9] text-white font-extrabold text-lg py-3 shadow-lg transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#35607a] hover:scale-105'}`}>
          {loading ? 'Adding...' : 'Add Admin'}
        </button>
      </form>
    </div>
  </div>
);
};

export default AddAdmin; 