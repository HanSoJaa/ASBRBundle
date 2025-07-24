# ASBR Bundle E-Commerce Thrift Platform - Component Design

## 📦 Package Overview

### Package Identifier
**ASBR-Ecommerce-Platform-v1.0**
- **Platform Name**: ASBR Bundle E-Commerce Thrift Platform
- **Version**: 1.0.0
- **Type**: Full-Stack E-Commerce Solution
- **Architecture**: Three-Tier Architecture (Frontend, Backend, Database)

### Package Purpose
The ASBR Bundle E-Commerce Thrift Platform is a comprehensive online retail solution designed specifically for thrift and second-hand shoe sales. The platform provides:

- **Customer Interface**: Complete shopping experience for buyers
- **Admin Management**: Comprehensive backend management for sellers
- **Multi-Role System**: Support for customers, admins, and owners
- **Payment Processing**: Secure payment handling with multiple gateways
- **Inventory Management**: Real-time stock tracking and management
- **Order Processing**: End-to-end order lifecycle management
- **Analytics Dashboard**: Business intelligence and reporting tools

### Package Function
The platform serves as a complete e-commerce ecosystem that enables:

1. **Customer Operations**:
   - Product discovery and browsing
   - Shopping cart management
   - Secure checkout and payment
   - Order tracking and history
   - User profile management

2. **Admin Operations**:
   - Product catalog management
   - Order processing and fulfillment
   - Customer management
   - Sales analytics and reporting
   - Inventory control

3. **Owner Operations**:
   - Admin user management
   - System configuration
   - Business analytics
   - Platform oversight

---

## 🔗 Package Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.0.0",
  "react-toastify": "^9.0.0",
  "@stripe/stripe-js": "^2.0.0",
  "tailwindcss": "^3.0.0",
  "vite": "^4.0.0"
}
```

### Admin Panel Dependencies
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.0.0",
  "react-toastify": "^9.0.0",
  "recharts": "^2.0.0",
  "tailwindcss": "^3.0.0",
  "vite": "^4.0.0"
}
```

### Backend Dependencies
```json
{
  "express": "^5.0.0",
  "mongoose": "^8.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.0.0",
  "nodemailer": "^7.0.0",
  "multer": "^1.4.0",
  "cloudinary": "^2.6.0",
  "stripe": "^18.0.0",
  "cors": "^2.8.0",
  "dotenv": "^16.0.0",
  "validator": "^13.0.0"
}
```

### External Service Dependencies
- **MongoDB**: Primary database
- **Cloudinary**: Image storage and CDN
- **Stripe**: Payment processing
- **Gmail SMTP**: Email delivery
- **JWT**: Authentication tokens

---

## 🧩 Package Components

### 1. Frontend Package (Customer Interface)

#### 1.1 Core Components
```
frontend/src/components/
├── Navbar.jsx              # Main navigation component
├── SearchBar.jsx           # Global search functionality
├── ProductItem.jsx         # Product display component
├── Hero.jsx               # Landing page hero section
├── BestSeller.jsx         # Featured products component
├── LatestCollection.jsx   # New arrivals component
└── Title.jsx              # Reusable title component
```

#### 1.2 Page Components
```
frontend/src/pages/
├── Home.jsx               # Landing page
├── Collection.jsx         # Product catalog with filters
├── Product.jsx            # Individual product details
├── Cart.jsx               # Shopping cart management
├── Payment.jsx            # Checkout and payment
├── Login.jsx              # User authentication
├── Register.jsx           # User registration
├── Profile.jsx            # User profile management
├── UserOrder.jsx          # Order history and tracking
├── ForgotPassword.jsx     # Password reset flow
├── About.jsx              # About page
└── Contact.jsx            # Contact information
```

#### 1.3 Service Layer
```
frontend/src/services/
└── orderService.js        # Order-related API calls
```

#### 1.4 Utility Components
```
frontend/src/utils/
└── clearOldData.js        # Data cleanup utilities
```

### 2. Admin Panel Package

#### 2.1 Core Components
```
admin/src/components/
├── Navbar.jsx             # Admin navigation
├── Sidebar.jsx            # Admin menu sidebar
└── Login.jsx              # Admin authentication
```

#### 2.2 Page Components
```
admin/src/pages/
├── ViewDashboard.jsx      # Analytics dashboard
├── Add.jsx                # Add new products
├── List.jsx               # Product management
├── UpdateProduct.jsx      # Edit existing products
├── ManageOrders.jsx       # Order management
├── AdminProfile.jsx       # Admin profile
├── OwnerProfile.jsx       # Owner profile
├── AddAdmin.jsx           # Add new admins
├── ListAdmin.jsx          # Admin user management
└── UpdateAdmin.jsx        # Edit admin accounts
```

### 3. Backend Package

#### 3.1 Configuration Components
```
backend/config/
├── mongodb.js             # Database connection
└── cloudinary.js          # Cloudinary configuration
```

#### 3.2 Controller Components
```
backend/controllers/
├── userController.js      # User management logic
├── adminController.js     # Admin management logic
├── productController.js   # Product management logic
├── orderController.js     # Order processing logic
└── dashboardController.js # Analytics and reporting
```

#### 3.3 Model Components
```
backend/models/
├── userModel.js           # User data schema
├── adminModel.js          # Admin data schema
├── productModel.js        # Product data schema
├── orderModel.js          # Order data schema
└── resetPinModel.js       # Password reset schema
```

#### 3.4 Route Components
```
backend/routes/
├── userRoute.js           # User API endpoints
├── adminRoute.js          # Admin API endpoints
├── productRoute.js        # Product API endpoints
├── orderRoute.js          # Order API endpoints
└── dashboardRoute.js      # Dashboard API endpoints
```

#### 3.5 Middleware Components
```
backend/middleware/
├── userAuth.js            # User authentication
├── adminAuth.js           # Admin authentication
└── upload.js              # File upload handling
```

#### 3.6 Service Components
```
backend/services/
└── emailService.js        # Email notification system
```

### 4. Database Package

#### 4.1 Data Models
- **Users Collection**: Customer accounts and profiles
- **Admins Collection**: Admin user accounts
- **Products Collection**: Product catalog and inventory
- **Orders Collection**: Order records and status
- **ResetPins Collection**: Password reset tokens

#### 4.2 Database Schema
```javascript
// User Schema
{
  userID: String,
  name: String,
  email: String,
  phoneNum: String,
  address: String,
  password: String,
  profilePicture: String,
  cartData: Array
}

// Product Schema
{
  productID: String,
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  image: Array,
  brand: String,
  shoesType: String,
  gender: String
}

// Order Schema
{
  orderID: String,
  userID: String,
  products: Array,
  totalPrice: Number,
  status: String,
  payment: String,
  date: Date
}
```

---

## 🔄 Component Interactions

### 1. Authentication Flow
```
User/Admin → Frontend/Admin Panel → Backend API → JWT Token → Database
```

### 2. Product Management Flow
```
Admin Panel → Product Controller → Product Model → MongoDB → Cloudinary
```

### 3. Order Processing Flow
```
Frontend → Order Controller → Order Model → Payment Gateway → Email Service
```

### 4. Analytics Flow
```
Dashboard → Dashboard Controller → Database Aggregation → Chart Components
```

---

## 🎯 Component Responsibilities

### Frontend Components
- **Navbar**: Navigation and user session management
- **ProductItem**: Product display and cart integration
- **Cart**: Shopping cart state management
- **Payment**: Checkout process and payment integration
- **Profile**: User data management and updates

### Admin Components
- **Dashboard**: Analytics visualization and reporting
- **Product Management**: CRUD operations for products
- **Order Management**: Order processing and status updates
- **Admin Management**: User role and permission management

### Backend Components
- **Controllers**: Business logic and request handling
- **Models**: Data structure and database operations
- **Routes**: API endpoint definitions
- **Middleware**: Authentication and validation
- **Services**: External service integrations

---

## 🚀 Deployment Components

### Frontend Deployment
- **Build Tool**: Vite
- **Static Hosting**: Netlify/Vercel
- **CDN**: Cloudinary for images

### Backend Deployment
- **Runtime**: Node.js
- **Server**: Express.js
- **Hosting**: Heroku/AWS/DigitalOcean
- **Database**: MongoDB Atlas

### Environment Configuration
- **Development**: Local development setup
- **Staging**: Pre-production testing
- **Production**: Live application deployment

---

## 📊 Component Metrics

### Performance Metrics
- **Frontend Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Image Load Time**: < 2 seconds

### Scalability Metrics
- **Concurrent Users**: 1000+
- **Products**: 10,000+
- **Orders per Day**: 500+
- **Storage**: 100GB+

### Security Metrics
- **Authentication**: JWT-based
- **Data Encryption**: HTTPS/TLS
- **File Upload**: Validated and sanitized
- **Payment Security**: PCI DSS compliant

---

## 🔧 Component Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/asbr_ecommerce

# Authentication
JWT_SECRET=your-jwt-secret-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# External Services
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=your-stripe-secret-key

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Build Configuration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js"
  }
}
```

This Component Design provides a comprehensive overview of the ASBR Bundle E-Commerce Thrift Platform, detailing all packages, dependencies, components, and their interactions to create a robust and scalable e-commerce solution. 