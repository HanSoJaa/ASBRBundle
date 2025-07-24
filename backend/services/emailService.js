import { createTransport } from "nodemailer";
import 'dotenv/config';

// Email transporter configuration
const createEmailTransporter = () => {
    return createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        secure: false,
        port: 587,
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Email templates
const emailTemplates = {
    // Welcome email for new users
    welcomeEmail: (userName) => ({
        subject: 'Welcome to ASBR - Your Account is Ready!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin-bottom: 10px;">Welcome to ASBR!</h1>
                    <p style="color: #666; font-size: 18px;">Your account has been successfully created</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                    <h2 style="color: #333; margin-bottom: 15px;">Hello ${userName},</h2>
                    <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                        Thank you for joining ASBR! We're excited to have you as part of our community.
                    </p>
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        You can now:
                    </p>
                    <ul style="color: #555; line-height: 1.8; margin-left: 20px;">
                        <li>Browse our extensive collection of shoes</li>
                        <li>Add items to your shopping cart</li>
                        <li>Complete secure purchases</li>
                        <li>Track your order status</li>
                        <li>Manage your profile and preferences</li>
                    </ul>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666;">
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Best regards,<br><strong>ASBR Team</strong></p>
                </div>
            </div>
        `
    }),

    // Order confirmation email
    orderConfirmation: (orderData, userData) => ({
        subject: `Order Confirmation - Order #${orderData?.orderID || 'N/A'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin-bottom: 10px;">Order Confirmed!</h1>
                    <p style="color: #28a745; font-size: 18px; font-weight: bold;">Thank you for your purchase</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                    <h2 style="color: #333; margin-bottom: 15px;">Order Details</h2>
                    <div style="margin-bottom: 20px;">
                        <p><strong>Order ID:</strong> ${orderData?.orderID || 'N/A'}</p>
                        <p><strong>Order Date:</strong> ${orderData?.date ? new Date(orderData.date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                        <p><strong>Total Amount:</strong> RM${orderData?.totalPrice ? orderData.totalPrice.toFixed(2) : '0.00'}</p>
                        <p><strong>Payment Method:</strong> ${orderData?.payment || 'N/A'}</p>
                        <p><strong>Status:</strong> <span style="color: #007bff; font-weight: bold;">${orderData?.status || 'Pending'}</span></p>
                    </div>
                    
                    <h3 style="color: #333; margin-bottom: 10px;">Shipping Information</h3>
                    <div style="margin-bottom: 20px;">
                        <p><strong>Name:</strong> ${userData?.name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${userData?.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${userData?.phoneNum || 'N/A'}</p>
                        <p><strong>Address:</strong> ${userData?.address || 'N/A'}</p>
                    </div>
                </div>
                
                <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
                    ${(orderData?.products || []).map(product => `
                        <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                            <div>
                                <p style="font-weight: bold; margin: 0;">${product?.name || 'N/A'}</p>
                                <p style="color: #666; margin: 5px 0;">Size: UK ${product?.selectedSize || 'N/A'}</p>
                                <p style="color: #666; margin: 0;">Quantity: ${product?.quantity || 0}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-weight: bold; margin: 0;">RM${product?.subprice ? product.subprice.toFixed(2) : '0.00'}</p>
                            </div>
                        </div>
                    `).join('')}
                    <div style="border-top: 2px solid #333; padding-top: 15px; text-align: right;">
                        <p style="font-size: 18px; font-weight: bold; margin: 0;">
                            Total: RM${orderData?.totalPrice ? orderData.totalPrice.toFixed(2) : '0.00'}
                        </p>
                    </div>
                </div>
                
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666;">
                    <p>We'll send you updates about your order status.</p>
                    <p>Best regards,<br><strong>ASBR Team</strong></p>
                </div>
            </div>
        `
    }),

    // Order status update email
    orderStatusUpdate: (orderData, userData, newStatus) => ({
        subject: `Order Status Update - Order #${orderData?.orderID || 'N/A'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin-bottom: 10px;">Order Status Updated</h1>
                    <p style="color: #007bff; font-size: 18px; font-weight: bold;">Your order has been updated</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                    <h2 style="color: #333; margin-bottom: 15px;">Order Information</h2>
                    <div style="margin-bottom: 20px;">
                        <p><strong>Order ID:</strong> ${orderData?.orderID || 'N/A'}</p>
                        <p><strong>New Status:</strong> <span style="color: #007bff; font-weight: bold; text-transform: capitalize;">${newStatus || 'N/A'}</span></p>
                        <p><strong>Updated Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Customer:</strong> ${userData?.name || 'N/A'}</p>
                    </div>
                </div>
                
                <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #333; margin-bottom: 15px;">What this means:</h3>
                    <ul style="color: #555; line-height: 1.8;">
                        <li><strong>Pending:</strong> Your order is being reviewed</li>
                        <li><strong>Processing:</strong> Your order is being prepared</li>
                        <li><strong>Shipped:</strong> Your order is on its way</li>
                        <li><strong>Delivered:</strong> Your order has been delivered</li>
                        <li><strong>Cancelled:</strong> Your order has been cancelled</li>
                    </ul>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666;">
                    <p>Thank you for choosing ASBR!</p>
                    <p>Best regards,<br><strong>ASBR Team</strong></p>
                </div>
            </div>
        `
    }),

    // Password reset email (existing template)
    passwordReset: (userName, pin) => ({
        subject: 'Password Reset PIN',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hello ${userName},</p>
                <p>You have requested to reset your password. Please use the following 4-digit PIN to complete the process:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${pin}</h1>
                </div>
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This PIN will expire in 10 minutes</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>For security reasons, do not share this PIN with anyone</li>
                </ul>
                <p>Best regards,<br>ASBR Team</p>
            </div>
        `
    })
};

// Email service functions
export const sendEmail = async (to, templateName, templateData = {}) => {
    try {
        // Check if email configuration is set up
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
            throw new Error('Email service is not configured');
        }

        const transporter = createEmailTransporter();
        
        // Verify transporter configuration
        await transporter.verify();
        console.log('Email transporter verified successfully');

        // Get template
        const template = emailTemplates[templateName];
        if (!template) {
            throw new Error(`Email template '${templateName}' not found`);
        }

        // Generate email content
        let emailContent;
        if (typeof template === 'function') {
            // For templates that expect individual parameters
            if (templateName === 'orderStatusUpdate') {
                console.log('Email template data:', {
                    orderID: templateData.orderData?.orderID,
                    newStatus: templateData.newStatus,
                    userEmail: templateData.userData?.email
                });
                emailContent = template(templateData.orderData, templateData.userData, templateData.newStatus);
            } else if (templateName === 'orderConfirmation') {
                emailContent = template(templateData.orderData, templateData.userData);
            } else if (templateName === 'passwordReset') {
                emailContent = template(templateData.userName, templateData.pin);
            } else {
                emailContent = template(templateData);
            }
        } else {
            emailContent = template;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: emailContent.subject,
            html: emailContent.html
        };

        // Send email
        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}: ${templateName}`);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Specific email functions
export const sendWelcomeEmail = async (userEmail, userName) => {
    return await sendEmail(userEmail, 'welcomeEmail', userName);
};

export const sendOrderConfirmation = async (userEmail, orderData, userData) => {
    return await sendEmail(userEmail, 'orderConfirmation', { orderData, userData });
};

export const sendOrderStatusUpdate = async (userEmail, orderData, userData, newStatus) => {
    return await sendEmail(userEmail, 'orderStatusUpdate', { orderData, userData, newStatus });
};

export const sendPasswordReset = async (userEmail, userName, pin) => {
    return await sendEmail(userEmail, 'passwordReset', { userName, pin });
};

export default {
    sendEmail,
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendPasswordReset
}; 