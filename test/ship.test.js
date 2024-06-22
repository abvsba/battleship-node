
const request = require('supertest');
const server = require('../index.js');
const Ship = require("../models/ship");
const User = require("../models/user");
const {decode} = require("jsonwebtoken");

const rivalShips = [
    new Ship('carrier', 5, true, true, 0, {row: 0, col: 1}),
    new Ship('submarine', 3, false, true, 0, {row: 2, col: 1}),
];

const selfShips = [
    new Ship('battleship', 4, false, false, 0, {row: 0, col: 0}),
    new Ship('patrolBoat', 2, false, true, 1, {row: 1, col: 1}),
];

const selfBoard = [ { row : 0, col : 0, hit: 'miss' }, { row: 1, col: 1 , hit: 'boom'}];
const rivalBoard =[ { row : 2, col : 2 , hit: 'miss'}];

const previousShots = [ { row : 0, col : 0}];

const user = new User('user3', 'user3@example.com', 'test');

const game = {
    name : 'test',
    selfShips: selfShips,
    rivalShips: rivalShips,
    selfBoard : selfBoard,
    rivalBoard : rivalBoard,
    totalPlayerHits : 10,
    fireDirection : 0,
    previousShots : previousShots
}

const game2 = {
    name : 'test',
    selfShips: [],
    rivalShips: rivalShips,
    selfBoard : selfBoard,
    rivalBoard : rivalBoard,
    totalPlayerHits : 10,
    fireDirection : 0,
    previousShots : previousShots
}

describe('Run ship test', () => {

    describe('Save ship workflow tests', () => {
        let token, gameId, decoded;

        test('Register new user', async () => {
            const response = await request(server).post('/users/signup').send(user);
            expect(response.statusCode).toBe(201);
        });


        test("Login user", async () => {
            const response = await request(server).post("/users/login").send({
                username: user.username,
                password: user.password
            })
            token = response.body.token;
            decoded = decode(token);
            expect(response.statusCode).toBe(200);
        })

        test("Retrieve list game without authorization", async () => {
            const response = await request(server).get(`/users/${decoded.id}/games/`);
            expect(response.statusCode).toBe(401);
        })

        test("Not found game", async () => {
            const response = await request(server).get(`/users/${decoded.id}/games/1000`).set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

        test("Not found user", async () => {
            const response = await request(server).get(`/users/noExist/games/1`).set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

        test("Not found game list", async () => {
            const response = await request(server).get(`/users/${decoded.id}/games`).set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

        test("Save game - expected 401", async () => {
            const response = await request(server).post(`/users/${decoded.id}/games/save`).send({game : game})
            expect(response.statusCode).toBe(401);
        })

        test("Save game - expected 400", async () => {
            const response = await request(server).post(`/users/${decoded.id}/games/save`)
                .set('Authorization', token);

            expect(response.statusCode).toBe(400);
        })

        test("Save game", async () => {
            const response = await request(server).post(`/users/${decoded.id}/games/save`).send({game : game})
                .set('Authorization', token);

            gameId = response.body.gameId;
            expect(response.statusCode).toBe(201);
        })


        test("Save game - not found user", async () => {
            const response = await request(server).post("/users/notFound/games/save").send({game : game})
                .set('Authorization', token);

            expect(response.statusCode).toBe(404);
        })

        test("Retrieve game - user not found", async () => {
            const response = await request(server).get(`/users/noExixte/games/${gameId}`).set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

        test("Retrieve game - expected 401", async () => {
            const response = await request(server).get(`/users/${decoded.id}/games/${gameId}`)
            expect(response.statusCode).toBe(401);
        })

        test("Retrieve game list", async () => {
            const response = await request(server).get(`/users/${decoded.id}/games`).set('Authorization', token);
            expect(response.statusCode).toBe(200);
        })

        test("Retrieve game list - user not found", async () => {
            const response = await request(server).get(`/users/noExixte/games`).set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

        test("Retrieve game", async () => {
            const response = await request(server).get(`/users/${decoded.id}/games/${gameId}`)
                .set('Authorization', token);
            expect(response.statusCode).toBe(200);
        })

        test("Delete game - user not found", async () => {
            const response = await request(server).delete(`/users/noExiste/games/${gameId}`)
                .set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

        test("Delete game - expected 401", async () => {
            const response = await request(server).delete(`/users/${decoded.id}/games/${gameId}`)
            expect(response.statusCode).toBe(401);
        })

        test("Delete game - expected 200", async () => {
            const response = await request(server).delete(`/users/${decoded.id}/games/${gameId}`)
                .set('Authorization', token);
            expect(response.statusCode).toBe(200);
        })

        test("Delete game - expected 204", async () => {
            const response = await request(server).delete(`/users/${decoded.id}/games/${gameId}`)
                .set('Authorization', token);
            expect(response.statusCode).toBe(204);
        })

        test("Save game 2", async () => {
            const response = await request(server).post(`/users/${decoded.id}/games/save`).send({game : game2})
                .set('Authorization', token);

            gameId = response.body.gameId;
            expect(response.statusCode).toBe(201);
        })

        test("Not found ship in game", async () => {
            const response = await request(server).get(`/game/${gameId}`).set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

    });


    test('Delete content from user table', async () => {
        await User.deleteUserFromTable();
    })

})







