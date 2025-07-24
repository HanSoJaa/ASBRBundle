# Email Configuration Guide

## Required Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

## Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "ASBR E-commerce" as the name
   - Copy the generated 16-character password
3. **Use the App Password** in your `EMAIL_PASS` environment variable

## Email Features Available

### 1. Welcome Email
- Sent when users register
- Includes welcome message and features overview
- Contains link to start shopping

### 2. Order Confirmation Email
- Sent when orders are placed
- Includes complete order details
- Shows products, prices, and shipping info
- Contains order tracking link

### 3. Order Status Update Email
- Sent when admin updates order status
- Notifies customers of status changes
- Includes order ID and new status

### 4. Password Reset Email
- Sent when users request password reset
- Contains 4-digit PIN code
- PIN expires after 10 minutes

## Email Templates

All emails use responsive HTML templates with:
- Professional ASBR branding
- Mobile-friendly design
- Clear call-to-action buttons
- Order details and tracking links

## Testing Email Configuration

You can test the email setup by:
1. Registering a new user (welcome email)
2. Placing an order (confirmation email)
3. Updating order status in admin panel (status update email)
4. Requesting password reset (reset email)

## Troubleshooting

### Common Issues:
1. **"Invalid credentials"** - Use App Password, not regular password
2. **"Cannot connect to Gmail"** - Check internet connection and firewall
3. **"Email service not configured"** - Add EMAIL_USER and EMAIL_PASS to .env

### Security Notes:
- Never commit your `.env` file to version control
- Use App Passwords instead of regular passwords
- Keep your email credentials secure 