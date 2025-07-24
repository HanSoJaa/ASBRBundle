import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import adminRouter from './routes/adminRoute.js'
import productRouter from './routes/productRoute.js'
import orderRouter from './routes/orderRoute.js'
import dashboardRouter from './routes/dashboardRoute.js';
import path from 'path'
import { fileURLToPath } from 'url'

// App Config
const app = express()
const port = process.env.PORT || 4000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectDB()
connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//api endpoints
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/product', productRouter)
app.use('/api/order', orderRouter)
app.use('/api/dashboard', dashboardRouter);

app.get('/', (req, res) => {
    res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))