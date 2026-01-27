// routes/authRoutes.js - Extended authentication routes
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers'; // Static import
import User from '../models/User.js';
import { JWT_SECRET } from '../config/index.js';
import { AuditService } from '../services/auditService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register - Register new user (password-based)
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role = 'citizen' } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate server-managed wallet
        const wallet = ethers.Wallet.createRandom();

        // Create user
        const user = new User({
            email: email.toLowerCase(),
            passwordHash,
            name,
            role,
            verified: false,
            walletAddress: wallet.address,
            privateKey: wallet.privateKey
        });

        await user.save();

        // Log action
        await AuditService.logAction({
            userId: user._id,
            role: user.role,
            action: 'USER_REGISTERED',
            details: { email: user.email, name: user.name },
            req
        });

        res.status(201).json({
            message: 'User registered successfully',
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error details:', error); // Detailed logging
        res.status(500).json({
            error: 'Registration failed',
            details: error.message // Return details to frontend for debugging
        });
    }
});

/**
 * POST /api/auth/login - Login with email/password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                sub: user._id.toString(),
                role: user.role,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Log action
        await AuditService.logAction({
            userId: user._id,
            wallet: user.walletAddress,
            role: user.role,
            action: 'LOGIN',
            details: { email: user.email },
            req
        });

        // Set httpOnly cookie (optional)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/logout - Logout and clear cookie
 */
router.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me - Get current user info
 */
router.get('/me', requireAuth([]), async (req, res) => {
    try {
        const user = await User.findById(req.user.sub).select('-passwordHash').lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                verified: user.verified,
                walletAddress: user.walletAddress,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

export default router;
