import jwt from "jsonwebtoken"
import adminModel from "../models/adminModel.js"

// Admin auth using 'token' header (for product routes)
const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.token
        if (!token) {
            return res.json({ success: false, message: "No token provided" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel.findById(decoded.id).select('-password');
        
        if (!admin) {
            return res.json({ success: false, message: "Admin not found" })
        }

        req.admin = admin;
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Invalid token" })
    }
}

// Admin auth using 'authorization' header (for admin routes)
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel.findById(decoded.id).select('-password');
        
        if (!admin) {
            return res.json({ success: false, message: 'Admin not found' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Invalid token' });
    }
};

export default adminAuth