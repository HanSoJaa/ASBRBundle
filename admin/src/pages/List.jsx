import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const BRAND_OPTIONS = ["Adidas", "Nike", "Puma", "New Balance", "Asics"];
const SHOES_TYPE_OPTIONS = ["Running", "Lifestyle", "Football", "Badminton"];

const List = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        gender: '',
        brand: '',
        shoesType: '',
        minPrice: '',
        maxPrice: ''
    });
    const [search, setSearch] = useState("");
    const [searchTrigger, setSearchTrigger] = useState(false);
    const [minPriceInput, setMinPriceInput] = useState("");
    const [maxPriceInput, setMaxPriceInput] = useState("");

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Format date to DD/MM/YYYY
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await axios.get(`${backendUrl}/api/product/list?${queryParams.toString()}`);
            let fetchedProducts = response.data.success ? response.data.products : [];
            // Apply search filter (client-side)
            if (search) {
                const s = search.toLowerCase();
                fetchedProducts = fetchedProducts.filter(
                  p => p.productID.toLowerCase().includes(s) || p.name.toLowerCase().includes(s)
                );
            }
            setProducts(fetchedProducts);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        setMinPriceInput(filters.minPrice);
        setMaxPriceInput(filters.maxPrice);
        // eslint-disable-next-line
    }, [filters, searchTrigger]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceInput = (e, type) => {
        const value = e.target.value;
        if (type === 'min') setMinPriceInput(value);
        else setMaxPriceInput(value);
    };
    const handlePriceCommit = (type) => {
        setFilters(prev => ({
            ...prev,
            minPrice: minPriceInput,
            maxPrice: maxPriceInput
        }));
    };
    const handlePriceKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            handlePriceCommit(type);
        }
    };

    const handleDelete = async (productID) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await axios.delete(
                    `${backendUrl}/api/product/remove/${productID}`,
                    {
                        headers: {
                            'token': token // Changed from Authorization to token to match adminAuth middleware
                        }
                    }
                );
    
                if (response.data.success) {
                    toast.success('Product deleted successfully');
                    fetchProducts();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error(error.response?.data?.message || 'Error deleting product');
            }
        }
    };
    
    

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Product List</h1>
                {/* Search Bar */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by Product ID or Name"
                        className="p-2 border rounded w-full max-w-xs"
                    />
                    <button
                        onClick={() => setSearchTrigger(t => !t)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Search
                    </button>
                </div>
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <select
                        name="gender"
                        value={filters.gender}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    >
                        <option value="">All Genders</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="unisex">Unisex</option>
                        <option value="kids">Kids</option>
                    </select>
                    <select
                        name="brand"
                        value={filters.brand}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    >
                        <option value="">All Brands</option>
                        {BRAND_OPTIONS.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <select
                        name="shoesType"
                        value={filters.shoesType}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    >
                        <option value="">All Types</option>
                        {SHOES_TYPE_OPTIONS.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="minPrice"
                        value={minPriceInput}
                        onChange={e => handlePriceInput(e, 'min')}
                        onBlur={() => handlePriceCommit('min')}
                        onKeyDown={e => handlePriceKeyDown(e, 'min')}
                        placeholder="Min price"
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        value={maxPriceInput}
                        onChange={e => handlePriceInput(e, 'max')}
                        onBlur={() => handlePriceCommit('max')}
                        onKeyDown={e => handlePriceKeyDown(e, 'max')}
                        placeholder="Max price"
                        className="p-2 border rounded"
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                    <div key={product.productID} className="border rounded-lg overflow-hidden shadow-lg">
                        <img 
                            src={product.image[0]} 
                            alt={product.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{product.productID}</h3>
                            <p className="text-gray-600 mb-2">Name: {product.name}</p>
                            <p className="text-gray-600 mb-2">Brand: {product.brand}</p>
                            <p className="text-gray-600 mb-2">Type: {product.shoesType}</p>
                            <p className="text-gray-600 mb-2">Gender: {product.gender}</p>
                            <p className="text-gray-600 mb-2">Price: RM{product.price}</p>
                            <p className="text-gray-600 mb-2">Quantity: {product.quantity}</p>
                            <p className="text-gray-600 mb-2">Sizes: {product.size.map(size => `UK ${size}`).join(', ')}</p>
                            <p className="text-gray-600 mb-2">Added by: {product.addedBy} ({product.addedByRole})</p>
                            <p className="text-gray-600 mb-2">Date Added: {formatDate(product.date)}</p>
                            {product.updatedBy && (
                              <p className="text-gray-600 mb-2">Updated by: {product.updatedBy} ({product.updatedByRole})</p>
                            )}
                            {product.updatedAt && (
                              <p className="text-gray-600 mb-2">Date Updated: {formatDate(product.updatedAt)}</p>
                            )}
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => navigate(`/edit/${product.productID}`)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.productID)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No products found
                </div>
            )}
        </div>
    )
}

export default List
