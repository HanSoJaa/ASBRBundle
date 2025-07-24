import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const verifyUserToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ userID: decoded.id });
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Invalid token' });
    }
}; 