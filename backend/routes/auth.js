const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_token_key',
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_token_key',
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/google
// @desc    Google Sign-In / Register 
// @access  Public
router.post('/google', async (req, res) => {
    // The frontend passes the payload from useGoogleLogin
    const googlePayload = req.body;
    console.log("Full Google payload received from frontend:", JSON.stringify(googlePayload, null, 2));
    
    // The implicit flow usually returns access_token, but let's be safe
    const access_token = googlePayload.access_token || googlePayload.credential;

    if (!access_token) {
        console.error("No access_token or credential found in the payload");
        return res.status(400).json({ msg: 'Google Auth failed - No token found' });
    }

    try {
        console.log("Fetching Google user info with token/credential...");
        
        let payloadFromGoogle;
        
        if (googlePayload.credential) {
            // It's an ID Token (from new official GoogleLogin component)
            const googleResponse = await axios.get(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${googlePayload.credential}`
            );
            payloadFromGoogle = googleResponse.data;
        } else {
            // It's an access_token (from implicit flow)
            const googleResponse = await axios.get(
                `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
            );
            payloadFromGoogle = googleResponse.data;
        }
        
        const { name, email, sub: googleId, picture: avatar } = payloadFromGoogle;

        let user = await User.findOne({ 
            $or: [
                { googleId },
                { email }
            ]
        });

        if (user) {
            // Update user if they didn't have googleId or avatar
            if (!user.googleId) user.googleId = googleId;
            if (!user.avatar) user.avatar = avatar;
            await user.save();
        } else {
            // Create new user (password-less)
            user = new User({
                name,
                email,
                googleId,
                avatar
            });
            await user.save();
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_token_key',
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
            }
        );
    } catch (err) {
        console.error('Google Auth Error Full Object:', err);
        console.error('Google Auth Error Message:', err.message);
        console.error('Token Received:', access_token);
        res.status(400).json({ msg: 'Google Auth failed' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password stub
// @access  Public
router.post('/forgot-password', async (req, res) => {
    // Stub implementation
    res.json({ msg: 'Password reset link sent to email (stubbed).' });
});

module.exports = router;
