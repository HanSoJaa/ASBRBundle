# E-commerce System Architecture

## System Overview
This is a full-stack e-commerce application with separate frontend, admin panel, and backend services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           E-COMMERCE SYSTEM ARCHITECTURE                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           CLIENT LAYER                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌─────────────────────────────────┐                    ┌─────────────────────────────────┐                │
│  │         FRONTEND (React)        │                    │        ADMIN PANEL (React)       │                │
│  │                                 │                    │                                 │                │
│  │  • Customer Interface           │                    │  • Admin Dashboard              │                │
│  │  • Product Browsing             │                    │  • Product Management           │                │
│  │  • Shopping Cart                │                    │  • Order Management             │                │
│  │  • User Authentication          │                    │  • Admin Management             │                │
│  │  • Payment Processing           │                    │  • Analytics & Reports          │                │
│  │  • Order Tracking               │                    │  • User Management              │                │
│  │                                 │                    │                                 │                │
│  │  Technologies:                  │                    │  Technologies:                  │                │
│  │  • React.js                     │                    │  • React.js                     │                │
│  │  • JSX                          │                    │  • JSX                          │                │
│  │  • Tailwind CSS                 │                    │  • Tailwind CSS                 │                │
│  │  • Vite                         │                    │  • Vite                         │                │
│  │  • Axios                        │                    │  • Axios                        │                │
│  │  • React Router                 │                    │  • React Router                 │                │
│  │  • Stripe.js                    │                    │  • Recharts                     │                │
│  └─────────────────────────────────┘                    └─────────────────────────────────┘                │
│           │                                                           │                                   │
│           │                                                           │                                   │
│           └───────────────────────────┬───────────────────────────────┘                                   │
│                                       │                                                                     │
└───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/HTTPS API Calls
                                        │
┌───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┐
│                                       │                                                                     │
│                                    ┌──▼──┐                                                                 │
│                                    │ API │                                                                 │
│                                    │Gateway│                                                                 │
│                                    └──┬──┘                                                                 │
│                                       │                                                                     │
└───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┐
│                                       │                                                                     │
│                                    ┌──▼──┐                                                                 │
│                                    │BACKEND│                                                                 │
│                                    │(Node.js│                                                                 │
│                                    │Express)│                                                                 │
│                                    └──┬──┘                                                                 │
│                                       │                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                    API LAYER                                                           │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   User Routes   │  │   Admin Routes  │  │  Product Routes │  │   Order Routes  │ │Dashboard Routes│ │ │
│  │  │                 │  │                 │  │                 │  │                 │  │                 │ │ │
│  │  │ • /api/user/*   │  │ • /api/admin/*  │  │ • /api/product/*│  │ • /api/order/*  │  │ • /api/dashboard│ │ │
│  │  │ • Authentication│  │ • Admin Login   │  │ • CRUD Products │  │ • Place Orders  │  │ • Analytics     │ │ │
│  │  │ • Registration  │  │ • Admin Mgmt    │  │ • Image Upload  │  │ • Payment       │  │ • Reports       │ │ │
│  │  │ • Profile Mgmt  │  │ • Owner Mgmt    │  │ • Search/Filter │  │ • Order Status  │  │ • Charts        │ │ │
│  │  │ • Cart Mgmt     │  │ • Profile Mgmt  │  │ • Categories    │  │ • Order History │  │ • Sales Data    │ │ │
│  │  │ • Password Reset│  │                 │  │                 │  │                 │  │                 │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                       │                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                  CONTROLLER LAYER                                                      │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │ userController  │  │ adminController │  │productController│  │ orderController │  │dashboardController│ │ │
│  │  │                 │  │                 │  │                 │  │                 │  │                 │ │ │
│  │  │ • User Auth     │  │ • Admin Auth    │  │ • Product CRUD  │  │ • Order Process │  │ • Sales Analytics│ │ │
│  │  │ • User Mgmt     │  │ • Admin Mgmt    │  │ • Image Handle  │  │ • Payment Int.  │  │ • Order Reports │ │ │
│  │  │ • Cart Handle   │  │ • Owner Mgmt    │  │ • Search Logic  │  │ • Status Update │  │ • Brand Reports │ │ │
│  │  │ • Profile Mgmt  │  │ • Profile Mgmt  │  │ • Validation    │  │ • Order History │  │ • Performance   │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                       │                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                   MODEL LAYER                                                          │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   userModel     │  │   adminModel    │  │  productModel   │  │   orderModel    │  │ resetPinModel   │ │ │
│  │  │                 │  │                 │  │                 │  │                 │  │                 │ │ │
│  │  │ • User Schema   │  │ • Admin Schema  │  │ • Product Schema│  │ • Order Schema  │  │ • Reset Schema  │ │ │
│  │  │ • Validation    │  │ • Role Mgmt     │  │ • Image Fields  │  │ • Products Array│  │ • Expiry Logic  │ │ │
│  │  │ • Cart Data     │  │ • Permissions   │  │ • Categories    │  │ • Status Track  │  │ • Pin Validation│ │ │
│  │  │ • Profile Data  │  │ • Profile Data  │  │ • Brand/Type    │  │ • Payment Info  │  │                 │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                       │                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                 MIDDLEWARE LAYER                                                        │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   userAuth      │  │   adminAuth     │  │     upload      │  │      cors       │  │   validation    │ │ │
│  │  │                 │  │                 │  │                 │  │                 │  │                 │ │ │
│  │  │ • JWT Verify    │  │ • JWT Verify    │  │ • File Upload   │  │ • CORS Policy   │  │ • Input Valid.  │ │ │
│  │  │ • User Access   │  │ • Admin Access  │  │ • Image Process │  │ • Security      │  │ • Sanitization  │ │ │
│  │  │ • Role Check    │  │ • Role Check    │  │ • Cloudinary    │  │ • Headers       │  │ • Error Handle  │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                       │                                                                     │
└───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┐
│                                       │                                                                     │
│                                    ┌──▼──┐                                                                 │
│                                    │DATA │                                                                 │
│                                    │LAYER│                                                                 │
│                                    └──┬──┘                                                                 │
│                                       │                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                   DATABASE LAYER                                                        │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                              MONGODB DATABASE                                                       │ │ │
│  │  │                                                                                                     │ │ │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │ │
│  │  │  │     users       │  │     admins      │  │    products     │  │     orders      │  │   resetPins     │ │ │ │
│  │  │  │                 │  │                 │  │                 │  │                 │  │                 │ │ │ │
│  │  │  │ • User Profiles │  │ • Admin Profiles│  │ • Product Info  │  │ • Order Details │  │ • Reset Tokens  │ │ │ │
│  │  │  │ • Authentication│  │ • Roles/Perm.   │  │ • Images        │  │ • Order Items   │  │ • Expiry Times  │ │ │ │
│  │  │  │ • Cart Data     │  │ • Profile Data  │  │ • Categories    │  │ • Status        │  │ • User Links    │ │ │ │
│  │  │  │ • Order History │  │ • Login Data    │  │ • Pricing       │  │ • Payment Info  │  │                 │ │ │ │
│  │  │  │ • Addresses     │  │                 │  │ • Stock Levels  │  │ • Customer Info │  │                 │ │ │ │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                       │                                                                     │
└───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┐
│                                       │                                                                     │
│                                    ┌──▼──┐                                                                 │
│                                    │EXTERNAL│                                                                 │
│                                    │SERVICES│                                                                 │
│                                    └──┬──┘                                                                 │
│                                       │                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                 EXTERNAL SERVICES                                                      │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   CLOUDINARY    │  │     STRIPE      │  │   JWT TOKENS    │  │   EMAIL SERVICE │  │   VALIDATION    │ │ │
│  │  │                 │  │                 │  │                 │  │                 │  │                 │ │ │
│  │  │ • Image Storage │  │ • Payment Proc.│  │ • Authentication│  │ • Password Reset│  │ • Input Valid.  │ │ │
│  │  │ • Image Process │  │ • Payment Int.  │  │ • Session Mgmt  │  │ • Notifications │  │ • Data Sanit.   │ │ │
│  │  │ • CDN Delivery  │  │ • Webhooks      │  │ • Access Control│  │ • Order Confirm │  │ • Security      │ │ │
│  │  │ • Optimization  │  │ • Refunds       │  │ • Token Refresh │  │ • Status Updates│  │ • Rate Limiting │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

## Data Flow

### 1. User Authentication Flow
```
Frontend → API Gateway → Backend → User Controller → User Model → MongoDB
```

### 2. Product Management Flow
```
Admin Panel → API Gateway → Backend → Product Controller → Product Model → MongoDB
```

### 3. Order Processing Flow
```
Frontend → API Gateway → Backend → Order Controller → Order Model → MongoDB
Frontend → Stripe → Payment Processing → Order Update
```

### 4. Image Upload Flow
```
Admin Panel → Upload Middleware → Cloudinary → Product Model → MongoDB
```

## Security Features

- **JWT Authentication** for both users and admins
- **Role-based Access Control** (Owner, Admin, User)
- **Input Validation** and sanitization
- **CORS Protection**
- **Secure File Upload** with validation
- **Password Reset** with secure tokens
- **HTTPS Enforcement** for production

## Scalability Features

- **Modular Architecture** with separate routes and controllers
- **Database Indexing** for performance
- **Image CDN** for fast delivery
- **Stateless Authentication** with JWT
- **API Versioning** ready structure
- **Error Handling** and logging

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React.js + Vite | Customer interface |
| Admin | React.js + Vite | Admin dashboard |
| Backend | Node.js + Express | API server |
| Database | MongoDB + Mongoose | Data persistence |
| Authentication | JWT | Secure access |
| Payments | Stripe | Payment processing |
| Images | Cloudinary | Image storage & CDN |
| Styling | Tailwind CSS | Responsive design |
| Charts | Recharts | Analytics visualization | 