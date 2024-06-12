const request = require('supertest');
const server = require('../index.js');
const User = require("../models/user");
const {decode} = require("jsonwebtoken");

const users = [
    new User('user1', 'user1@example.com', 'test'),
    new User('user2', 'user2@example.com', 'test'),
    new User('user4', 'user4@example.com', 'test'),
    new User('user5', 'user5@example.com', 'test'),
]

describe('User workflow tests', () => {

    describe('Resgiter tests', () => {

        test('Register new user', async () => {

            const response = await request(server).post('/users/signup').send(users[0]);
            expect(response.statusCode).toBe(201);
        });

        test('Conflict username', async () => {

            const response = await request(server).post('/users/signup').send(users[0]);
            expect(response.statusCode).toBe(409);
        });

        test('Resgiter user bad request', async () => {
            const response = await request(server).post('/users/signup').send(users[0].username);
            expect(response.statusCode).toBe(400);
        });

    });


    describe('Login tests', () => {

        test("Login user", async () => {
            const response = await request(server).post("/users/login").send({
                username: users[0].username,
                password: users[0].password
            })
            expect(response.statusCode).toBe(200);
        })

        test("Login user bad request", async () => {
            const response = await request(server).post("/users/login")
            expect(response.statusCode).toBe(400);
        })

        test('Register new user', async () => {
            const response = await request(server).post('/users/signup').send(users[3]);
            expect(response.statusCode).toBe(201);
        });

        test("Incorrect credentials", async () => {
            const response = await request(server).post("/users/login").send({
                username: users[0].username,
                password: 'incorrectPassword'
            })
            expect(response.statusCode).toBe(401);
        })

        test("User not found", async () => {
            const response = await request(server).post("/users/login").send({
                username: 'noExist',
                password: users[0].password
            })
            expect(response.statusCode).toBe(404);
        })

    });

    describe('Check get user', () => {

        test("Get user", async () => {
            const response = await request(server).get(`/users/${users[0].username}`);
            expect(response.statusCode).toBe(200);
        })

        test("Get user not found", async () => {
            const response = await request(server).get('/users/noExist');
            expect(response.statusCode).toBe(404);
        })

    });


    describe('Change password - workflow tests', () => {
        let token, decoded;

        test('Register new user', async () => {
            const response = await request(server).post('/users/signup').send(users[2]);
            expect(response.statusCode).toBe(201);
        });

        test("Login user", async () => {
            const response = await request(server).post("/users/login").send({
                username: users[2].username,
                password: users[2].password
            })
            token = response.body.token;
            decoded = decode(token);
            expect(response.statusCode).toBe(200);
        })

        test("User not found when change password", async () => {
            const response = await request(server).patch(`/users/noExist/password`).send({
                oldPassword : users[2].password,
                newPassword: users[2].password
            }).set('Authorization', token);
            expect(response.statusCode).toBe(404);
        })

        test("Change password bad request", async () => {
            const response = await request(server).patch(`/users/${decoded.id}/password`).set('Authorization', token);
            expect(response.statusCode).toBe(400);
        })

        test("Change password without authorization", async () => {
            const response = await request(server).patch(`/users/${decoded.id}/password`).send({
                oldPassword : users[2].password,
                newPassword: users[2].password
            })
            expect(response.statusCode).toBe(401);
        })

        test("User incorrect old password", async () => {
            const response = await request(server).patch(`/users/${decoded.id}/password`).send( {
                oldPassword : 'incorrectOldPassword',
                newPassword : 'newPassword'
            } ).set('Authorization', token);

            expect(response.statusCode).toBe(401);
        })

        test("Change password 1", async () => {
            const response = await request(server).patch(`/users/${decoded.id}/password`).send({
                oldPassword : users[2].password,
                newPassword : 'newPassword'
            }).set('Authorization', token);

            expect(response.statusCode).toBe(200);
        })

        test("Login user changed password", async () => {
            const response = await request(server).post(`/users/login`).send({
                username: users[2].username,
                password: 'newPassword'
            })
            expect(response.statusCode).toBe(200);
        })

        test("Change password 2", async () => {
            const response = await request(server).patch(`/users/${decoded.id}/password`).send({
                oldPassword : 'newPassword',
                newPassword : users[2].password,
            }).set('Authorization', token);

            expect(response.statusCode).toBe(200);
        })

    });


    describe('Register, login and delete user - workflow tests', () => {

        let token, decoded;

        test('Register new user', async () => {
            const response = await request(server).post('/users/signup').send(users[1]);
            expect(response.statusCode).toBe(201);
        });

        test("Login user", async () => {
            const response = await request(server).post("/users/login").send({
                username: users[1].username,
                password: users[1].password
            })
            token = response.body.token;
            decoded = decode(token);
            expect(response.statusCode).toBe(200);
        })

        test("Delete user - expected 200", async () => {
            const response = await request(server).delete(`/users/${decoded.id}`)
            expect(response.statusCode).toBe(401);
        })

        test("Delete user - expected 200", async () => {
            const response = await request(server).delete(`/users/${decoded.id}`).set('Authorization', token);
            expect(response.statusCode).toBe(200);
        })

        test("Delete user - expected 204", async () => {
            const response = await request(server).delete(`/users/${decoded.id}`).set('Authorization', token);
            expect(response.statusCode).toBe(204);
        })
    });


    test("truncate user table from database", async () => {
        await User.deleteUsersFromTable();
    })


});