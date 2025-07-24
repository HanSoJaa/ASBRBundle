import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';

// Get today's summary
export const getTodaySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const [sales, orders] = await Promise.all([
      orderModel.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      orderModel.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } })
    ]);
    
    res.json({ 
      totalSales: sales[0]?.total || 0,
      totalOrders: orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sales performance (line chart)
export const getSalesPerformance = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);
    
    const sales = await orderModel.aggregate([
      { $match: { date: { $gte: startDate, $lt: endDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$totalPrice' } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ sales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Order performance (line chart)
export const getOrderPerformance = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);
    
    const orders = await orderModel.aggregate([
      { $match: { date: { $gte: startDate, $lt: endDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Top selling brands (bar chart) 
export const getTopSellingBrands = async (req, res) => {
  try {
    const { start, end, limit = 5 } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);
    
    const brands = await orderModel.aggregate([
      { 
        $match: { 
          date: { $gte: startDate, $lt: endDate }, 
          status: { $ne: 'cancelled' } 
        } 
      },
      { $unwind: '$products' },
      // Add filter to exclude missing brands
      { $match: { 'products.brand': { $exists: true, $ne: '' } } },
      { 
        $group: { 
          _id: '$products.brand', 
          value: { $sum: '$products.quantity' }  // Rename to 'value'
        } 
      },
      { $sort: { value: -1 } },
      { $limit: parseInt(limit) },
      // Transform to expected {name, value} format
      { $project: { 
          _id: 0, 
          name: '$_id', 
          value: 1 
      }}
    ]);
    
    res.json({ 
        brands: brands.map(b => ({ 
        name: b.name, 
        value: b.value
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order status distribution
export const getOrderStatusDistribution = async (req, res) => {
  try {
    const statuses = await orderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);
    
    res.json({ statuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment methods distribution
export const getPaymentMethods = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);
    
    const methods = await orderModel.aggregate([
      { $match: { date: { $gte: startDate, $lt: endDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: "$payment", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } }
    ]);
    
    res.json({ methods });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};