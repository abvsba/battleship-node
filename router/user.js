
const User = require('../models/user');

const express = require('express');
const bcrypt = require('bcryptjs');
const ErrorHandler = require('./error');
const authController = require("../controller/auth");
const router = express.Router();


router.post('/signup', async (req, res) => {

    let user = req.body;
    if (user.username === undefined || user.email === undefined || user.password === undefined) {
        return ErrorHandler.getBadRequest(res);
    }
    try {
        if (user.username == null) {
            return ErrorHandler.getBadRequest(res, 'Bad request')
        }
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

    let username = req.body.username;
    if (username === undefined) {
        return ErrorHandler.getBadRequest(res);
    }
    try {
        const [storedUser] = await User.find(username);
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


router.patch('/:username/password', authController.verifyToken, async (req, res) => {
    const username = req.params.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    if (username === undefined || oldPassword === undefined || newPassword === undefined) {
        return ErrorHandler.getBadRequest(res);
    }
    try {
        const [storedUser] = await User.find(username);
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }

        const isEqual = await bcrypt.compare(oldPassword, storedUser[0].password);
        if (!isEqual) {
            return res.status(401).json({ error: 'Incorrect old password' });
        }

        const hashedPassword = await authController.hashPassword(newPassword);
        await User.updatePassword(hashedPassword, username);
        return res.status(200).json({message: 'Password updated'});
    }
    catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error updating password');
    }
});


router.get('/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const [storedUser] = await User.find(username);
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }
        return res.status(200).json( { username : storedUser[0].username} );

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error retrieving user');
    }
});

module.exports = router;
