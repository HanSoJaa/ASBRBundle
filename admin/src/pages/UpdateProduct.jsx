import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const shoeSizes = Array.from({ length: 10 }, (_, i) => (i + 3).toString());
const brandOptions = ["Adidas", "Nike", "New Balance", "Puma", "Asics"];
const shoesTypeOptions = ["Running", "Lifestyle", "Football", "Badminton"];
const genderOptions = ["men", "women", "unisex", "kids"];

const UpdateProduct = () => {
  const { productID } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState({ image1: null, image2: null, image3: null, image4: null });
  const [currentImages, setCurrentImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    brand: '',
    shoesType: '',
    gender: 'men',
    size: [],
  });

  // Get current admin info
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/product/single/${productID}`);
        if (res.data.success) {
          const p = res.data.product;
          setFormData({
            name: p.name,
            description: p.description,
            price: p.price,
            quantity: p.quantity,
            brand: p.brand,
            shoesType: p.shoesType,
            gender: p.gender,
            size: p.size || [],
          });
          setCurrentImages(p.image || []);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productID]);

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
    setImages(prev => ({ ...prev, [imageKey]: file }));
    // Remove current image preview for this slot
    setCurrentImages(prev => {
      const arr = [...prev];
      arr[parseInt(imageKey.replace('image', '')) - 1] = null;
      return arr;
    });
  };

  const handleRemoveImage = (key) => {
    setImages(prev => ({ ...prev, [key]: null }));
    setCurrentImages(prev => {
      const arr = [...prev];
      arr[parseInt(key.replace('image', '')) - 1] = null;
      return arr;
    });
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.name || !formData.description || !formData.price || !formData.quantity || !formData.brand || !formData.shoesType || formData.size.length === 0) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('shoesType', formData.shoesType);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('size', JSON.stringify(formData.size));
      formDataToSend.append('updatedBy', adminData.name || 'Unknown');
      formDataToSend.append('updatedByRole', adminData.role || 'admin');
      // Only send new images
      Object.entries(images).forEach(([key, file]) => {
        if (file) formDataToSend.append(key, file);
      });
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${backendUrl}/api/product/update/${productID}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token': token
          }
        }
      );
      if (res.data.success) {
        toast.success('Product updated successfully');
        navigate('/list');
      } else {
        toast.error(res.data.message || 'Failed to update product');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-8 text-[#181A20]">Update Product</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images Section */}
        <div>
          <label className="block text-gray-700 text-base font-semibold mb-3">Product Images</label>
          <div className="flex flex-wrap gap-6">
            {[1,2,3,4].map((num) => {
              const key = `image${num}`;
              const file = images[key];
              const currentImg = currentImages[num-1];
              return (
                <label key={key} htmlFor={key} className="cursor-pointer">
                  <div className="relative w-24 h-24 flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#4682A9] transition-all">
                    <img
                      className="w-24 h-24 object-cover rounded-xl"
                      src={file ? URL.createObjectURL(file) : (currentImg ? currentImg : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f3f4f6'/%3E%3Ctext x='48' y='48' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='12'%3EUpload%3C/text%3E%3C/svg%3E")}
                      alt={`Product preview ${key}`}
                    />
                    {(file || currentImg) && (
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-[#EF4444] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(key);
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
              );
            })}
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
              {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
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
              {shoesTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
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
              {genderOptions.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
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
            disabled={submitting}
            className={`bg-[#4682A9] text-white font-bold py-2 px-8 rounded-lg shadow hover:bg-[#315d7c] transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;