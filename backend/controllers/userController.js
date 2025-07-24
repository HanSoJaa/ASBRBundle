import validator from "validator";
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js";
import resetPinModel from "../models/resetPinModel.js";
import { sendWelcomeEmail, sendPasswordReset } from "../services/emailService.js";
import 'dotenv/config'

// Helper function to generate sequential userID
const generateSequentialUserID = async () => {
    try {
        const lastUser = await userModel.findOne()
            .sort({ userID: -1 })
            .limit(1);

        let nextNumber = 1;
        if (lastUser && lastUser.userID) {
            const matches = lastUser.userID.match(/\d+$/);
            if (matches) {
                nextNumber = parseInt(matches[0]) + 1;
            }
        }

        const formattedNumber = String(nextNumber).padStart(4, '0');
        return `USER${formattedNumber}`;
    } catch (error) {
        console.error('Error generating sequential userID:', error);
        throw error;
    }
};

// Password validation function
const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 6;

    if (!isLongEnough) {
        return { valid: false, message: "Password must be at least 6 characters long" };
    }
    if (!hasUpperCase) {
        return { valid: false, message: "Password must include at least one uppercase letter" };
    }
    if (!hasLowerCase) {
        return { valid: false, message: "Password must include at least one lowercase letter" };
    }
    if (!hasNumbers) {
        return { valid: false, message: "Password must include at least one number" };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: "Password must include at least one special character" };
    }

    return { valid: true };
};

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

//Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not exists" })
        }

        if (password === user.password) {
            const token = createToken(user.userID)
            // Return user data without password
            const userData = {
                userID: user.userID,
                name: user.name,
                email: user.email,
                phoneNum: user.phoneNum,
                address: user.address,
                profilePicture: user.profilePicture,
                cartData: user.cartData || []
            };

            res.json({
                success: true,
                token,
                user: userData
            })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, phoneNum, password} = req.body;

        // checking user already exist or not
        const exist = await userModel.findOne({ email })
        if (exist) {
            return res.json({ success: false, message: "User already exists" })
        }

        //validate email format & strong pass
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // Validate phone number if provided
        if (phoneNum) {
            const cleanPhoneNum = phoneNum.replace(/\D/g, '');
            if (cleanPhoneNum.length < 10 || cleanPhoneNum.length > 13) {
                return res.json({
                    success: false,
                    message: "Phone number must be between 10-13 digits"
                });
            }
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.json({ success: false, message: passwordValidation.message });
        }

        // Generate userID
        const userID = await generateSequentialUserID();

        const newUser = new userModel({
            userID,
            name,
            email,
            phoneNum: phoneNum ? phoneNum.replace(/\D/g, '') : '',
            password,
        //    address: address || '',
        //    profilePicture: '',
        //    cartData: []
        })

        const user = await newUser.save()
        const token = createToken(user.userID)

        // Return user data without password
        const userData = {
            userID: user.userID,
            name: user.name,
            email: user.email,
            phoneNum: user.phoneNum,
        //    address: user.address,
        //    profilePicture: user.profilePicture,
        //    cartData: user.cartData
        };

        // Send welcome email (non-blocking)
        try {
            await sendWelcomeEmail(user.email, user.name);
            console.log(`Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        res.json({ 
            success: true, 
            token,
            user: userData
        })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Get user's cart
const getUserCart = async (req, res) => {
    try {
        if (!req.user || !req.user.userID) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const user = await userModel.findOne({ userID: req.user.userID });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Ensure cartData is an array and has the correct structure
        const cartData = Array.isArray(user.cartData) ? user.cartData : [];

        res.status(200).json({
            success: true,
            cart: cartData
        });
    } catch (error) {
        console.error('Error in getUserCart:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching cart",
            error: error.message
        });
    }
};

// Update user's cart
const updateUserCart = async (req, res) => {
    try {
        if (!req.user || !req.user.userID) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const { cartData } = req.body;

        // Validate cartData
        if (!Array.isArray(cartData)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart data format"
            });
        }

        const user = await userModel.findOne({ userID: req.user.userID });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update cart data
        user.cartData = cartData;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart: user.cartData
        });
    } catch (error) {
        console.error('Error in updateUserCart:', error);
        res.status(500).json({
            success: false,
            message: "Error updating cart",
            error: error.message
        });
    }
};

//Update user's profile
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Handle GET request
        if (req.method === 'GET') {
            const user = await userModel.findOne({ userID: id }).select('-password');
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }
            return res.json({ 
                success: true, 
                user: user 
            });
        }

        // Handle PUT request
        if (req.method === 'PUT') {
            const { name, phoneNum, email, address, password } = req.body;

            const user = await userModel.findOne({ userID: id });
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            // Check if email is being changed and if it's already in use
            if (email && email !== user.email) {
                const emailExists = await userModel.findOne({ email });
                if (emailExists) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Email already in use" 
                    });
                }
            }

            // Validate phone number if provided
            if (phoneNum) {
                // Remove any non-digit characters
                const cleanPhoneNum = phoneNum.replace(/\D/g, '');
                
                // Check if the cleaned number is between 10-13 digits
                if (cleanPhoneNum.length < 10 || cleanPhoneNum.length > 13) {
                    return res.status(400).json({
                        success: false,
                        message: "Phone number must be between 10-13 digits"
                    });
                }
                
                // Update with cleaned phone number
                user.phoneNum = cleanPhoneNum;
            }

            // Update fields
            user.name = name || user.name;
            user.email = email || user.email;
            user.address = address || user.address;
            
            if (password) {
                // Validate password strength
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                    return res.status(400).json({ 
                        success: false, 
                        message: passwordValidation.message 
                    });
                }
                user.password = password;
            }

            if (req.file) {
                user.profilePicture = req.file.path;
            }

            await user.save();

            // Return user data without password
            const userData = user.toObject();
            delete userData.password;

            return res.json({ 
                success: true, 
                message: "Profile updated successfully", 
                user: userData 
            });
        }

        return res.status(405).json({ 
            success: false, 
            message: "Method not allowed" 
        });
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error" 
        });
    }
};

// Forgot Password - Request Reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email, phoneNum } = req.body;

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid email" 
            });
        }

        // Validate phone number
        const cleanPhoneNum = phoneNum.replace(/\D/g, '');
        if (cleanPhoneNum.length < 10 || cleanPhoneNum.length > 13) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be between 10-13 digits"
            });
        }

        // Check if user exists with both email and phone number
        const user = await userModel.findOne({ 
            email: email, 
            phoneNum: cleanPhoneNum 
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "No user found with this email and phone number combination" 
            });
        }

        // Check if email configuration is set up
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
            return res.status(500).json({ 
                success: false, 
                message: "Email service is not configured. Please contact support." 
            });
        }

        // Generate 4-digit PIN
        const pin = Math.floor(1000 + Math.random() * 9000).toString();

        // Delete any existing reset PINs for this user
        await resetPinModel.deleteMany({ email: email });

        // Save new reset PIN
        const resetPin = new resetPinModel({
            email: email,
            phoneNum: cleanPhoneNum,
            pin: pin
        });
        await resetPin.save();

        // Send password reset email using the email service
        try {
            await sendPasswordReset(email, user.name, pin);
            console.log(`Reset PIN sent successfully to ${email}`);
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Delete the saved PIN since email failed
            await resetPinModel.deleteOne({ _id: resetPin._id });
            return res.status(500).json({ 
                success: false, 
                message: "Failed to send email. Please check your email address and try again." 
            });
        }

        res.json({ 
            success: true, 
            message: "Reset PIN has been sent to your email" 
        });

    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error sending reset PIN. Please try again." 
        });
    }
};

// Forgot Password - Verify PIN
const verifyResetPin = async (req, res) => {
    try {
        const { email, phoneNum, pin } = req.body;

        // Validate inputs
        if (!email || !phoneNum || !pin) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, phone number, and PIN are required" 
            });
        }

        const cleanPhoneNum = phoneNum.replace(/\D/g, '');

        // Find the reset PIN
        const resetPin = await resetPinModel.findOne({ 
            email: email, 
            phoneNum: cleanPhoneNum, 
            pin: pin 
        });

        if (!resetPin) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid PIN or PIN has expired" 
            });
        }

        // Check if PIN is expired (additional check)
        const now = new Date();
        const pinAge = now - resetPin.createdAt;
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

        if (pinAge > tenMinutes) {
            await resetPinModel.deleteOne({ _id: resetPin._id });
            return res.status(400).json({ 
                success: false, 
                message: "PIN has expired. Please request a new one." 
            });
        }

        res.json({ 
            success: true, 
            message: "PIN verified successfully" 
        });

    } catch (error) {
        console.error('Error in verifyResetPin:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error verifying PIN. Please try again." 
        });
    }
};

// Forgot Password - Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, phoneNum, pin, newPassword } = req.body;

        // Validate inputs
        if (!email || !phoneNum || !pin || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, phone number, PIN, and new password are required" 
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                success: false, 
                message: passwordValidation.message 
            });
        }

        const cleanPhoneNum = phoneNum.replace(/\D/g, '');

        // Verify PIN first
        const resetPin = await resetPinModel.findOne({ 
            email: email, 
            phoneNum: cleanPhoneNum, 
            pin: pin 
        });

        if (!resetPin) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid PIN or PIN has expired" 
            });
        }

        // Check if PIN is expired
        const now = new Date();
        const pinAge = now - resetPin.createdAt;
        const tenMinutes = 10 * 60 * 1000;

        if (pinAge > tenMinutes) {
            await resetPinModel.deleteOne({ _id: resetPin._id });
            return res.status(400).json({ 
                success: false, 
                message: "PIN has expired. Please request a new one." 
            });
        }

        // Find and update user password
        const user = await userModel.findOne({ 
            email: email, 
            phoneNum: cleanPhoneNum 
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Delete the used reset PIN
        await resetPinModel.deleteOne({ _id: resetPin._id });

        res.json({ 
            success: true, 
            message: "Password has been reset successfully" 
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error resetting password. Please try again." 
        });
    }
};

export {
    loginUser,
    registerUser,
    getUserCart,
    updateUserCart,
    updateUserProfile,
    requestPasswordReset,
    verifyResetPin,
    resetPassword
}