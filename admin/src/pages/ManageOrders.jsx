import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import{FaLocationArrow, FaPhone, FaEnvelope } from 'react-icons/fa';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const statusOptions = [
  'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'received'
];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [popupStatus, setPopupStatus] = useState('');
  const [popupUpdating, setPopupUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/order/all`);
      setOrders(res.data.orders || []);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderID, status) => {
    setUpdating(orderID);
    try {
      await axios.put(`${backendUrl}/api/order/status/${orderID}`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating('');
    }
  };

  // Popup status update
  const handlePopupStatusUpdate = async () => {
    if (!selectedOrder) return;
    setPopupUpdating(true);
    try {
      await axios.put(`${backendUrl}/api/order/status/${selectedOrder.orderID}`, { status: popupStatus });
      toast.success('Order status updated');
      fetchOrders();
      setSelectedOrder({ ...selectedOrder, status: popupStatus });
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setPopupUpdating(false);
    }
  };

  // Filter orders by user name, email, and status
  const filteredOrders = orders.filter(order => {
    const q = search.toLowerCase();
    const matchesSearch = order.name.toLowerCase().includes(q) || order.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 relative">
      <h1 className="text-3xl font-bold mb-8 text-[#181A20]">Manage Orders</h1>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by user name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg py-2 px-4 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-[#4682A9]"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg py-2 px-4 w-full md:w-60 focus:outline-none focus:ring-2 focus:ring-[#4682A9]"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          ))}
        </select>
        <button
          onClick={fetchOrders}
          className="bg-[#4682A9] text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-[#315d7c] transition-all"
        >
          Refresh
        </button>
      </div>
      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No orders found.</td></tr>
            ) : filteredOrders.map(order => (
              <tr key={order.orderID} className="hover:bg-gray-50 transition cursor-pointer">
                <td className="px-6 py-4 font-mono text-sm text-gray-700">{order.orderID}</td>
                <td className="px-6 py-4">
                  <span
                    className="text-[#4682A9] font-semibold hover:underline cursor-pointer"
                    onClick={() => { setSelectedOrder(order); setPopupStatus(order.status); }}
                  >
                    {order.name}<br /><span className="text-xs text-gray-500">{order.email}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    order.status === 'delivered' ? 'bg-green-200 text-green-900' :
                    'bg-gray-100 text-gray-700'
                  }`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </td>
                <td className="px-6 py-4 font-semibold">RM{order.totalPrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.date)}</td>
                <td className="px-6 py-4 text-right">
                  {/* Future: actions */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Popup Drawer */}
      {selectedOrder && (
        <div className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-white shadow-2xl border-l border-gray-200 z-50 transition-all duration-300 flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div>
              <div className="text-xs text-gray-400 font-mono mb-1">Order ID</div>
              <div className="text-lg font-bold text-[#181A20]">{selectedOrder.orderID}</div>
            </div>
            <button
              className="text-gray-400 hover:text-[#4682A9] text-2xl font-bold"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto text-lg">
            <div className="mb-6">
              <div className="font-semibold text-gray-700 mb-1 text-xl">Customer Details</div>
              <div className="text-2xl font-bold text-[#4682A9] mb-2">Name: {selectedOrder.name}</div>
              <div className="flex items-center gap-2 text-lg text-gray-500 mb-1"><FaEnvelope className="text-[#4682A9]" /><span>{selectedOrder.email}</span></div>
              <div className="flex items-center gap-2 text-lg text-gray-500 mb-1"><FaPhone className="text-[#4682A9]" /><span>{selectedOrder.phoneNum}</span></div>
              <div className="flex items-center gap-2 text-lg text-gray-500"><FaLocationArrow className="text-[#4682A9]" /><span>{selectedOrder.address}</span></div>
            </div>
            <div className="mb-6">
              <div className="font-semibold text-gray-700 mb-2 text-xl">Order Items</div>
              <ul className="space-y-3">
                {selectedOrder.products.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <img src={item.image[0]} alt={item.name} className="w-14 h-14 object-cover rounded-lg border" />
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">{item.name}</div>
                      <div className="text-base text-gray-500">x{item.quantity} • RM{item.price} each</div>
                      <div className="text-base text-gray-400">Subprice: RM{item.subprice.toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <div className="font-semibold text-gray-700 mb-1 text-xl">Order Total</div>
              <div className="text-2xl font-bold text-[#181A20]">RM{selectedOrder.totalPrice.toFixed(2)}</div>
            </div>
            <div className="mb-6">
              <div className="font-semibold text-gray-700 mb-2 text-xl">Order Status</div>
              <select
                value={popupStatus}
                onChange={e => setPopupStatus(e.target.value)}
                className="border border-gray-300 rounded-lg py-3 px-4 w-full text-lg focus:outline-none focus:ring-2 focus:ring-[#4682A9]"
                disabled={popupUpdating || ['delivered', 'cancelled', 'received'].includes(selectedOrder.status)}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
              </select>
              <button
                onClick={handlePopupStatusUpdate}
                disabled={popupUpdating || popupStatus === selectedOrder.status || ['delivered', 'cancelled', 'received'].includes(selectedOrder.status)}
                className={`mt-4 w-full bg-[#4682A9] text-white font-bold py-3 rounded-lg shadow hover:bg-[#315d7c] transition-all text-lg ${popupUpdating || popupStatus === selectedOrder.status || ['delivered', 'cancelled', 'received'].includes(selectedOrder.status) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {popupUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
