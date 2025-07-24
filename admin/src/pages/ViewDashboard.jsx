import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Helper functions for date ranges
const todayStr = () => new Date().toISOString().slice(0, 10);
const weekAgoStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
};
const monthAgoStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ViewDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalOrders: 0,
    salesPerf: [],
    ordersPerf: [],
    brands: [],
    statusDistribution: [],
    paymentMethods: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week');
  const [brandsLimit, setBrandsLimit] = useState(5);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Calculate date ranges based on time filter
        let startDate, endDate = todayStr();
        switch(timeFilter) {
          case 'today':
            startDate = todayStr();
            break;
          case 'week':
            startDate = weekAgoStr();
            break;
          case 'month':
            startDate = monthAgoStr();
            break;
          default:
            startDate = weekAgoStr();
        }

        // Fetch all dashboard data
        const responses = await Promise.all([
          axios.get(`${backendUrl}/api/dashboard/summary/today`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${backendUrl}/api/dashboard/sales/performance`, {
            params: { start: startDate, end: endDate },
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${backendUrl}/api/dashboard/orders/performance`, {
            params: { start: startDate, end: endDate },
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${backendUrl}/api/dashboard/brands/top`, {
            params: { start: startDate, end: endDate, limit: brandsLimit },
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${backendUrl}/api/dashboard/orders/status-distribution`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${backendUrl}/api/dashboard/payment-methods`, {
            params: { start: startDate, end: endDate },
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Update state with all data
        setDashboardData({
          totalSales: responses[0].data.totalSales,
          totalOrders: responses[0].data.totalOrders,
          salesPerf: responses[1].data.sales.map(s => ({ 
            date: s._id, 
            total: s.total 
          })),
          ordersPerf: responses[2].data.orders.map(o => ({ 
            date: o._id, 
            count: o.count 
          })),
          brands: responses[3].data.brands.map(b => ({ 
            brand: b.name, 
            totalSold: b.value 
          })),
          statusDistribution: responses[4].data.statuses,
          paymentMethods: responses[5].data.methods
        });

      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeFilter, brandsLimit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  // Use the actual brands data from API
  const brandsChartData = dashboardData.brands;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        
        <div className="flex space-x-2">
          {['today', 'week', 'month'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-md ${
                timeFilter === filter
                  ? 'bg-black text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="mr-4 bg-blue-100 p-3 rounded-full">
            <span className="text-blue-600 text-2xl">💰</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Sales (Today)</h2>
            <div className="text-2xl font-bold text-gray-800">
              RM{dashboardData.totalSales.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="mr-4 bg-green-100 p-3 rounded-full">
            <span className="text-green-600 text-2xl">📦</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Orders (Today)</h2>
            <div className="text-2xl font-bold text-gray-800">
              {dashboardData.totalOrders}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Sales Performance</h2>
            <div className="text-sm text-gray-500">
              {timeFilter === 'today' ? 'Today' : 
               timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dashboardData.salesPerf}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => 
                  timeFilter === 'today' ? value.split('-')[2] : 
                  timeFilter === 'week' ? `Day ${value.split('-')[2]}` : value
                }
              />
              <YAxis 
                tickFormatter={(value) => `RM${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [`RM${value}`, 'Sales']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                name="Sales (RM)" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Order Performance</h2>
            <div className="text-sm text-gray-500">
              {timeFilter === 'today' ? 'Today' : 
               timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dashboardData.ordersPerf}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => 
                  timeFilter === 'today' ? value.split('-')[2] : 
                  timeFilter === 'week' ? `Day ${value.split('-')[2]}` : value
                }
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [value, 'Orders']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#82ca9d" 
                name="Orders" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Brands */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Top Selling Brands</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Show:</span>
            <select 
              value={brandsLimit} 
              onChange={(e) => setBrandsLimit(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              {[3, 5, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={brandsChartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="brand" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              formatter={(value) => [value, 'Units Sold']}
              labelFormatter={(label) => `Brand: ${label}`}
            />
            <Legend />
            <Bar dataKey="totalSold" name="Units Sold" fill="#8884d8">
              {brandsChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {dashboardData.statusDistribution.map((status, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {status.count}
              </div>
              <div className={`text-sm px-3 py-1 rounded-full ${
                status.status === 'completed' ? 'bg-green-100 text-green-800' :
                status.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                status.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                status.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
              }`}>
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewDashboard;