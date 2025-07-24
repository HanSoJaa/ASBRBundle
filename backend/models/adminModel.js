import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    adminID: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phoneNum: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin', 'owner'],
        default: 'admin'
    },
    address: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const adminModel = mongoose.model('Admin', adminSchema);

export default adminModel; 