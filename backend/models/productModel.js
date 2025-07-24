import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: Array, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: Array, required: true },
    brand: { type: String, required: true },
    shoesType: { type: String, required: true },
    gender: { type: String, required: true, enum: ['men', 'women', 'unisex', 'kids'] },
    date: { type: Date, default: Date.now },
    addedBy: { type: String, required: true },
    addedByRole: { type: String, required: true, enum: ['admin', 'owner'] },
    updatedBy: { type: String },
    updatedByRole: { type: String, enum: ['admin', 'owner'] },
    updatedAt: { type: Date }
})

productSchema.virtual('isSoldOut').get(function() {
    return this.quantity === 0;
});

const productModel = mongoose.models.products || mongoose.model("product", productSchema);

export default productModel