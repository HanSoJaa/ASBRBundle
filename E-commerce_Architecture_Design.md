# E-commerce System Architecture Design

## 1. System Overview

### 1.1 Purpose
The e-commerce system is a full-stack web application designed for selling shoes online. It provides separate interfaces for customers (frontend) and administrators (admin panel), with a centralized backend API serving both applications.

### 1.2 Key Features
- **Customer Features**: Product browsing, search, filtering, cart management, user authentication, order placement, payment processing
- **Admin Features**: Product management, order management, user management, admin user management (owner only)
- **Multi-role System**: Customer, Admin, and Owner roles with different permissions
- **Real-time Inventory**: Stock management with quantity tracking
- **Payment Integration**: Support for multiple payment methods (Stripe, Razorpay, cash)

## 2. Architecture Pattern

### 2.1 Overall Architecture
The system follows a **Three-Tier Architecture** pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Presentation  │    │   Business      │
│     Layer       │    │     Layer       │    │     Logic       │
│                 │    │                 │    │                 │
│   Frontend      │    │   Admin Panel   │    │   Backend API   │
│   (Customer)    │    │   (Admin)       │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │                 │
                    │   MongoDB       │
                    │   Cloudinary    │
                    └─────────────────┘
```

### 2.2 Design Patterns Used
- **MVC (Model-View-Controller)**: Backend follows MVC pattern
- **RESTful API**: Standard REST endpoints for data operations
- **Component-Based Architecture**: Frontend uses React components
- **Repository Pattern**: Data access through Mongoose models
- **Middleware Pattern**: Authentication and validation middleware

## 3. System Components

### 3.1 Frontend (Customer Interface)
**Technology Stack**: React.js, Vite, Tailwind CSS, React Router

**Key Components**:
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation header
│   ├── SearchBar.jsx   # Global search functionality
│   ├── ProductItem.jsx # Product display component
│   └── ...
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Collection.jsx  # Product catalog with filters
│   ├── Product.jsx     # Individual product details
│   ├── Cart.jsx        # Shopping cart
│   ├── Payment.jsx     # Checkout and payment
│   ├── Profile.jsx     # User profile management
│   └── ...
├── services/           # API service layer
│   └── orderService.js # Order-related API calls
└── utils/              # Utility functions
    └── clearOldData.js # Data cleanup utilities
```

### 3.2 Admin Panel
**Technology Stack**: React.js, Vite, Tailwind CSS, React Router

**Key Components**:
```
src/
├── components/          # Admin UI components
│   ├── Navbar.jsx      # Admin navigation
│   ├── Sidebar.jsx     # Admin menu sidebar
│   └── Login.jsx       # Admin authentication
├── pages/              # Admin page components
│   ├── Add.jsx         # Add new products
│   ├── List.jsx        # Product management
│   ├── ManageOrders.jsx # Order management
│   ├── AdminProfile.jsx # Admin profile
│   ├── AddAdmin.jsx    # Add new admins (owner only)
│   └── ...
└── assets/             # Admin-specific assets
```

### 3.3 Backend API
**Technology Stack**: Node.js, Express.js, MongoDB, Mongoose, JWT

**Architecture**:
```
backend/
├── config/             # Configuration files
│   ├── mongodb.js      # Database connection
│   └── cloudinary.js   # Cloud storage setup
├── controllers/        # Business logic layer
│   ├── userController.js    # User management
│   ├── productController.js # Product management
│   ├── orderController.js   # Order management
│   └── adminController.js   # Admin management
├── middleware/         # Request processing middleware
│   ├── userAuth.js     # User authentication
│   ├── adminAuth.js    # Admin authentication
│   └── upload.js       # File upload handling
├── models/             # Data models
│   ├── userModel.js    # User schema
│   ├── productModel.js # Product schema
│   ├── orderModel.js   # Order schema
│   ├── adminModel.js   # Admin schema
│   └── resetPinModel.js # Password reset schema
├── routes/             # API route definitions
│   ├── userRoute.js    # User endpoints
│   ├── productRoute.js # Product endpoints
│   └── orderRoute.js   # Order endpoints
├── uploads/            # File storage
└── server.js           # Main application entry point
```

## 4. Data Architecture

### 4.1 Database Schema

#### User Collection
```javascript
{
  userID: String (unique),
  name: String (required),
  phoneNum: String,
  email: String (unique, required),
  password: String (hashed, required),
  profilePicture: String,
  address: String,
  cartData: [{
    productId: String,
    name: String,
    price: Number,
    image: [String],
    selectedSize: String,
    selectedQuantity: Number,
    quantity: Number
  }]
}
```

#### Product Collection
```javascript
{
  productID: String (unique, required),
  name: String (required),
  description: String (required),
  image: [String] (required),
  price: Number (required),
  quantity: Number (required),
  size: [String] (required),
  brand: String (required),
  shoesType: String (required),
  gender: String (enum: ['men', 'women', 'unisex', 'kids']),
  date: Date (default: now),
  addedBy: String (required),
  addedByRole: String (enum: ['admin', 'owner'])
}
```

#### Order Collection
```javascript
{
  orderID: String (unique, required),
  userID: String (required),
  name: String (required),
  email: String (required),
  phoneNum: String (required),
  address: String (required),
  products: [{
    productID: String,
    image: [String],
    name: String,
    price: Number,
    quantity: Number,
    subprice: Number
  }],
  totalPrice: Number (required),
  date: Date (default: now),
  status: String (enum: ['pending', 'paid', 'delivered', 'cancelled']),
  payment: String (required)
}
```

#### Admin Collection
```javascript
{
  adminID: String (unique, required),
  name: String (required),
  phoneNum: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  profilePicture: String,
  role: String (enum: ['admin', 'owner']),
  address: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Data Relationships
- **User → Orders**: One-to-Many (User can have multiple orders)
- **User → Cart**: One-to-One (User has one cart with multiple items)
- **Admin → Products**: One-to-Many (Admin can add multiple products)
- **Product → Order**: Many-to-Many (Products can be in multiple orders)

## 5. API Architecture

### 5.1 RESTful Endpoints

#### User Management
```
POST   /api/user/login           # User login
POST   /api/user/register        # User registration
POST   /api/user/admin-login     # Admin login
GET    /api/user/cart            # Get user cart
PUT    /api/user/cart            # Update user cart
PUT    /api/user/profile         # Update user profile
POST   /api/user/reset-request   # Request password reset
POST   /api/user/verify-pin      # Verify reset PIN
POST   /api/user/reset-password  # Reset password
```

#### Product Management
```
POST   /api/product/add          # Add new product
GET    /api/product/list         # List products (with filters)
DELETE /api/product/remove/:id   # Remove product
GET    /api/product/:id          # Get single product
```

#### Order Management
```
POST   /api/order/place          # Place new order
GET    /api/order/user-orders    # Get user orders
GET    /api/order/all-orders     # Get all orders (admin)
PUT    /api/order/status/:id     # Update order status
```

#### Admin Management (Owner Only)
```
POST   /api/user/add-admin       # Add new admin
GET    /api/user/all-admins      # List all admins
PUT    /api/user/update-admin    # Update admin
DELETE /api/user/delete-admin    # Delete admin
```

### 5.2 Authentication & Authorization
- **JWT Tokens**: Used for session management
- **Role-Based Access Control**: Different permissions for customer, admin, and owner
- **Middleware Protection**: Routes protected by authentication middleware

## 6. Security Architecture

### 6.1 Authentication Security
- **Password Hashing**: Bcrypt for password encryption
- **JWT Tokens**: Secure session management
- **Token Expiration**: Automatic token expiry
- **Role-Based Authorization**: Different access levels

### 6.2 Data Security
- **Input Validation**: Request data validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Prevention**: Input sanitization
- **CORS Configuration**: Cross-origin request control

### 6.3 File Security
- **Cloudinary Integration**: Secure cloud storage
- **File Type Validation**: Image upload restrictions
- **File Size Limits**: Upload size constraints

## 7. Performance & Scalability

### 7.1 Performance Optimizations
- **Database Indexing**: Optimized queries with indexes
- **Image Optimization**: Cloudinary for image processing
- **Caching**: Browser caching for static assets
- **Lazy Loading**: Component-based code splitting

### 7.2 Scalability Considerations
- **Microservices Ready**: Modular architecture for future scaling
- **Database Sharding**: MongoDB supports horizontal scaling
- **Load Balancing**: Ready for multiple server instances
- **CDN Integration**: Cloudinary provides global CDN

## 8. Deployment Architecture

### 8.1 Development Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │    │   Backend       │
│   (Port 5173)   │    │   (Port 5174)   │    │   (Port 4000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   (Local/Atlas) │
                    └─────────────────┘
```

### 8.2 Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Cloud     │    │   Load Balancer │    │   Application   │
│   Frontend      │    │                 │    │   Servers       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   Cluster       │
                    └─────────────────┘
```

## 9. Technology Stack

### 9.1 Frontend Technologies
- **React.js 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Toastify**: Notification system

### 9.2 Backend Technologies
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication tokens
- **Multer**: File upload handling
- **Cloudinary**: Cloud image storage
- **Bcrypt**: Password hashing

### 9.3 Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Git**: Version control
- **npm**: Package management

## 10. Error Handling & Monitoring

### 10.1 Error Handling Strategy
- **Global Error Handler**: Centralized error processing
- **HTTP Status Codes**: Proper REST status codes
- **User-Friendly Messages**: Clear error messages
- **Logging**: Error logging for debugging

### 10.2 Monitoring Considerations
- **Performance Monitoring**: Response time tracking
- **Error Tracking**: Error rate monitoring
- **Database Monitoring**: Query performance
- **User Analytics**: Usage pattern tracking

## 11. Future Enhancements

### 11.1 Scalability Improvements
- **Microservices**: Break down into smaller services
- **Message Queues**: Async processing for orders
- **Redis Caching**: Session and data caching
- **API Gateway**: Centralized API management

### 11.2 Feature Additions
- **Real-time Notifications**: WebSocket integration
- **Advanced Analytics**: Business intelligence
- **Mobile App**: React Native application
- **Multi-language Support**: Internationalization
- **Advanced Search**: Elasticsearch integration

## 12. Conclusion

This e-commerce system follows modern web development best practices with a clear separation of concerns, scalable architecture, and robust security measures. The three-tier architecture provides flexibility for future enhancements while maintaining code maintainability and system reliability.

The system is designed to handle moderate to high traffic loads and can be easily scaled horizontally as business requirements grow. The modular design allows for easy feature additions and maintenance updates.
