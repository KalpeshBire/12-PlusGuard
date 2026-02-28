const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

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
// @desc    Google Sign-In / Register (with access_token)
// @access  Public
router.post('/google', async (req, res) => {
    const { tokenId: accessToken } = req.body;

    try {
        // Fetch user profile from Google using the access token
        const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
        
        const { name, email, sub: googleId, picture: avatar } = googleRes.data;

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
        console.error('Google Auth Error:', err.response?.data || err.message);
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
