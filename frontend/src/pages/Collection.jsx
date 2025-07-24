// Collection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import puma from '../assets/cat.png';
import adidas from '../assets/adidas.png';
import asics from '../assets/asss.png';
import nb from '../assets/nb.png';

const Collection = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        gender: [],
        brand: [],
        shoesType: [],
        minPrice: '',
        maxPrice: ''
    });
    const [sortBy, setSortBy] = useState('newest');
    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => v && queryParams.append(key, v));
                } else if (value) {
                    queryParams.append(key, value);
                }
            });
            const response = await axios.get(`${backendUrl}/api/product/list?${queryParams.toString()}`);
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    useEffect(() => {
        setMinPriceInput(filters.minPrice);
        setMaxPriceInput(filters.maxPrice);
    }, [filters.minPrice, filters.maxPrice]);

    const handleFilterChange = (e) => {
        const { name, value, shoesType, checked } = e.target;
        if (["gender", "brand", "shoesType"].includes(name)) {
            setFilters(prev => {
                const arr = prev[name] || [];
                if (checked) {
                    return { ...prev, [name]: [...arr, value] };
                } else {
                    return { ...prev, [name]: arr.filter(v => v !== value) };
                }
            });
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSort = (e) => {
        setSortBy(e.target.value);
    };

    const handleMinPriceInput = (e) => {
        setMinPriceInput(e.target.value);
    };

    const handleMaxPriceInput = (e) => {
        setMaxPriceInput(e.target.value);
    };

    const commitMinPrice = () => {
        setFilters(prev => ({ ...prev, minPrice: minPriceInput }));
    };

    const commitMaxPrice = () => {
        setFilters(prev => ({ ...prev, maxPrice: maxPriceInput }));
    };

    const handleMinPriceKeyDown = (e) => {
        if (e.key === 'Enter') commitMinPrice();
    };

    const handleMaxPriceKeyDown = (e) => {
        if (e.key === 'Enter') commitMaxPrice();
    };

    const filteredAndSortedProducts = products
        .filter(product => {
            const genderMatch = filters.gender.length === 0 || filters.gender.includes(product.gender);
            const brandMatch = filters.brand.length === 0 || filters.brand.includes(product.brand);
            const typeMatch = filters.shoesType.length === 0 || filters.shoesType.includes(product.shoesType);
            const minPriceMatch = !filters.minPrice || product.price >= Number(filters.minPrice);
            const maxPriceMatch = !filters.maxPrice || product.price <= Number(filters.maxPrice);
            const searchMatch =
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.shoesType.toLowerCase().includes(searchTerm.toLowerCase());
            return genderMatch && brandMatch && typeMatch && minPriceMatch && maxPriceMatch && searchMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low-high':
                    return a.price - b.price;
                case 'price-high-low':
                    return b.price - a.price;
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                default:
                    return 0;
            }
        });

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="p-4 flex flex-col md:flex-row gap-6 bg-[#E7FFF4] min-h-screen">
            {/* Left Side Filters */}
            <aside className="w-full md:w-64 mb-6 md:mb-0 bg-white border rounded-lg p-4 h-fit">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                {/* Gender Filter */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Gender</h3>
                    <div className="flex flex-col gap-2">
                        {['men', 'women', 'unisex'].map(option => (
                            <label key={option} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="gender"
                                    value={option}
                                    checked={filters.gender.includes(option)}
                                    onChange={handleFilterChange}
                                    className="form-checkbox text-blue-600"
                                />
                                <span className="ml-2 capitalize">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Brand Filter */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Brand</h3>
                    <div className="flex flex-col gap-2">
                        {["Adidas", "Nike", "New Balance", "Puma", "Asics"].map(option => (
                            <label key={option} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="brand"
                                    value={option}
                                    checked={filters.brand.includes(option)}
                                    onChange={handleFilterChange}
                                    className="form-checkbox text-blue-600"
                                />
                                <span className="ml-2">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Shoe Type Filter */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Shoe Type</h3>
                    <div className="flex flex-col gap-2">
                        {["Running", "Lifestyle", "Football", "Badminton"].map(option => (
                            <label key={option} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="shoesType"
                                    value={option}
                                    checked={filters.shoesType.includes(option)}
                                    onChange={handleFilterChange}
                                    className="form-checkbox text-blue-600"
                                />
                                <span className="ml-2 capitalize">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Price Filter */}
                <div className="mb-6">
                    <h3 className="font-medium mb-2">Price</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="minPrice"
                            value={minPriceInput}
                            onChange={handleMinPriceInput}
                            onBlur={commitMinPrice}
                            onKeyDown={handleMinPriceKeyDown}
                            placeholder="Min"
                            className="p-2 border rounded w-1/2"
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            value={maxPriceInput}
                            onChange={handleMaxPriceInput}
                            onBlur={commitMaxPrice}
                            onKeyDown={handleMaxPriceKeyDown}
                            placeholder="Max"
                            className="p-2 border rounded w-1/2"
                        />
                    </div>
                </div>
            </aside>

            {/* Right Side: Search, Sort, Products */}
            <div className="flex-1">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">Product Catalog</h1>
                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search products..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    {/* Sort */}
                    <div className="mb-4 flex justify-end">
                        <select
                            value={sortBy}
                            onChange={handleSort}
                            className="p-2 border rounded w-48"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low-high">Price: Low to High</option>
                            <option value="price-high-low">Price: High to Low</option>
                        </select>
                    </div>
                </div>
                
                {/* 3D Isometric Grid Products */}
                <div className="isometric-container">
                    <style jsx>{`
                        :root {
                            --columns: 3;
                        }
                        
                        .isometric-grid {
                            display: grid;
                            grid-template-columns: repeat(var(--columns), 1fr);
                            background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 600 1040' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd' stroke-linejoin='round' stroke-miterlimit='2'%3E%3Cpath d='M0 0l300 173.205v346.41L0 346.41V0z' fill='url(%23_Linear1)'/%3E%3Cpath d='M300 519.615L600 692.82v346.411L300 866.025v-346.41z' fill='url(%23_Linear2)'/%3E%3Cpath d='M600 0L300 173.205v346.41L600 346.41V0z' fill='url(%23_Linear3)'/%3E%3Cpath d='M300 519.615L0 692.82v346.411l300-173.206v-346.41z' fill='url(%23_Linear4)'/%3E%3Cdefs%3E%3ClinearGradient id='_Linear1' x1='0' y1='0' x2='1' y2='0' gradientUnits='userSpaceOnUse' gradientTransform='rotate(-30 646.41 173.205) scale(346.41)'%3E%3Cstop offset='0' stop-color='%23b7ccc3'/%3E%3Cstop offset='1' stop-color='%23cde2d9'/%3E%3C/linearGradient%3E%3ClinearGradient id='_Linear2' x1='0' y1='0' x2='1' y2='0' gradientUnits='userSpaceOnUse' gradientTransform='rotate(-30 1766.025 -126.796) scale(346.41)'%3E%3Cstop offset='0' stop-color='%23b7ccc3'/%3E%3Cstop offset='1' stop-color='%23cde2d9'/%3E%3C/linearGradient%3E%3ClinearGradient id='_Linear3' x1='0' y1='0' x2='1' y2='0' gradientUnits='userSpaceOnUse' gradientTransform='rotate(-150 346.41 92.82) scale(346.41)'%3E%3Cstop offset='0' stop-color='%23e8dad1'/%3E%3Cstop offset='1' stop-color='%23fff0e7'/%3E%3C/linearGradient%3E%3ClinearGradient id='_Linear4' x1='0' y1='0' x2='1' y2='0' gradientUnits='userSpaceOnUse' gradientTransform='rotate(-150 266.025 392.82) scale(346.41)'%3E%3Cstop offset='0' stop-color='%23e8dad1'/%3E%3Cstop offset='1' stop-color='%23fff0e7'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
                            background-size: calc(200%/(var(--columns)));
                            margin: 50px 0;
                        }
                        
                        .isometric-grid li {
                            grid-column-end: span 2;
                            position: relative;
                            padding-bottom: 86.66%;
                            list-style: none;
                        }
                        
                        .isometric-grid li:nth-child(2n-1) {
                            grid-column-start: 2;
                        }
                        
                        .isometric-grid li:before {
                            content: "";
                            position: absolute;
                            right: 0;
                            width: 50%;
                            height: 100%;
                            opacity: 0.6;
                            transform: skewy(30deg);
                            background-size: 40%;
                            background-repeat: no-repeat;
                            background-position: 90% 27%;
                        }
                        
                        .isometric-grid li.puma:before,
                        .isometric-grid li.adidas:before,
                        .isometric-grid li.nb:before,
                         .isometric-grid li.asics:before,{
                            background-image: var(--brand-logo);
                            background-size: 60%;
                        }
                        
                        .nike:before {
                            background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png');
                            background-size: 60%;
                        }
                        
                        .newbalance:before, .new-balance:before {
                            background-image: var(--brand-logo);
                            background-size: 60%;
                        }
                        
                        .puma:before {
                            background-image: var(--brand-logo);
                            background-size: 60%;
                        }
                        
                        .asics:before {
                            background-image: var(--brand-logo);
                            background-size: 60%;
                        }
                        
                        .adidas:before {
                            background-image: var(--brand-logo);
                            background-size: 60%;
                        }
                        
                        .isometric-grid .front-info {
                            position: absolute;
                            width: 50%;
                            font-size: calc(10vw/var(--columns));
                            transform: skewy(-30deg);
                            margin-top: 14%;
                            padding: 3%;
                            z-index: 2;
                            display: flex;
                            flex-direction: column;
                            gap: 0.2rem;
                        }
                        
                        .isometric-grid .front-info h2 {
                            font-size: 0.9em;
                            font-weight: 700;
                            color: #5A626F;
                            line-height: 1.1;
                            max-width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        .isometric-grid .front-info p {
                            font-size: 0.8em;
                            color: #5A626F;
                        }
                        
                        .isometric-grid .back-info {
                            position: absolute;
                            left: 50%;
                            width: 50%;
                            height: 100%;
                            transform: skewy(30deg);
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-end;
                            padding: 10%;
                            z-index: 2;
                        }
                        
                        .isometric-grid .back-info p {
                            font-size: 0.8em;
                            color: #5A626F;
                            text-align: right;
                            margin: 0.2rem 0;
                            line-height: 1.1;
                        }
                        
                        .isometric-grid img {
                            position: absolute;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 80%;
                            max-height: 60%;
                            bottom: -10%;
                            transition: all 0.3s ease;
                            z-index: 1;
                            object-fit: contain;
                            background: transparent;
                        }
                        
                        .isometric-grid li:hover img {
                            bottom: 0;
                        }
                        
                        .sold-out {
                            position: absolute;
                            inset: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(0,0,0,0.5);
                            z-index: 3;
                            border-radius: 4px;
                        }
                        
                        .sold-out span {
                            color: white;
                            font-weight: bold;
                            font-size: 1.2em;
                            transform: skewy(-30deg);
                            text-align: center;
                            padding: 4px;
                        }
                        
                        .sold-out-glass {
                            position: absolute;
                            inset: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 3;
                            border-radius: 12px;
                            pointer-events: none;
                            animation: fadeIn 0.5s cubic-bezier(0.4,0,0.2,1);
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: scale(0.95); }
                            to { opacity: 1; transform: scale(1); }
                        }
                        
                        @media (min-width:600px){
                            :root {
                                --columns: 5;
                            }
                            .isometric-grid li:nth-child(2n-1){
                                grid-column-start:auto;
                            }
                            .isometric-grid li:nth-child(4n-3){
                                grid-column-start:2;
                            }
                        }
                        @media (min-width:900px){
                            :root {
                                --columns: 7;
                            }
                            .isometric-grid li:nth-child(4n-3){
                                grid-column-start:auto;
                            }
                            .isometric-grid li:nth-child(6n-5){
                                grid-column-start:2;
                            }
                        }
                        @media (min-width:1200px){
                            :root {
                                --columns: 9;
                            }
                            .isometric-grid li:nth-child(6n-5){
                                grid-column-start:auto;
                            }
                            .isometric-grid li:nth-child(8n-7){
                                grid-column-start:2;
                            }
                        }
                        @media (min-width:1500px){
                            :root {
                                --columns: 11;
                            font-size: 12px;
                            }
                            .isometric-grid li:nth-child(8n-7){
                                grid-column-start:auto;
                            }
                            .isometric-grid li:nth-child(10n-9){
                                grid-column-start:2;
                            }
                        }
                    `}</style>
                    
                    <ul className="isometric-grid">
                    {filteredAndSortedProducts.map((product) => {
                        const isSoldOut = product.quantity === 0;
                            const brandClass = product.brand.toLowerCase().replace(/\s+/g, '');
                            const sizes = product.size.map(size => `UK ${size}`).join(', ');

                            // Inline style for Puma, Asics, nb and Adidas brand
                            let liStyle = {};
                            if (product.brand === 'Puma') {
                                liStyle = { '--brand-logo': `url(${puma})` };
                            } else if (product.brand === 'Adidas') {
                                liStyle = { '--brand-logo': `url(${adidas})` };
                            }else if (product.brand === 'Asics') {
                                liStyle = { '--brand-logo': `url(${asics})` };
                            }else if (product.brand === 'New Balance') {
                                liStyle = { '--brand-logo': `url(${nb})` };
                            }
                        return (
                                <li
                                key={product.productID} 
                                    className={brandClass}
                                    style={liStyle}
                                    onClick={() => !isSoldOut && navigate(`/product/${product.productID}`)}
                                >
                                    <div className="front-info">
                                        <h2>{product.name}</h2>
                                        <p>RM{product.price}</p>
                                        <p>{sizes}</p>
                                    </div>
                                    

                                    
                                    <img 
                                        src={product.image[0]} 
                                        alt={product.name}
                                        className={isSoldOut ? 'opacity-50' : 'cursor-pointer'}
                                    />
                                    
                                    {isSoldOut && (
                                        <div className="sold-out-glass flex flex-col items-center justify-center">
                                            <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md border-2 border-[#EF4444] text-[#EF4444] font-extrabold uppercase shadow-lg text-base animate-fadeIn">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" fill="none"/><line x1="8" y1="8" x2="16" y2="16" stroke="#EF4444" strokeWidth="2"/><line x1="16" y1="8" x2="8" y2="16" stroke="#EF4444" strokeWidth="2"/></svg>
                                                SOLD OUT
                                            </span>
                                        </div>
                                    )}
                                </li>
                        );
                    })}
                    </ul>
                </div>
                
                {filteredAndSortedProducts.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        No products found matching your criteria
                    </div>
                )}
            </div>
        </div>
    );
};

export default Collection;