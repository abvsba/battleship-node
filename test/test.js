const request = require('supertest');
const server = require('../index.js');
const User = require("../models/user");

const users = [
    new User('user1', 'user1@example.com', 'test'),
    new User('user2', 'user2@example.com', 'test'),
    new User('user4', 'user4@example.com', 'test'),
    new User('user5', 'user5@example.com', 'test'),
]

describe('User workflow tests', () => {

    describe('Resgiter tests', () => {

        test('Register new user', async () => {

            const response = await request(server).post('/user/signup').send(users[0]);
            expect(response.statusCode).toBe(201);
        });

        test('Conflict username', async () => {

            const response = await request(server).post('/user/signup').send(users[0]);
            expect(response.statusCode).toBe(409);
        });

        test('Resgiter user bad request', async () => {
            const response = await request(server).post('/user/signup').send(users[0].username);
            expect(response.statusCode).toBe(400);
        });

    });


    describe('Login tests', () => {

        test("Login user", async () => {
            const response = await request(server).post("/user/login").send({
                username: users[0].username,
                password: users[0].password
            })
            expect(response.statusCode).toBe(200);
        })

        test("Login user bad request", async () => {
            const response = await request(server).post("/user/login")
            expect(response.statusCode).toBe(400);
        })

        test('Register new user', async () => {
            const response = await request(server).post('/user/signup').send(users[3]);
            expect(response.statusCode).toBe(201);
        });

        test("Incorrect credentials", async () => {
            const response = await request(server).post("/user/login").send({
                username: users[0].username,
                password: 'incorrectPassword'
            })
            expect(response.statusCode).toBe(401);
        })

        test("User not found", async () => {
            const response = await request(server).post("/user/login").send({
                username: 'noExist',
                password: users[0].password
            })
            expect(response.statusCode).toBe(404);
        })

    });

});