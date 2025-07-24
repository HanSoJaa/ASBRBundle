import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderID: { type: String, required: true, unique: true },
    userID: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNum: { type: String, required: true },
    address: { type: String, required: true },
    products: [
        {
            productID: { type: String, required: true },
            name: { type: String, required: true },
            description: { type: String, required: true },
            image: { type: Array, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true }, // quantity ordered
            selectedSize: { type: String, required: true },
            brand: { type: String, required: true },
            shoesType: { type: String, required: true },
            gender: { type: String, required: true },
            subprice: { type: Number, required: true }
        }
    ],
    totalPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, required: true, enum: ["pending", "processing", "paid", "delivered", "cancelled"], default: "pending" },
    payment: { type: String, required: true }, // e.g., 'stripe', 'cash', etc.
});

const orderModel = mongoose.models.orders || mongoose.model("order", orderSchema);

export default orderModel; 