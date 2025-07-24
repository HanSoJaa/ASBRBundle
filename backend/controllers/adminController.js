import validator from "validator";
import jwt from "jsonwebtoken"
import adminModel from "../models/adminModel.js";
import 'dotenv/config'

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

//Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await adminModel.findOne({ email });

        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        if (password === admin.password) {
            const token = createToken(admin._id);
            res.json({
                success: true,
                token,
                role: admin.role,
                adminData: {
                    adminID: admin.adminID,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Helper function to generate sequential ID for ADMIN & OWNER
const generateSequentialId = async (role) => {
    try {
        // Find the last admin/owner based on role
        const lastUser = await adminModel.findOne({ role: role })
            .sort({ adminID: -1 }) // Sort by adminID in descending order
            .limit(1);

        let prefix = role === 'owner' ? 'OWN' : 'ADM';
        let lastNumber = 0;

        if (lastUser && lastUser.adminID) {
            // Extract the number from the last ID
            const matches = lastUser.adminID.match(/\d+$/);
            if (matches) {
                lastNumber = parseInt(matches[0]);
            }
        }

        // Generate new number (increment by 1)
        const newNumber = lastNumber + 1;

        // Format the number to have leading zeros (001, 002, etc.)
        const formattedNumber = String(newNumber).padStart(3, '0');

        return `${prefix}${formattedNumber}`;
    } catch (error) {
        console.error('Error generating sequential ID:', error);
        throw error;
    }
};

// Add new admin (only owner can do this)
const addAdmin = async (req, res) => {
    try {
        // Check if the requesting user is an owner
        if (req.admin?.role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Only owners can add new admins' });
        }

        const { name, phoneNum, email, password, role, address } = req.body;

        // Check if admin already exists
        const exist = await adminModel.findOne({ email });
        if (exist) {
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email' });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ success: false, message: passwordValidation.message });
        }

        // Validate phone number if provided
        if (phoneNum) {
            const cleanPhoneNum = phoneNum.replace(/\D/g, '');
            if (cleanPhoneNum.length < 10 || cleanPhoneNum.length > 13) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number must be between 10-13 digits"
                });
            }
        }

        // Generate sequential adminID based on role
        const adminID = await generateSequentialId(role || 'admin');

        const newAdmin = new adminModel({
            adminID,
            name,
            phoneNum: phoneNum ? phoneNum.replace(/\D/g, '') : '',
            email,
            password,
            role: role || 'admin',
            address,
            profilePicture: req.file?.path || ''
        });

        const admin = await newAdmin.save();

        // Return admin data without password
        const adminData = admin.toObject();
        delete adminData.password;

        res.status(201).json({
            success: true,
            message: 'Admin added successfully',
            admin: adminData
        });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding admin',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// Get all admins (only owner can do this)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await adminModel.find({}, '-password');
        res.json({ success: true, admins });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update admin profile (handles both owner updating any admin and admin updating their own profile)
const updateAdminProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const isOwnerRoute = req.originalUrl.includes('/admin/');
        const isAdminSelfRoute = req.originalUrl.includes('/adminProfile/');

        // Handle GET request
        if (req.method === 'GET') {
            let admin;
            
            if (isOwnerRoute) {
                // Owner route: find by _id (can update any admin)
                admin = await adminModel.findById(id);
            } else if (isAdminSelfRoute) {
                // Admin self-edit route: find by adminID and role 'admin'
                admin = await adminModel.findOne({ adminID: id, role: 'admin' });
            }
            
            if (!admin) {
                return res.json({ success: false, message: "Admin not found" });
            }
            return res.json({ success: true, admin });
        }

        // Handle PUT request
        if (req.method === 'PUT') {
            const { name, phoneNum, email, address, role, password } = req.body;
            let admin;
            
            if (isOwnerRoute) {
                // Owner route: find by _id (can update any admin)
                admin = await adminModel.findById(id);
            } else if (isAdminSelfRoute) {
                // Admin self-edit route: find by adminID and role 'admin'
                admin = await adminModel.findOne({ adminID: id, role: 'admin' });
            }
            
            if (!admin) {
                return res.json({ success: false, message: "Admin not found" });
            }

            // Check if email is being changed and if it's already in use
            if (email && email !== admin.email) {
                const emailExists = await adminModel.findOne({ email });
                if (emailExists) {
                    return res.json({ success: false, message: "Email already in use" });
                }
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
                admin.phoneNum = cleanPhoneNum;
            }

            // Validate password if provided
            if (password) {
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                    return res.json({ 
                        success: false, 
                        message: passwordValidation.message 
                    });
                }
                admin.password = password;
            }

            // Update fields if provided
            if (name) admin.name = name;
            if (email) admin.email = email;
            if (address) admin.address = address;
            
            // Only allow role update if it's the owner route
            if (role && isOwnerRoute) {
                admin.role = role;
            }
            
            if (req.file) {
                admin.profilePicture = req.file.path;
            }

            await admin.save();

            // Return admin data without password
            const adminData = admin.toObject();
            delete adminData.password;

            return res.json({
                success: true,
                message: "Profile updated successfully",
                admin: adminData
            });
        }

        return res.json({ success: false, message: "Method not allowed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete admin (only owner can do this)
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await adminModel.findById(id);

        if (!admin) {
            return res.json({ success: false, message: "Admin not found" });
        }

        if (admin.role === 'owner') {
            return res.json({ success: false, message: "Cannot delete owner account" });
        }

        await adminModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Admin deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update owner profile
const updateOwnerProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Handle GET request
        if (req.method === 'GET') {
            const owner = await adminModel.findOne({ adminID: id, role: 'owner' });
            if (!owner) {
                return res.json({ success: false, message: "Owner not found" });
            }
            return res.json({ success: true, admin: owner });
        }

        // Handle PUT request
        if (req.method === 'PUT') {
            const { name, phoneNum, email, address, password } = req.body;

            const owner = await adminModel.findOne({ adminID: id, role: 'owner' });
            if (!owner) {
                return res.json({ success: false, message: "Owner not found" });
            }

            // Check if email is being changed and if it's already in use
            if (email && email !== owner.email) {
                const emailExists = await adminModel.findOne({ email });
                if (emailExists) {
                    return res.json({ success: false, message: "Email already in use" });
                }
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
                owner.phoneNum = cleanPhoneNum;
            }

            // Validate password if provided
            if (password) {
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                    return res.json({ 
                        success: false, 
                        message: passwordValidation.message 
                    });
                }
                owner.password = password;
            }

            // Update fields if provided
            if (name) owner.name = name;
            if (email) owner.email = email;
            if (address) owner.address = address;
            if (req.file) {
                owner.profilePicture = req.file.path;
            }

            await owner.save();

            // Return owner data without password
            const ownerData = owner.toObject();
            delete ownerData.password;

            return res.json({
                success: true,
                message: "Profile updated successfully",
                admin: ownerData
            });
        }

        return res.json({ success: false, message: "Method not allowed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    adminLogin,
    addAdmin,
    getAllAdmins,
    updateAdminProfile,
    deleteAdmin,
    updateOwnerProfile,
}