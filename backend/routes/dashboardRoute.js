import express from 'express';
import { 
  getTodaySummary,
  getSalesPerformance,
  getOrderPerformance,
  getTopSellingBrands,
  getOrderStatusDistribution,
  getPaymentMethods
} from '../controllers/dashboardController.js';

const router = express.Router();

// Today's summary
router.get('/summary/today', getTodaySummary);

// Sales performance
router.get('/sales/performance', getSalesPerformance);

// Order performance
router.get('/orders/performance', getOrderPerformance);

// Top selling brands
router.get('/brands/top', getTopSellingBrands);

// Order status distribution
router.get('/orders/status-distribution', getOrderStatusDistribution);

// Payment methods
router.get('/payment-methods', getPaymentMethods);

export default router;