import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { backendUrl } from '../App';
import { motion } from 'framer-motion';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize cart from local storage or backend
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Check local storage first
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
            setLoading(false);
            return;
          }
        }

        // Try backend if logged in
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${backendUrl}/api/user/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success && Array.isArray(response.data.cart)) {
            setCartItems(response.data.cart);
            localStorage.setItem('cart', JSON.stringify(response.data.cart));
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeCart();

    // Listen for cart changes in localStorage
    const handleStorage = (e) => {
      if (e.key === 'cart') {
        const newCart = e.newValue ? JSON.parse(e.newValue) : [];
        setCartItems(Array.isArray(newCart) ? newCart : []);
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  // Force cartItems update when page becomes visible
  useEffect(() => {
    const updateCartFromLocalStorage = () => {
      const savedCart = localStorage.getItem('cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
    };
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updateCartFromLocalStorage();
      }
    });
    
    return () => {
      document.removeEventListener('visibilitychange', updateCartFromLocalStorage);
    };
  }, []);

  // Save cart to backend and local storage
  const saveCart = async (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCartItems(newCart);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.put(
          `${backendUrl}/api/user/cart`,
          { cartData: newCart },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        // Silently fail - cart is still saved locally
      }
    }
  };

  const removeFromCart = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    saveCart(newCart);
    toast.success('Item removed from cart');
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const item = cartItems[index];
    if (newQuantity > item.quantity) {
      toast.error(`Cannot exceed available stock. Only ${item.quantity} items available.`);
      return;
    }
    
    const newCart = [...cartItems];
    newCart[index].selectedQuantity = newQuantity;
    saveCart(newCart);
  };

  const calculateSubTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.selectedQuantity), 0);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.selectedQuantity), 0);
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/place-order');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-primary mb-4">Your cart is empty</h2>
        <motion.button
          onClick={() => navigate('/collection')}
          className="bg-[#4682A9] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue Shopping
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
    >
      <h1 className="text-4xl font-bold text-primary mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {cartItems.map((item, index) => (
            <motion.div
              key={index}
              className="flex gap-4 bg-surface/90 border border-background-dark/10 rounded-3xl shadow-xl p-6 items-center group hover:shadow-2xl transition-shadow duration-300"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.6, type: 'spring' }}
            >
              {/* Product Image */}
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={item.image[0]}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl shadow-md"
                />
              </div>
              {/* Product Details */}
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-primary mb-1">{item.name}</h3>
                <p className="text-muted">Size: UK {item.selectedSize}</p>
                <p className="text-muted">Price: RM{item.price}</p>
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(index, item.selectedQuantity - 1)}
                    className="px-3 py-1 bg-background-dark/10 hover:bg-primary/10 text-lg rounded-full disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg">{item.selectedQuantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.selectedQuantity + 1)}
                    disabled={item.selectedQuantity >= item.quantity}
                    className={`px-3 py-1 rounded-full text-lg ${
                      item.selectedQuantity >= item.quantity 
                        ? 'bg-background-dark/10 text-muted cursor-not-allowed' 
                        : 'bg-background-dark/10 hover:bg-primary/10'
                    }`}
                  >
                    +
                  </button>
                  <span className="text-sm text-muted">({item.quantity} available)</span>
                </div>
              </div>
              {/* Remove Button */}
              <motion.button
                onClick={() => removeFromCart(index)}
                className="text-danger hover:text-white hover:bg-danger px-4 py-2 border border-danger rounded-full font-bold ml-4 transition-colors duration-200"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                Remove
              </motion.button>
            </motion.div>
          ))}
        </div>
        {/* Order Summary */}
        <motion.div
          className="lg:col-span-1 bg-surface/90 border border-background-dark/10 rounded-3xl shadow-xl p-8 h-fit flex flex-col gap-4 backdrop-blur-lg"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
        >
          <h2 className="text-2xl font-bold text-primary mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>RM{calculateSubTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>RM 10</span>
              </div>
            <hr className="my-4 border-background-dark/10" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>RM{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          <motion.button
              onClick={handleCheckout}
            className="w-full bg-[#4682A9] text-white py-3 rounded-full font-bold mt-6 shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            >
              Proceed to Checkout
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Cart;