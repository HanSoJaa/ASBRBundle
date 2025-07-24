import express from 'express';
import { loginUser, registerUser, getUserCart, updateUserCart, updateUserProfile, requestPasswordReset, verifyResetPin, resetPassword } from '../controllers/userController.js';
import { verifyUserToken } from '../middleware/userAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// User routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Forgot Password routes
router.post('/forgot-password/request', requestPasswordReset);
router.post('/forgot-password/verify', verifyResetPin);
router.post('/forgot-password/reset', resetPassword);

// Cart routes
router.get('/cart', verifyUserToken, getUserCart);
router.put('/cart', verifyUserToken, updateUserCart);

// User update profile routes
router.get('/userProfile/:id', verifyUserToken, updateUserProfile);
router.put('/userProfile/:id', verifyUserToken, upload.single('profilePicture'), updateUserProfile);

export default router;