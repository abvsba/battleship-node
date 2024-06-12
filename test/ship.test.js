
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


        test("Save ship without authorization", async () => {
            const response = await request(server).post(`/users/${decoded.id}/games/save`).send({game : game})
            expect(response.statusCode).toBe(401);
        })

        test("Save ship bad request", async () => {
            const response = await request(server).post(`/users/${decoded.id}/games/save`)
                .set('Authorization', token);

            expect(response.statusCode).toBe(400);
        })

        test("Save ship", async () => {
            const response = await request(server).post(`/users/${decoded.id}/games/save`).send({game : game})
                .set('Authorization', token);

            gameId = response.body.gameId;
            expect(response.statusCode).toBe(201);
        })

    });


    test("delete content from all table from database", async () => {
        await Ship.deleteAllTable()
    })

})







