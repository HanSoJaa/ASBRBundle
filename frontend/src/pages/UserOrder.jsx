import React, { useEffect, useState } from 'react';
import { getUserOrders, updateOrderStatus, updateOrderDetails } from '../services/orderService';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const SIDEBAR_OPTIONS = [
  { key: 'progress', label: 'Order Progress' },
  { key: 'history', label: 'Order History' },
];

const PROGRESS_STATUSES = [
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];
const STATUS_PROGRESS = ['pending','processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_HISTORY = ['received', 'cancelled'];

const UserOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('progress');
  const [selectedProgressStatus, setSelectedProgressStatus] = useState('all');
  const [editOrderId, setEditOrderId] = useState(null);
  const [editFields, setEditFields] = useState({ name: '', phoneNum: '', address: '' });
  const [updating, setUpdating] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.userID) return;
      try {
        const res = await getUserOrders(user.userID);
        setOrders(res.data.orders || []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleEditClick = (order) => {
    setEditOrderId(order.orderID);
    setEditFields({ name: order.name, phoneNum: order.phoneNum, address: order.address });
  };

  const handleEditChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (orderID) => {
    setUpdating(true);
    try {
      await updateOrderDetails(orderID, editFields);
      setOrders((prev) => prev.map(order => order.orderID === orderID ? { ...order, ...editFields } : order));
      toast.success('Order details updated!');
    } catch (err) {
      toast.error('Failed to update order details.');
    }
    setEditOrderId(null);
    setUpdating(false);
  };

  const handleOrderReceived = async (orderID) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderID, 'received');
      setOrders((prev) => prev.map(order => order.orderID === orderID ? { ...order, status: 'received' } : order));
    } catch (err) {
      // handle error
    }
    setUpdating(false);
  };

  // Count orders by status for notification badges
  const progressCounts = PROGRESS_STATUSES.reduce((acc, s) => {
    acc[s.key] = orders.filter(order => order.status === s.key).length;
    return acc;
  }, {});

  // Filter orders based on selected tab and progress status
  let filteredOrders = orders;
  if (selectedTab === 'progress') {
    filteredOrders = orders.filter(order => STATUS_PROGRESS.includes(order.status));
    if (selectedProgressStatus !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === selectedProgressStatus);
    }
  } else {
    filteredOrders = orders.filter(order => STATUS_HISTORY.includes(order.status));
    // Date range filter for history
    if (dateRange.start) {
      filteredOrders = filteredOrders.filter(order => new Date(order.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      // Add 1 day to end date to include the whole day
      const endDate = new Date(dateRange.end);
      endDate.setDate(endDate.getDate() + 1);
      filteredOrders = filteredOrders.filter(order => new Date(order.date) < endDate);
    }
  }

  if (loading) return <div className="p-10 text-center text-primary">Loading...</div>;

  return (
    <motion.div
      className="flex max-w-6xl mx-auto py-10 px-4 gap-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
    >
      {/* Sidebar */}
      <motion.aside
        className="w-56 min-w-[180px] border-r border-background-dark/10 pr-6 bg-surface/80 rounded-3xl shadow-xl backdrop-blur-lg flex flex-col gap-2 py-6"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.7, type: 'spring' }}
      >
        <nav className="flex flex-col gap-2">
          {SIDEBAR_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`text-left px-4 py-2 rounded-lg font-bold transition-all text-[#4682A9]/80 hover:bg-[#4682A9]/10 hover:text-[#4682A9] ${selectedTab === opt.key ? 'bg-white text-black shadow border border-black' : ''}`}
              onClick={() => {
                setSelectedTab(opt.key);
                setSelectedProgressStatus('all');
              }}
            >
              {opt.label}
            </button>
          ))}
          {/* Sub-menu for Order Progress */}
          {selectedTab === 'progress' && (
            <div className="ml-2 mt-2 flex flex-col gap-1">
              <button
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-left text-sm font-medium transition-all text-[#4682A9]/80 hover:bg-[#4682A9]/10 hover:text-[#4682A9] ${selectedProgressStatus === 'all' ? 'bg-[#4682A9]/10 text-[#4682A9] font-bold' : ''}`}
                onClick={() => setSelectedProgressStatus('all')}
              >
                All
              </button>
              {PROGRESS_STATUSES.map(s => (
                <button
                  key={s.key}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-left text-sm font-medium transition-all text-[#4682A9]/80 hover:bg-[#4682A9]/10 hover:text-[#4682A9] ${selectedProgressStatus === s.key ? 'bg-[#4682A9]/10 text-[#4682A9] font-bold' : ''}`}
                  onClick={() => setSelectedProgressStatus(s.key)}
                >
                  {s.label}
                  {progressCounts[s.key] > 0 && (
                    <span className="ml-auto min-w-[22px] h-[22px] text-xs bg-[#EF4444] text-white rounded-full px-2 py-0.5 text-center flex items-center justify-center">
                      {progressCounts[s.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </nav>
      </motion.aside>
      {/* Main Content */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold text-primary mb-6">
          {selectedTab === 'progress'
            ? (selectedProgressStatus === 'all' ? 'Order Progress' : PROGRESS_STATUSES.find(s => s.key === selectedProgressStatus)?.label + ' Orders')
            : 'Order History'}
        </h1>
        {/* Date range filter for Order History only */}
        {selectedTab === 'history' && (
          <div className="flex gap-4 mb-4 items-center">
            <label className="font-medium">Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-background-dark/10 rounded-lg px-2 py-1 bg-surface/80"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-background-dark/10 rounded-lg px-2 py-1 bg-surface/80"
            />
          </div>
        )}
        {filteredOrders.length === 0 ? (
          <div className="text-muted">No orders found.</div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <motion.div
                key={order.orderID}
                className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                  <div className="font-mono text-base text-[#4682A9]">Order ID: <span className="font-bold">{order.orderID}</span></div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'processing' ? 'bg-blue-100 text-blue-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : order.status === 'delivered' ? 'bg-green-200 text-green-900' : 'bg-gray-100 text-gray-700'}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</div>
                </div>
                {/* Editable fields for pending orders */}
                {order.status === 'pending' && editOrderId === order.orderID ? (
                  <div className="mb-2 space-y-1">
                    <div className="flex items-center gap-2 text-lg text-gray-500 mb-1"><span className="font-bold text-[#4682A9]">Name:</span><input name="name" value={editFields.name} onChange={handleEditChange} className="border border-background-dark/10 rounded-lg px-2 py-1 bg-white/20 text-black" /></div>
                    <div className="flex items-center gap-2 text-lg text-gray-500 mb-1"><span className="font-bold text-[#4682A9]">Phone:</span><input name="phoneNum" value={editFields.phoneNum} onChange={handleEditChange} className="border border-background-dark/10 rounded-lg px-2 py-1 bg-white/20 text-black" /></div>
                    <div className="flex items-center gap-2 text-lg text-gray-500"><span className="font-bold text-[#4682A9]">Address:</span><input name="address" value={editFields.address} onChange={handleEditChange} className="border border-background-dark/10 rounded-lg px-2 py-1 bg-white/20 text-black w-2/3" /></div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleEditSave(order.orderID)} className="px-3 py-1 bg-[#4682A9] text-white rounded-full font-bold" disabled={updating}>Save</button>
                      <button onClick={() => setEditOrderId(null)} className="px-3 py-1 bg-gray-300 rounded-full font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-lg text-gray-700 mb-1"><span className="font-bold text-[#4682A9]">Name:</span><span>{order.name}</span></div>
                    <div className="flex items-center gap-2 text-lg text-gray-700 mb-1"><span className="font-bold text-[#4682A9]">Phone:</span><span>{order.phoneNum}</span></div>
                    <div className="flex items-center gap-2 text-lg text-gray-700"><span className="font-bold text-[#4682A9]">Address:</span><span>{order.address}</span></div>
                    {order.status === 'pending' && (
                      <button onClick={() => handleEditClick(order)} className="ml-2 px-2 py-1 text-xs bg-[#4682A9] text-white rounded-full font-bold">Edit</button>
                    )}
                  </div>
                )}
                <div className="mb-4">
                  <b className="text-[#4682A9]">Products:</b>
                  <ul className="ml-4 mt-2 space-y-2">
                    {order.products.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <img src={item.image[0]} alt={item.name} className="w-12 h-12 object-cover rounded-lg border" />
                        <div>
                          <div className="font-semibold text-gray-800 text-base">{item.name} <span className="text-gray-500">(x{item.quantity})</span></div>
                          <div className="text-sm text-gray-500">RM{item.price} each</div>
                          <div className="text-sm text-gray-400">Subprice: RM{item.subprice.toFixed(2)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 font-extrabold text-xl text-[#4682A9]">Total: RM{order.totalPrice.toFixed(2)}</div>
                {/* Order Received button for delivered orders */}
                {order.status === 'delivered' && (
                  <button
                    onClick={() => handleOrderReceived(order.orderID)}
                    className="mt-4 w-full rounded-full bg-[#4682A9] text-white font-extrabold text-lg py-3 shadow-lg transition-all duration-200 hover:bg-[#35607a] hover:scale-105"
                    disabled={updating}
                  >
                    Order Received
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default UserOrder; 