
const User = require('../models/user');

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
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error creating user');
    }
});

router.post('/login', async (req, res) => {
    try {
        const [storedUser] = await User.find(req.body.username);
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }

        const isEqual = await bcrypt.compare(req.body.password, storedUser[0].password);

        if (!isEqual) {
            return ErrorHandler.getUnauthorized(res, 'Incorrect password');
        }

        const token = await authController.getToken(storedUser[0]);
        return res.status(200).json(
            {token: token, username: storedUser[0].username, email: storedUser[0].email});

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error login user');
    }
});

module.exports = router;
