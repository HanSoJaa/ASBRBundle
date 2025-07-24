import express from 'express';
import { listProduct, addProduct, removeProduct, singleProduct, updateProduct, getRecommendedProduct  } from '../controllers/productController.js';
import upload from '../middleware/upload.js';
import adminAuth from '../middleware/adminAuth.js';
import { verifyUserToken } from '../middleware/userAuth.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), addProduct);
productRouter.delete('/remove/:productID', adminAuth, removeProduct);
productRouter.get('/list', listProduct);
productRouter.get('/single/:productID', singleProduct);
productRouter.put('/update/:productID', adminAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), updateProduct);
productRouter.get('/recommendations', verifyUserToken, getRecommendedProduct);

export default productRouter;