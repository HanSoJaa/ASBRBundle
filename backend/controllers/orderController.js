
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "../services/emailService.js";
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to generate sequential orderID
const generateOrderID = async () => {
    const lastOrder = await orderModel.findOne().sort({ orderID: -1 });
    if (!lastOrder || !lastOrder.orderID) return "ORD0001";
    const lastNumber = parseInt(lastOrder.orderID.replace("ORD", ""));
    const nextNumber = lastNumber + 1;
    return `ORD${nextNumber.toString().padStart(4, "0")}`;
};

// Place order
const placeOrder = async (req, res) => {
    try {
        const { userID, name, email, phoneNum, address, products, totalPrice, payment } = req.body;
        if (!userID || !name || !email || !phoneNum || !address || !products || !totalPrice || !payment) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // Deduct product quantity and build order products array
        const orderProducts = [];
        for (const item of products) {
            const product = await productModel.findOne({ productID: item.productID });
            if (!product) return res.status(404).json({ success: false, message: `Product ${item.productID} not found` });
            if (product.quantity < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            product.quantity -= item.quantity;
            await product.save();
            orderProducts.push({
                productID: product.productID,
                name: product.name,
                description: product.description,
                image: product.image,
                price: product.price,
                quantity: item.quantity, // quantity ordered
                selectedSize: item.selectedSize, // from frontend
                brand: product.brand,
                shoesType: product.shoesType,
                gender: product.gender,
                subprice: product.price * item.quantity
            });
        }
        // Create order
        const orderData = {
            orderID: await generateOrderID(),
            userID, name, email, phoneNum, address,
            products: orderProducts,
            totalPrice,
            payment,
            status: "pending"
        };
        const order = new orderModel(orderData);
        await order.save();

        // Send order confirmation email (non-blocking)
        try {
            const userData = { name, email, phoneNum, address };
            await sendOrderConfirmation(email, orderData, userData);
            console.log(`Order confirmation email sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail order placement if email fails
        }

        res.status(201).json({ success: true, message: "Order placed successfully", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const { userID } = req.params;
        const orders = await orderModel.find({ userID }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.find().sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderID } = req.params;
        const { status } = req.body;
        const order = await orderModel.findOneAndUpdate({ orderID }, { status }, { new: true });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Send order status update email (non-blocking)
        try {
            const userData = { 
                name: order.name, 
                email: order.email, 
                phoneNum: order.phoneNum, 
                address: order.address 
            };
            await sendOrderStatusUpdate(order.email, order, userData, status);
            console.log(`Order status update email sent to ${order.email} for status: ${status}`);
        } catch (emailError) {
            console.error('Failed to send order status update email:', emailError);
            // Don't fail status update if email fails
        }

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order details (user, only if pending)
const updateOrderDetails = async (req, res) => {
    try {
        const { orderID } = req.params;
        const { name, phoneNum, address } = req.body;
        const order = await orderModel.findOne({ orderID });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.status !== 'processing') {
            return res.status(400).json({ success: false, message: "Only processing orders can be updated" });
        }
        order.name = name;
        order.phoneNum = phoneNum;
        order.address = address;
        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, updateOrderDetails }; 