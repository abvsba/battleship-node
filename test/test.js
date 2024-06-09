const request = require('supertest');
const server = require('../index.js');
const User = require("../models/user");

const users = [
    new User('user1', 'user1@example.com', 'test'),
    new User('user2', 'user2@example.com', 'test'),
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

    });


    describe('Login tests', () => {

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

        test("Login user", async () => {
            const response = await request(server).post("/user/login").send({
                username: users[0].username,
                password: users[0].password
            })
            expect(response.statusCode).toBe(200);
        })

    });

});