const User = require('../models/user');
const Ship = require('../models/ship');

const express = require('express');
const bcrypt = require('bcryptjs');
const ErrorHandler = require('./error');
const authController = require("../controller/auth");
const {convertShip} = require("../util/util");
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
        const [storedUser] = await User.findByUsername(user.username);

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
        const [storedUser] = await User.findByUsername(username);

        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }
        const isEqual = await bcrypt.compare(req.body.password, storedUser[0].password);

        if (!isEqual) {
            return ErrorHandler.getUnauthorized(res, 'Incorrect password');
        }
        const token = await authController.getToken(storedUser[0]);
        return res.status(200).json({ token: token });

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error login user');
    }
});


router.patch('/:userId/password', authController.verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    if (oldPassword === undefined || newPassword === undefined) {
        return ErrorHandler.getBadRequest(res);
    }
    try {
        const [storedUser] = await User.findByUserId(userId);
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }

        const isEqual = await bcrypt.compare(oldPassword, storedUser[0].password);
        if (!isEqual) {
            return res.status(401).json({ error: 'Incorrect old password' });
        }

        const hashedPassword = await authController.hashPassword(newPassword);
        await User.updatePassword(hashedPassword, userId);
        return res.status(200).json({message: 'Password updated'});
    }
    catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error updating password');
    }
});


router.get('/:username/username', async (req, res) => {
    const username = req.params.username;

    try {
        const [storedUser] = await User.findByUsername(username);
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }
        return res.status(200).json( { username : storedUser[0].username} );

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error retrieving username');
    }
});


router.get('/:email/email', async (req, res) => {
    const email = req.params.email;

    try {
        const [storedUser] = await User.findByEmail(email);
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }
        return res.status(200).json( { email : storedUser[0].email} );

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error retrieving email');
    }
});


router.delete('/:userId', authController.verifyToken, async (req, res) => {
    try {
        const [storedUser] = await User.findByUserId(req.params.userId);

        if (storedUser.length <= 0) {
            return res.status(204).json({message: "User not found"});
        }
        const deleteResponse = User.deleteUser(req.params.userId);
        return res.status(200).json(deleteResponse);

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error);
    }
});



router.post('/:userId/histories', authController.verifyToken, async (req, res) => {

    const userId = req.params.userId;
    const gameDetails = req.body;

    if (gameDetails.username === undefined || gameDetails.totalHits === undefined ||
        gameDetails.timeConsumed === undefined || gameDetails.result === undefined ) {
        return ErrorHandler.getBadRequest(res);
    }
    try {
        const [storedUser] = await User.findByUserId(userId);

        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, "User not found");
        }
        await User.saveGameDetails(gameDetails, userId, new Date());
        return res.status(201).json( {message: 'game details created'} );

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error);
    }
});

router.get('/:userId/histories', authController.verifyToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        const [storedUser] = await User.findByUserId(userId);
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'User not found');
        }
        const [gameHistory] = await User.findGameDetailsByUserId(userId);
        return res.status(200).json(gameHistory);

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error retrieving game history');
    }
});


router.get('/histories', async (req, res) => {

    try {
        const [storedUser] = await User.retrieveRanking();
        if (storedUser.length <= 0) {
            return ErrorHandler.getNotFound(res, 'Ranking not found');
        }
        return res.status(200).json(storedUser);

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error retrieving game history');
    }
});

//================================================================ GAME ==========================================================================================

router.post('/:userId/games/save', authController.verifyToken, async (req, res) => {
    const game = req.body.game;
    const userId = req.params.userId;

    if (game === undefined || game.name === undefined || game.fireDirection === undefined ||
        game.totalPlayerHits === undefined || game.previousShots === undefined) {
        return ErrorHandler.getBadRequest(res);
    }
    try {
        const gameId = await Ship.saveGame(game, userId, new Date());
        return res.status(201).json({message: 'Ship saved', gameId: gameId});
    }
    catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error saving game');
    }
});



router.get('/:userId/games/:gameId', authController.verifyToken, async (req, res) => {
    const userId = req.params.userId;
    const gameId = req.params.gameId;

    try {
        let game = await Ship.findGamesByUserIdAndGameId(userId, gameId);
        if (!game) {
            return ErrorHandler.getNotFound(res, 'Game not found');
        }
        const [storedSelfShip] = await Ship.findByGameId(gameId, 'self_ships');
        const [storedRivalShip] = await Ship.findByGameId(gameId, 'rival_ships');

        const [storedSelfBoard] = await Ship.findByGameId(gameId, 'self_board');
        const [storedRivalBoard] = await Ship.findByGameId(gameId, 'rival_board');

        const [storedPreviousShots] = await Ship.findByGameId(gameId, 'previous_shots');

        const [storedGame] = await Ship.findGameByGameId(gameId);

        if (storedSelfShip.length <= 0 || storedRivalShip.length <= 0) {
            return ErrorHandler.getNotFound(res, 'Ship not found');
        }
        for (let i = 0; i < storedSelfShip.length; i++) {
            convertShip(storedSelfShip[i]);
            convertShip(storedRivalShip[i]);
        }

        return res.status(200).json(
            { ships : [storedSelfShip, storedRivalShip],
                selfBoard : storedSelfBoard,
                rivalBoard : storedRivalBoard,
                previousShots : storedPreviousShots,
                gameData : storedGame
            });
    }
    catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error retrieving game by id');
    }
});


router.get('/:userId/games', authController.verifyToken, async (req, res) => {
    const userId = req.params.userId;

    try {
        const [storedGames] = await Ship.findGamesByUserId(userId);

        if (storedGames.length <= 0) {
            return ErrorHandler.getNotFound(res, 'Game not found');
        }
        return res.status(200).json(storedGames);
    }
    catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error, 'Error retrieving games');
    }
});


router.delete('/:userId/games/:gameId', authController.verifyToken, async (req, res) => {
    try {
        const [storedUser] = await User.findByUserId(req.params.userId);
        const [storedGame] = await Ship.findGameByGameId(req.params.gameId);

        if (storedUser.length <= 0) {
            return res.status(404).json({message: "User not found"});
        }
        if (storedGame.length <= 0) {
            return res.status(204).json({message: "User not found"});
        }
        const deleteResponse = Ship.deleteGameByGameId(req.params.gameId);
        return res.status(200).json(deleteResponse);

    } catch (error) {
        console.log(error);
        return ErrorHandler.getInternalError(res, error);
    }
});


module.exports = router;