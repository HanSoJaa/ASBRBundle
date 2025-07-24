import express from 'express';
import { 
    adminLogin, 
    addAdmin, 
    getAllAdmins, 
    updateAdminProfile, 
    deleteAdmin, 
    updateOwnerProfile 
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Admin authentication
router.post('/login', adminLogin);

// Admin management routes (owner only)
router.post('/add', verifyToken, upload.single('profilePicture'), addAdmin);
router.get('/list', verifyToken, getAllAdmins);
router.get('/:id', verifyToken, updateAdminProfile); // Get admin by ID (owner)
router.put('/:id', verifyToken, upload.single('profilePicture'), updateAdminProfile); // Update admin (owner)
router.delete('/:id', verifyToken, deleteAdmin); // Delete admin (owner)

// Owner profile routes
router.get('/owner/:id', verifyToken, updateOwnerProfile); // Get owner profile
router.put('/owner/:id', verifyToken, upload.single('profilePicture'), updateOwnerProfile); // Update owner profile

// Admin self-profile routes
router.get('/profile/:id', verifyToken, updateAdminProfile); // Get admin own profile
router.put('/profile/:id', verifyToken, upload.single('profilePicture'), updateAdminProfile); // Update admin own profile

export default router; 