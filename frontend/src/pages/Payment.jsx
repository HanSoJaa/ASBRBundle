import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { placeOrder } from '../services/orderService';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import axios from 'axios';
import { motion } from 'framer-motion';

const stripePromise = loadStripe('pk_test_51RbKt0CTDQQZPW87wwi1RnR3XPJZIqdDr4nslKMehCwLJoGdBdR70yOsdqNHaUXX2RTxI8ujRayPLqIiDeaOopd800ThbGIQsG');

const PaymentForm = ({ userInfo, setUserInfo, cartItems, calculateTotal, setCartItems }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  useEffect(() => {
    // Create PaymentIntent on mount
    const fetchClientSecret = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/order/payment/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Math.round(calculateTotal() * 100), currency: 'MYR' })
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment.');
      }
    };
    fetchClientSecret();
  }, [calculateTotal]);

  const handleInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }
    try {
      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userInfo.name,
            email: userInfo.email,
          },
        },
      });
      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }
      if (paymentIntent.status === 'succeeded') {
        // Place order
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const orderData = {
          userID: user.userID,
          name: userInfo.name,
          email: userInfo.email,
          phoneNum: userInfo.phoneNum,
          address: userInfo.address,
          products: cartItems.map(item => ({
            productID: item.productId,
            image: item.image,
            name: item.name,
            description: item.description, // add this line
            price: item.price,
            quantity: item.selectedQuantity,
            selectedSize: item.selectedSize, // add this line
            subprice: item.price * item.selectedQuantity
          })),
          totalPrice: calculateTotal(),
          payment: 'stripe',
          status: "processing"
        };
        const res = await placeOrder(orderData);
        if (res.data.success) {
          // Clear cart in all locations
          localStorage.removeItem('cart');
          setCartItems && setCartItems([]);
          
          // Clear backend cart
          const token = localStorage.getItem('token');
          if (token) {
            try {
              await axios.put(
                `${backendUrl}/api/user/cart`,
                { cartData: [] },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (error) {
              console.error("Failed to clear backend cart", error);
            }
          }
          
          // Trigger storage event to update other tabs
          window.dispatchEvent(new Event('storage'));
          
          setShowSuccessPopup(true);
        } else {
          setError(res.data.message || 'Order failed');
        }
      }
    } catch (err) {
      setError('Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="max-w-lg mx-auto bg-surface/90 border border-background-dark/10 rounded-3xl shadow-2xl p-10 flex flex-col gap-6 backdrop-blur-lg mt-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-bold text-primary mb-4">Shipping & Payment</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Name</label>
          <input type="text" name="name" value={userInfo.name} onChange={handleInputChange} className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Email</label>
          <input type="email" name="email" value={userInfo.email} onChange={handleInputChange} className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Phone Number</label>
          <input type="text" name="phoneNum" value={userInfo.phoneNum} onChange={handleInputChange} className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Address</label>
          <textarea name="address" value={userInfo.address} onChange={handleInputChange} className="block w-full px-4 py-3 border border-background-dark/10 rounded-xl bg-surface/80 placeholder-muted text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Card Details</label>
          <div className="border border-background-dark/10 rounded-xl p-3 bg-surface/80">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </div>
        {error && <div className="text-danger mb-2">{error}</div>}
        <motion.button
          type="submit"
          className="w-full bg-[#4682A9] text-white py-3 rounded-full font-bold mt-2 shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
          disabled={loading || !stripe || !clientSecret}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Processing...' : 'Pay with Card'}
        </motion.button>
        <div className="text-xs text-muted mt-2">Use test card: 4242 4242 4242 4242, 12/27, 567</div>
      </div>
      {showSuccessPopup && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-surface/90 p-8 rounded-3xl shadow-2xl text-center border border-background-dark/10"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <h2 className="text-2xl font-bold text-success mb-4">Payment Successful</h2>
            <motion.button
              className="bg-[#4682A9] text-white px-8 py-3 rounded-full font-bold mt-4 shadow-lg hover:scale-105 hover:shadow-2xl transition-all"
              onClick={() => {
                setShowSuccessPopup(false);
                navigate('/UserOrders');
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              OK
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.form>
  );
};

const Payment = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phoneNum: '',
    address: ''
  });
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Prefill user info if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo({
      name: user.name || '',
      email: user.email || '',
      phoneNum: user.phoneNum || '',
      address: user.address || ''
    });
    // Get cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.selectedQuantity), 0) + 10;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-dark via-primary-dark to-secondary-light">
    <Elements stripe={stripePromise}>
        <div className="w-full max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <PaymentForm 
          userInfo={userInfo} 
          setUserInfo={setUserInfo} 
          cartItems={cartItems} 
          calculateTotal={calculateTotal} 
          setCartItems={setCartItems} 
        />
          <motion.div
            className="bg-surface/90 border border-background-dark/10 rounded-3xl shadow-2xl p-8 flex flex-col gap-4 backdrop-blur-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-primary mb-4">Order Summary</h2>
            {cartItems.length === 0 ? (
              <div className="text-muted">Your cart is empty.</div>
            ) : (
              <div className="flex flex-col gap-4">
          {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 border-b border-background-dark/10 pb-3">
                    <img src={item.image[0]} alt={item.name} className="w-16 h-16 object-cover rounded-xl shadow" />
              <div className="flex-1">
                      <div className="font-semibold text-primary truncate">{item.name}</div>
                      <div className="text-muted text-sm">Size: UK {item.selectedSize}</div>
                      <div className="text-muted text-sm">RM{item.price} x {item.selectedQuantity}</div>
                      <div className="text-muted text-xs">Subprice: RM{(item.price * item.selectedQuantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
                <div className="flex justify-between mt-2 font-semibold">
            <span>Shipping Cost</span>
            <span>RM10</span>
          </div>
                <div className="flex justify-between mt-2 text-lg font-bold">
            <span>Total</span>
            <span>RM{calculateTotal().toFixed(2)}</span>
          </div>
        </div>
            )}
          </motion.div>
      </div>
    </Elements>
    </div>
  );
};

export default Payment;