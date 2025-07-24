# E-commerce System Class Diagram

## Overview
This class diagram represents the complete structure of the e-commerce system, including models, controllers, and their relationships.

## Models (Data Layer)

### User Model
```mermaid
classDiagram
    class User {
        +String userID (unique, sparse)
        +String name (required)
        +String phoneNum (default: '')
        +String email (required, unique)
        +String password (required)
        +String profilePicture (default: '')
        +String address (default: '')
        +CartItem[] cartData (default: [])
    }
    
    class CartItem {
        +String productId
        +String name
        +Number price
        +String[] image
        +String selectedSize
        +Number selectedQuantity
        +Number quantity
    }
    
    User ||--o{ CartItem : contains
```

### Admin Model
```mermaid
classDiagram
    class Admin {
        +String adminID (required, unique)
        +String name (required)
        +String phoneNum (required)
        +String email (required, unique)
        +String password (required)
        +String profilePicture (default: '')
        +String role (enum: 'admin', 'owner', default: 'admin')
        +String address (required)
        +Date createdAt
        +Date updatedAt
    }
```

### Product Model
```mermaid
classDiagram
    class Product {
        +String productID (required, unique)
        +String name (required)
        +String description (required)
        +String[] image (required)
        +Number price (required)
        +Number quantity (required)
        +String[] size (required)
        +String brand (required)
        +String shoesType (required)
        +String gender (enum: 'men', 'women', 'unisex', 'kids')
        +Date date (default: Date.now)
        +String addedBy (required)
        +String addedByRole (enum: 'admin', 'owner')
        +Boolean isSoldOut (virtual)
    }
```

### Order Model
```mermaid
classDiagram
    class Order {
        +String orderID (required, unique)
        +String userID (required)
        +String name (required)
        +String email (required)
        +String phoneNum (required)
        +String address (required)
        +OrderProduct[] products (required)
        +Number totalPrice (required)
        +Date date (default: Date.now)
        +String status (enum: 'pending', 'paid', 'delivered', 'cancelled')
        +String payment (required)
    }
    
    class OrderProduct {
        +String productID (required)
        +String[] image (required)
        +String name (required)
        +Number price (required)
        +Number quantity (required)
        +Number subprice (required)
    }
    
    Order ||--o{ OrderProduct : contains
```

### ResetPin Model
```mermaid
classDiagram
    class ResetPin {
        +String email (required)
        +String phoneNum (required)
        +String pin (required)
        +Date createdAt (default: Date.now, expires: 600)
    }
```

## Controllers (Business Logic Layer)

### UserController
```mermaid
classDiagram
    class UserController {
        +generateSequentialUserID() String
        +validatePassword(password) Object
        +createToken(id) String
        +loginUser(req, res) void
        +registerUser(req, res) void
        +adminLogin(req, res) void
        +generateSequentialId(role) String
        +addAdmin(req, res) void
        +getAllAdmins(req, res) void
        +updateAdminProfile(req, res) void
        +deleteAdmin(req, res) void
        +updateOwnerProfile(req, res) void
        +getUserCart(req, res) void
        +updateUserCart(req, res) void
        +updateUserProfile(req, res) void
        +requestPasswordReset(req, res) void
        +verifyResetPin(req, res) void
        +resetPassword(req, res) void
    }
```

### ProductController
```mermaid
classDiagram
    class ProductController {
        +generateProductID() String
        +addProduct(req, res) void
        +listProduct(req, res) void
        +removeProduct(req, res) void
        +singleProduct(req, res) void
    }
```

### OrderController
```mermaid
classDiagram
    class OrderController {
        +generateOrderID() String
        +placeOrder(req, res) void
        +getUserOrders(req, res) void
        +getAllOrders(req, res) void
        +updateOrderStatus(req, res) void
    }
```

## Relationships

### Entity Relationships
```mermaid
classDiagram
    User ||--o{ Order : places
    User ||--o{ CartItem : has
    Admin ||--o{ Product : adds
    Product ||--o{ OrderProduct : referenced_in
    Order ||--o{ OrderProduct : contains
    User ||--o{ ResetPin : requests
```

### Controller Dependencies
```mermaid
classDiagram
    UserController --> User : manages
    UserController --> Admin : manages
    UserController --> ResetPin : manages
    ProductController --> Product : manages
    OrderController --> Order : manages
    OrderController --> Product : updates_quantity
```

## Frontend Components

### Pages
```mermaid
classDiagram
    class FrontendPages {
        +Home.jsx
        +Collection.jsx
        +Product.jsx
        +Cart.jsx
        +Payment.jsx
        +UserOrder.jsx
        +ManageOrders.jsx
        +Login.jsx
        +Register.jsx
        +Profile.jsx
        +ForgotPassword.jsx
        +About.jsx
        +Contact.jsx
    }
```

### Services
```mermaid
classDiagram
    class FrontendServices {
        +orderService.js
        +clearOldData.js
    }
    
    class OrderService {
        +placeOrder(orderData) Promise
        +getUserOrders(userID) Promise
        +getAllOrders() Promise
        +updateOrderStatus(orderID, status) Promise
    }
```

## Middleware

### Authentication Middleware
```mermaid
classDiagram
    class Middleware {
        +adminAuth.js
        +userAuth.js
        +upload.js
    }
    
    class AdminAuth {
        +verifyToken(req, res, next) void
    }
    
    class UserAuth {
        +verifyUserToken(req, res, next) void
    }
    
    class Upload {
        +single(fieldName) Function
        +fields(fields) Function
    }
```

## Routes

### API Routes
```mermaid
classDiagram
    class Routes {
        +userRoute.js
        +productRoute.js
        +orderRoute.js
    }
    
    class UserRoutes {
        +POST /login
        +POST /register
        +POST /admin
        +POST /admin/add
        +GET /admin/list
        +GET /admin/:id
        +PUT /admin/:id
        +DELETE /admin/:id
        +GET /owner/:id
        +PUT /owner/:id
        +GET /adminProfile/:id
        +PUT /adminProfile/:id
        +GET /userProfile/:id
        +PUT /userProfile/:id
        +GET /cart
        +PUT /cart
        +POST /forgot-password/request
        +POST /forgot-password/verify
        +POST /forgot-password/reset
    }
    
    class ProductRoutes {
        +POST /add
        +GET /list
        +DELETE /remove/:productID
        +GET /single/:productID
    }
    
    class OrderRoutes {
        +POST /place
        +GET /user/:userID
        +GET /all
        +PUT /status/:orderID
    }
```

## Complete System Architecture

```mermaid
classDiagram
    %% Frontend Layer
    FrontendPages --> FrontendServices : uses
    FrontendServices --> BackendAPI : calls
    
    %% Backend Layer
    BackendAPI --> Routes : routes_to
    Routes --> Controllers : calls
    Controllers --> Models : manages
    Controllers --> Middleware : uses
    
    %% Data Layer
    Models --> MongoDB : persists_to
    
    %% External Services
    Controllers --> Cloudinary : uploads_images
    Controllers --> Stripe : processes_payments
    Controllers --> Nodemailer : sends_emails
    
    %% Authentication Flow
    Middleware --> JWT : validates_tokens
    Controllers --> JWT : creates_tokens
```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Admin, Owner)
- Password reset via email

### E-commerce Features
- Product catalog with filtering
- Shopping cart management
- Order placement and tracking
- Payment processing (Stripe integration)
- Inventory management

### Admin Features
- Product management (CRUD)
- Order management and status updates
- User management
- Admin profile management

### User Features
- User registration and login
- Profile management
- Order history and tracking
- Shopping cart persistence

## Database Schema Summary

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| users | User accounts | userID, email, password |
| admins | Admin accounts | adminID, email, role |
| products | Product catalog | productID, name, price, quantity |
| orders | Order records | orderID, userID, products, status |
| resetPins | Password reset | email, pin, createdAt |

This class diagram provides a comprehensive view of the e-commerce system's architecture, showing how all components interact to provide a complete online shopping experience. 