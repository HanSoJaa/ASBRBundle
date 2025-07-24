import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Add = ({ token, adminData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState({
        image1: null,
        image2: null,
        image3: null,
        image4: null
    });
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        brand: "",
        shoesType: "",
        gender: "men",
        size: [],
        addedBy: adminData?.name || "",
        addedByRole: adminData?.role || "admin"
    });

    // Generate UK shoe sizes from 3 to 12
    const shoeSizes = Array.from({ length: 10 }, (_, i) => (i + 3).toString());

    useEffect(() => {
        if (!token) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        if (adminData) {
            setFormData(prev => ({
                ...prev,
                addedBy: adminData.name,
                addedByRole: adminData.role
            }));
        }
    }, [navigate, token, adminData]);

    const handleImageChange = (e, imageKey) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setImages(prev => ({
            ...prev,
            [imageKey]: file
        }));
    };

    const handleSizeToggle = (size) => {
        setFormData(prev => ({
            ...prev,
            size: prev.size.includes(size) 
                ? prev.size.filter(item => item !== size)
                : [...prev.size, size]
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                navigate('/login');
                return;
            }

            console.log('Token being sent:', token);
            console.log('Token type:', typeof token);
            console.log('Token length:', token.length);
            console.log('Admin data:', adminData);

            // Validate required fields
            if (!formData.name || !formData.description || !formData.price || 
                !formData.quantity || !formData.brand || !formData.shoesType || 
                formData.size.length === 0 || !images.image1) {
                toast.error('All fields are required');
                return;
            }

            setLoading(true);

            const formDataToSend = new FormData();
            
            // Append form fields exactly as backend expects them
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('quantity', formData.quantity);
            formDataToSend.append('brand', formData.brand);
            formDataToSend.append('shoesType', formData.shoesType);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('size', JSON.stringify(formData.size));
            formDataToSend.append('addedBy', adminData.name);
            formDataToSend.append('addedByRole', adminData.role);

            // Append images with exact field names
            if (images.image1) formDataToSend.append('image1', images.image1);
            if (images.image2) formDataToSend.append('image2', images.image2);
            if (images.image3) formDataToSend.append('image3', images.image3);
            if (images.image4) formDataToSend.append('image4', images.image4);

            console.log('Request URL:', `${backendUrl}/api/product/add`);
            console.log('Request headers:', {
                'Content-Type': 'multipart/form-data',
                'token': token
            });
            console.log('Form data:', Object.fromEntries(formDataToSend.entries()));

            const response = await axios({
                method: 'post',
                url: `${backendUrl}/api/product/add`,
                data: formDataToSend,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'token': token
                }
            });

            if (response.data.success) {
                toast.success('Product added successfully');
                navigate('/list');
            } else {
                throw new Error(response.data.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('adminInfo');
                navigate('/login');
                return;
            }

            toast.error(error.response?.data?.message || 'Error adding product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
            <h2 className="text-3xl font-bold mb-8 text-[#181A20]">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Images Section */}
                <div>
                    <label className="block text-gray-700 text-base font-semibold mb-3">Product Images</label>
                    <div className="flex flex-wrap gap-6">
                        {Object.keys(images).map((key) => (
                            <label key={key} htmlFor={key} className="cursor-pointer">
                                <div className="relative w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#4682A9] transition-all">
                                    <img 
                                        className="w-24 h-24 object-cover rounded-xl" 
                                        src={!images[key] ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f3f4f6'/%3E%3Ctext x='48' y='48' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='12'%3EUpload%3C/text%3E%3C/svg%3E" : URL.createObjectURL(images[key])} 
                                        alt={`Product preview ${key}`}
                                    />
                                    {images[key] && (
                                        <button
                                            type="button"
                                            className="absolute -top-2 -right-2 bg-[#EF4444] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImages(prev => ({ ...prev, [key]: null }));
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <input 
                                    onChange={(e) => handleImageChange(e, key)} 
                                    type="file" 
                                    id={key} 
                                    hidden 
                                    accept="image/*"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 text-base font-semibold mb-2">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-base font-semibold mb-2">Brand</label>
                        <select
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9]"
                            required
                        >
                            <option value="">Select Brand</option>
                            <option value="Adidas">Adidas</option>
                            <option value="Nike">Nike</option>
                            <option value="New Balance">New Balance</option>
                            <option value="Puma">Puma</option>
                            <option value="Asics">Asics</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-base font-semibold mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9]"
                            rows="4"
                            required
                        />
                    </div>
                </div>

                {/* Pricing and Inventory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 text-base font-semibold mb-2">Price</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-400">RM</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg w-full pl-10 py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9]"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-base font-semibold mb-2">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9]"
                            required
                            min="1"
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 text-base font-semibold mb-2">Shoes Type</label>
                        <select
                            name="shoesType"
                            value={formData.shoesType}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9]"
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="Running">Running</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Football">Football</option>
                            <option value="Badminton">Badminton</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-base font-semibold mb-2">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9]"
                            required
                        >
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="unisex">Unisex</option>
                            <option value="kids">Kids</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-base font-semibold mb-2">Available Sizes</label>
                        <div className="flex flex-wrap gap-2">
                            {shoeSizes.map((size) => (
                                <div 
                                    key={size}
                                    onClick={() => handleSizeToggle(size)}
                                    className={`px-5 py-2 cursor-pointer rounded-full border text-base font-semibold transition-all select-none shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4682A9] focus:border-[#4682A9] ${
                                        formData.size.includes(size) 
                                            ? 'bg-[#4682A9] text-white border-[#4682A9] scale-105' 
                                            : 'bg-white text-[#4682A9] border-gray-300 hover:bg-[#4682A9]/10 hover:text-[#4682A9]'
                                    }`}
                                >
                                    UK {size}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/list')}
                        className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-[#4682A9] text-white font-bold py-2 px-8 rounded-lg shadow hover:bg-[#315d7c] transition-all ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Add;