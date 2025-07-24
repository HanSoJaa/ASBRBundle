# Backend Setup Guide

## Quick Fix for Email Service Error

The error "Email service configuration error. Please check your email settings" occurs because the `.env` file is missing or email credentials are not configured.

## Step 1: Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail) - REQUIRED for password reset
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration (optional - for image uploads)
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET_KEY=your-api-secret

# Environment
NODE_ENV=development
```

## Step 2: Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "ASBR E-commerce" as the name
   - Copy the generated 16-character password
3. **Use the App Password** in your `EMAIL_PASS` environment variable

## Step 3: Test the Setup

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Test password reset**:
   - Go to the frontend forgot password page
   - Enter a valid email and phone number
   - Check if the email is sent successfully

## Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| `MONGODB_URI` | Database connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes |
| `EMAIL_USER` | Gmail address for sending emails | ✅ Yes |
| `EMAIL_PASS` | Gmail app password | ✅ Yes |
| `FRONTEND_URL` | Frontend URL for email links | ❌ No |
| `CLOUDINARY_NAME` | Cloudinary cloud name | ❌ No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ❌ No |
| `CLOUDINARY_SECRET_KEY` | Cloudinary secret key | ❌ No |
| `NODE_ENV` | Environment (development/production) | ❌ No |

## Common Issues & Solutions

### 1. "Email service configuration error"
**Cause**: Missing `.env` file or email credentials
**Solution**: Create `.env` file with proper email configuration

### 2. "Invalid email credentials"
**Cause**: Using regular Gmail password instead of App Password
**Solution**: Generate and use Gmail App Password

### 3. "Cannot connect to Gmail"
**Cause**: Network/firewall issues or incorrect credentials
**Solution**: Check internet connection and credentials

### 4. "MongoDB connection failed"
**Cause**: MongoDB not running or wrong connection string
**Solution**: Start MongoDB and check connection string

## Security Notes

- ✅ **Never commit** your `.env` file to version control
- ✅ **Use App Passwords** instead of regular Gmail passwords
- ✅ **Keep your JWT_SECRET** secure and random
- ✅ **Use HTTPS** in production

## Testing Email Features

After setup, test these email features:

1. **User Registration** → Welcome email
2. **Password Reset** → Reset PIN email
3. **Order Placement** → Order confirmation email
4. **Order Status Update** → Status update email

## File Structure

```
backend/
├── .env                    ← Create this file
├── server.js
├── controllers/
├── routes/
├── models/
├── services/
│   └── emailService.js     ← Email service
└── config/
    ├── mongodb.js
    └── cloudinary.js
``` 