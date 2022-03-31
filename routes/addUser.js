const express = require("express");
const route = express.Router();
const SelectUser = require("../models/SelectUser");
const auth = require("../config/auth");

// Add User by Admin or Organisation Head
route.post('/addUser', auth, async (req, res) => {

    const { email, type } = req.body;

    try {
        const findUser = await SelectUser.findOne({ email });

        if (findUser) {
            return res.status(400).json({ status: 400, msg: 'Email already exists' });
        }

        const newUser = new SelectUser({
            user: req.user._id,
            email,
            type
        });

        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ msg: 'Internal server error' });
    }
})


// Get parent User for a User
route.post("/parentUser", auth, async (req, res) => {
    const { email } = req.body;
    try {
        const findUser = await SelectUser.findOne({ email });

        if (!findUser) {
            return res.status(400).json({ status: 400, msg: 'No such user exists' });
        }
        const parentId = findUser.user;
        return res.status(200).json({ user: parentId });
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ msg: 'Internal server error' });
    }
})

module.exports = route;