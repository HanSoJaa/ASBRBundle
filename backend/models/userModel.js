import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userID: { 
        type: String, 
        unique: true,
        sparse: true
    },
    name: { type: String, required: true },
    phoneNum: {type: String, default: ''},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: ''},
    address: { type: String, default: '' },
    cartData: { 
        type: [{
            productId: String,
            name: String,
            price: Number,
            image: [String],
            selectedSize: String,
            selectedQuantity: Number,
            quantity: Number
        }], 
        default: [] 
    }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;