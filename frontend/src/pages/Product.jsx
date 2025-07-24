import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Product = () => {
  const { productId } = useParams();
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    console.log('Current productId:', productId);
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId || productId.trim() === '') {
      console.error('Invalid productId:', productId);
      toast.error('Invalid product ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/single/${productId}`);
      console.log('API Response:', response.data);

      const product = response.data.product;

      if (!product) {
        throw new Error('Product not found');
      }

      setProductData(product);
      if (product.image && product.image.length > 0) {
        setSelectedImage(product.image[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get(
                `${backendUrl}/api/product/recommendations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                setRecommendedProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    if (productData) {
        fetchRecommendations();
    }
}, [productData]);

  const decreaseQuantity = () => {
    if (quantity <= 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }
    setQuantity(qty => qty - 1);
  };

  const increaseQuantity = () => {
    if (productData.quantity <= quantity) {
      toast.error("Cannot exceed available stock");
      return;
    }
    setQuantity(qty => qty + 1);
  };

  const addToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const savedCart = localStorage.getItem('cart');
      let currentCart = savedCart ? JSON.parse(savedCart) : [];

      // Create cart item
      const cartItem = {
        productId: productData.productID,
        name: productData.name,
        description: productData.description, // add this line
        price: productData.price,
        image: productData.image,
        selectedSize: selectedSize,
        selectedQuantity: quantity,
        quantity: productData.quantity
      };

      // Check if item already exists in cart
      const existingItemIndex = currentCart.findIndex(
        item => item.productId === cartItem.productId && item.selectedSize === cartItem.selectedSize
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        currentCart[existingItemIndex].selectedQuantity += quantity;
      } else {
        // Add new item if it doesn't exist
        currentCart.push(cartItem);
      }

      // Save to local storage
      localStorage.setItem('cart', JSON.stringify(currentCart));

      // If logged in, update backend
      if (token) {
        const response = await axios.put(
          `${backendUrl}/api/user/cart`,
          { cartData: currentCart },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update cart');
        }
      }

      toast.success('Added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
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
      className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
    >
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Images */}
        <motion.div
          className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.7, type: 'spring' }}
        >
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((image, index) => (
              <img
                key={index}
                onClick={() => setSelectedImage(image)}
                src={image}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer transition-all duration-200 rounded-xl shadow-md ${selectedImage === image ? 'border-2 border-primary scale-105' : 'hover:scale-105'}`}
                alt={`Product view ${index + 1}`}
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <motion.img
              className='w-full h-auto object-cover rounded-3xl shadow-2xl border border-background-dark/10 bg-surface/80 backdrop-blur-lg'
              src={selectedImage}
              alt={productData.name}
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
        {/* Product Info */}
        <motion.div
          className='flex-1 bg-surface/90 rounded-3xl shadow-xl border border-background-dark/10 p-8 flex flex-col gap-4 backdrop-blur-lg'
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.7, type: 'spring' }}
        >
          <h1 className='text-3xl font-bold text-primary mb-2'>{productData.name}</h1>
          <div className="flex flex-wrap gap-3 mb-2">
            <span className="px-4 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[#4682A9] text-[#4682A9] font-semibold text-sm shadow">{productData.brand}</span>
            <span className="px-4 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[#4682A9] text-[#4682A9] font-semibold text-sm shadow">{productData.shoesType}</span>
          </div>
          <p className='text-muted mb-4'>{productData.description}</p>
          <p className='text-2xl font-bold text-primary mb-4'>RM{productData.price}</p>
          {/* Size Selection */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-muted">Size</label>
            <div className="flex flex-wrap gap-2">
              {productData.size.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4682A9] ${
                    selectedSize === size
                      ? 'bg-[#4682A9] text-white scale-105 shadow-lg'
                      : 'bg-surface text-[#4682A9] hover:bg-[#4682A9]/10 hover:text-[#4682A9]'
                  }`}
                >
                  UK {size}
                </button>
              ))}
            </div>
          </div>
          {/* Quantity Selection */}
          {productData.quantity > 0 && (
            <div className="mb-6">
              <label className="block mb-2 font-medium text-muted">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={decreaseQuantity}
                  className="px-3 py-1 bg-background-dark/10 hover:bg-primary/10 text-lg rounded-full disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-14 text-center border border-background-dark/10 rounded-lg bg-surface/80"
                />
                <button
                  onClick={increaseQuantity}
                  className="px-3 py-1 bg-background-dark/10 hover:bg-primary/10 text-lg rounded-full disabled:opacity-50"
                  disabled={quantity >= productData.quantity}
                >
                  +
                </button>
              </div>
              <p className="text-sm text-muted mt-1">
                {productData.quantity} item(s) available
              </p>
            </div>
          )}
          {/* Add to Cart Button */}
          <motion.button
            className='w-full sm:w-auto bg-[#4682A9] text-white px-8 py-3 text-lg font-bold hover:scale-105 hover:shadow-2xl active:scale-100 transition-all rounded-full shadow-lg mt-2'
            onClick={addToCart}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.98 }}
          >
            ADD TO CART
          </motion.button>
        </motion.div>
      </div>
      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, type: 'spring' }}
        >
          <h2 className="text-2xl font-bold text-primary mb-6">Recommended For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <motion.div
                key={product._id}
                className="bg-surface/90 border border-background-dark/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer group"
                whileHover={{ scale: 1.03, borderRadius: '2rem' }}
                onClick={() => navigate(`/product/${product.productID}`)}
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-primary line-clamp-1">{product.name}</h3>
                  <p className="text-primary font-bold">RM{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Product;