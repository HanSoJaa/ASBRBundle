import {v2 as cloudinary} from "cloudinary"
import productModel from "../models/productModel.js"
import orderModel from "../models/orderModel.js";
import { verifyUserToken } from '../middleware/userAuth.js';

// Helper function to generate sequential product ID
const generateProductID = async () => {
    const lastProduct = await productModel.findOne().sort({ productID: -1 });
    
    if (!lastProduct || !lastProduct.productID) {
        return "PRO0001";
    }

    const lastNumber = parseInt(lastProduct.productID.replace("PRO", ""));
    const nextNumber = lastNumber + 1;
    return `PRO${nextNumber.toString().padStart(4, "0")}`;
}

// function for add product
const addProduct = async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        console.log('Received files:', req.files);

        const {
            name,
            description,
            price,
            quantity,
            size,
            brand,
            shoesType,
            gender,
            addedBy,
            addedByRole
        } = req.body

        // Validate required fields
        if (!name || !description || !price || !quantity || !size || 
            !brand || !shoesType || !gender || !addedBy || !addedByRole) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }
        // Validate size is a valid JSON array
        let parsedSize;
        try {
            parsedSize = JSON.parse(size);
            if (!Array.isArray(parsedSize)) throw new Error();
        } catch {
            return res.status(400).json({ success: false, message: "Size must be a valid array" });
        }

        // Handle multiple images
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        if (images.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "At least one image is required" 
            });
        }

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                try {
                    let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                    return result.secure_url;
                } catch (error) {
                    console.error('Error uploading image to cloudinary:', error);
                    throw new Error('Failed to upload image');
                }
            })
        );

        const productData = {
            productID: await generateProductID(),
            name,
            description,
            price: Number(price),
            quantity: Number(quantity),
            size: parsedSize,
            brand,
            shoesType,
            gender,
            image: imagesUrl,
            addedBy,
            addedByRole
        }

        console.log('Creating product with data:', productData);

        const product = new productModel(productData);
        await product.save()

        res.status(201).json({ 
            success: true, 
            message: "Product Added Successfully", 
            product 
        });

    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error adding product. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// function for list product
const listProduct = async (req, res) => {
    try {
        const { gender, brand, shoesType, minPrice, maxPrice } = req.query;
        
        let query = {};
        
        // Apply filters if they exist
        if (gender) query.gender = gender;
        if (brand) query.brand = brand;
        if (shoesType) query.shoesType = shoesType;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await productModel.find(query);
        res.json({ success: true, products })

    } catch (error) {
        console.error("List Products Error:", error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// function for remove product
const removeProduct = async (req, res) => {
    try {
        const { productID } = req.params;
        
        if (!productID) {
            return res.status(400).json({ success: false, message: "Product ID is required" })
        }

        const product = await productModel.findOneAndDelete({ productID });
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        res.json({ success: true, message: "Product Removed Successfully" })

    } catch (error) {
        console.error("Remove Product Error:", error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productID } = req.params;
        
        if (!productID) {
            return res.status(400).json({ success: false, message: "Product ID is required" })
        }

        const product = await productModel.findOne({ productID });
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        res.json({ success: true, product })

    } catch (error) {
        console.error("Single Product Error:", error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// function for update product
const updateProduct = async (req, res) => {
  try {
    const { productID } = req.params;
    const {
      name,
      description,
      price,
      quantity,
      size,
      brand,
      shoesType,
      gender,
      updatedBy,
      updatedByRole
    } = req.body;

    if (!productID) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await productModel.findOne({ productID });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (quantity) product.quantity = Number(quantity);
    if (size) {
      try {
        product.size = JSON.parse(size);
      } catch {
        return res.status(400).json({ success: false, message: "Size must be a valid array" });
      }
    }
    if (brand) product.brand = brand;
    if (shoesType) product.shoesType = shoesType;
    if (gender) product.gender = gender;
    if (updatedBy) product.updatedBy = updatedBy;
    if (updatedByRole) product.updatedByRole = updatedByRole;
    product.updatedAt = new Date();

    // Handle images - preserve existing images by default
    const imageFields = ['image1', 'image2', 'image3', 'image4'];
    let updatedImages = Array.isArray(product.image) ? [...product.image] : [];
    for (let i = 0; i < imageFields.length; i++) {
      const field = imageFields[i];
      if (req.files && req.files[field] && req.files[field][0]) {
        try {
          const result = await cloudinary.uploader.upload(
            req.files[field][0].path, 
            { resource_type: 'image' }
          );
          // Replace existing image at position or add new
          if (i < updatedImages.length) {
            updatedImages[i] = result.secure_url;
          } else {
            updatedImages.push(result.secure_url);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }
    product.image = updatedImages;
    await product.save();
    res.json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: "Error updating product. Please try again later." });
  }
}


// Add this helper function to ProductController.js
function computeCosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        return 0;
    }
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }
    return dotProduct / (magnitudeA * magnitudeB);
}


/// array product to compute consine similarity
const BRANDS = ["Adidas", "Nike", "New Balance", "Puma", "Asics"];
const SHOES_TYPES = ["Running", "Lifestyle", "Football", "Badminton"];
const GENDERS = ['men', 'women', 'unisex'];
const SIZES = [3,4,5,6,7,8,9,10,11,12];

// Helper: one-hot encode a product
function encodeProduct(product) {
    const brandVec = BRANDS.map(b => (product.brand === b ? 1 : 0));
    const shoesTypeVec = SHOES_TYPES.map(t => (product.shoesType === t ? 1 : 0));
    const genderVec = GENDERS.map(g => (product.gender === g ? 1 : 0));
    // For size, encode as a binary vector (1 if product has that size)
    const sizeVec = SIZES.map(sz => (Array.isArray(product.size) && product.size.includes(sz) ? 1 : 0));
    // recommendation followed by brand, shoesType, gender and size
    // Weight: brand*4, shoesType*3, gender*2, size*1
    return [
        ...brandVec.map(x => x*4),
        ...shoesTypeVec.map(x => x*3),
        ...genderVec.map(x => x*2),
        ...sizeVec.map(x => x*1)
    ];
}

//Product Recommendation using Content Based Filtering and also implement compute cosine similarity rules
const getRecommendedProduct = async (req, res) => {
    try {
        const userId = req.user?.userID; // From UserAuth middleware
        if (!userId) {
            return res.json({ success: true, products: [] });
        }

        // 1. Get user's purchased products
        const orders = await orderModel.find({ 
            userID: userId, 
            status: { $in: ['pending','processing','shipped', 'delivered', 'received'] } 
        });

        // Extract unique purchased product IDs
        const purchasedProductIDs = [...new Set(
            orders.flatMap(order => 
                order.products.map(p => p.productID)
            )
        )];
        //
        if (purchasedProductIDs.length === 0) {
            return res.json({ success: true, products: [] });
        }

        // 2. Get purchased products
        const purchasedProducts = await productModel.find({
            productID: { $in: purchasedProductIDs }
        });
        if (purchasedProducts.length === 0) {
            return res.json({ success: true, products: [] });
        }

        // 3. Find the most frequently purchased brand, shoesType, gender, and size
        function getMostFrequent(arr) {
            const freq = {};
            arr.forEach(val => { if(val) freq[val] = (freq[val] || 0) + 1; });
            let max = 0, res = null;
            for (const key in freq) {
                if (freq[key] > max) { max = freq[key]; res = key; }
            }
            return res;
        }
        // For size, flatten all sizes and find the most frequent
        const allSizes = purchasedProducts.flatMap(p => Array.isArray(p.size) ? p.size : []);
        const userBrand = getMostFrequent(purchasedProducts.map(p => p.brand));
        const userShoesType = getMostFrequent(purchasedProducts.map(p => p.shoesType));
        const userGender = getMostFrequent(purchasedProducts.map(p => p.gender));
        const userSize = getMostFrequent(allSizes);

        // Build user profile as a pseudo-product
        const userProfileProduct = {
            brand: userBrand,
            shoesType: userShoesType,
            gender: userGender,
            size: userSize ? [parseInt(userSize)] : []
        };
        const userProfile = encodeProduct(userProfileProduct);

        // 4. Get user products (not purchased, in stock to be recommended)
        const candidateProducts = await productModel.find({
            productID: { $nin: purchasedProductIDs },
            quantity: { $gt: 0 }
        });
        if (candidateProducts.length === 0) {
            return res.json({ success: true, products: [] });
        }

        // 5. Score each candidate by cosine similarity
        const scored = candidateProducts.map(prod => {
            const prodVec = encodeProduct(prod);
            const sim = computeCosineSimilarity(userProfile, prodVec);
            return { product: prod, score: sim };
        });
        // 6. Sort by similarity, descending
        scored.sort((a, b) => b.score - a.score);
        // 7. Return top 4
        const recommendedProducts = scored.slice(0, 4).map(s => s.product);
        res.json({ success: true, products: recommendedProducts });
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Export all controller functions
export { listProduct, addProduct, removeProduct, singleProduct, updateProduct, getRecommendedProduct }