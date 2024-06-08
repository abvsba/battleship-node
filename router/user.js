
const User = require('../models/user');

const bcrypt = require('bcryptjs');
const express = require('express');

const ErrorHandler = require('./error');
const authController = require("../controller/auth");
const router = express.Router();



router.post('/signup', async (req, res) => {
    let user = req.body;
    try {
        const [storedUser] = await User.find(user.username);

        if (storedUser.length > 0) {
            return ErrorHandler.getConflictError(res, `Name ${user.username} already exists`)
        }

        const userWithHashPassword = await authController.userWithHashedPassword(user);
        await User.save(userWithHashPassword);
        return res.status(201).json({message: 'User created', user: user});

    } catch (error) {
        return ErrorHandler.getInternalError(res, error, 'Error creating user');
    }
});

