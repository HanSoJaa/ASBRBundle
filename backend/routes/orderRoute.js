import express from 'express';
import { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, updateOrderDetails, createPaymentIntent } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', placeOrder);
router.get('/user/:userID', getUserOrders);
router.get('/all', getAllOrders);
router.put('/status/:orderID', updateOrderStatus);
router.put('/details/:orderID', updateOrderDetails);
router.post('/payment/create-payment-intent', createPaymentIntent);

export default router; 