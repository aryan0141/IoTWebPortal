const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require("../config/auth");

// Load User model
const User = require('../models/User');
const SelectUser = require('../models/SelectUser');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email });
        if (!findUser) { // If no such user found
            return res.status(400).json({
                status: 400,
                msg: 'Invalid Credentials'
            });
        }
        const isMatch = await bcryptjs.compare(password, findUser.password);
        if (!isMatch) {
            return res.status(400).json({
                status: 400,
                msg: 'Invalid Credentials'
            });
        }
        const payload = { user: findUser };
        jwt.sign(payload, 'jwtsecret', { expiresIn: 10800 }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                expires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ),
                // httpOnly: true,
                // secure: true
            });
            return res.status(200).json({
                status: 200,
                msg: 'User Logged in'
            });
        })

    } catch (err) {
        return res.status(500).json({
            msg: 'Internal Server Error',
            err
        });
    }
})


// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (password.length < 6) {
        return res.status(400).json({
            status: 400,
            msg: 'Password must be at least 6 charcters long'
        })
    }
    try {
        const findUserFromSelect = await SelectUser.findOne({ email });
        if (!findUserFromSelect) {
            return res.status(400).json({
                status: 400,
                msg: 'You are not authorised by Org. Head/Admin'
            })
        }
        const findUser = await User.findOne({ email });
        if (findUser) { // If user already exists
            return res.status(400).json({
                status: 400,
                msg: 'User already exists'
            })
        }


        const newUser = new User({
            name,
            email,
            password,
            type: findUserFromSelect.type
        });

        const salt = await bcryptjs.genSalt(10);
        newUser.password = await bcryptjs.hash(password, salt);
        const savedUser = await newUser.save();
        const payload = { user: savedUser };
        jwt.sign(payload, 'jwtsecret', { expiresIn: 10800 }, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                expires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ),
                // httpOnly: true,
                // secure: true
            });
            return res.status(201).json({
                status: 200,
                msg: 'User Created'
            });
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            msg: 'Internal Server Error',
            err
        });
    }
})

// Get my details
router.get('/me', auth, async (req, res) => {
    try {
        const myDetails = await User.findById(req.user._id).select('-__v -password');
        return res.status(200).json(myDetails);
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            msg: 'Internal Server Error',
            err
        });
    }
})

// Get all users.
router.get('/getAllUsers', async (req, res) => {
    try {
        const details = await User.find().select('-__v -password');
        return res.status(200).json(details);
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            msg: 'Internal Server Error',
            err
        });
    }
})

// Logout User
router.get('/logout', auth, async (req, res) => {
    try {
        res.cookie('token', 'loggedout', {
            expires: new Date(Date.now() + 1 * 1000),
            httpOnly: true,
        });
        res.status(200).json({ status: 'success' });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            msg: 'Internal Server Error',
            err
        });
    }
})

module.exports = router;