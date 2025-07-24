import mongoose from "mongoose";

const resetPinSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true 
    },
    phoneNum: { 
        type: String, 
        required: true 
    },
    pin: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        expires: 600 // PIN expires after 10 minutes
    }
});

const resetPinModel = mongoose.models.resetPin || mongoose.model('resetPin', resetPinSchema);

export default resetPinModel; 