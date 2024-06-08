const request = require('supertest');
const server = require('../index.js');
const User = require("../models/user");

const users = [
    new User('user1', 'user1@example.com', 'test'),
    new User('user2', 'user2@example.com', 'test'),
]

describe('Register workflow tests', () => {
    test('Register new user', async () => {

        const response = await request(server).post('/user/signup').send(users[0]);
        expect(response.statusCode).toBe(201);
    });

    test('Conflict username', async () => {

        const response = await request(server).post('/user/signup').send(users[0]);
        expect(response.statusCode).toBe(409);
    });

    test('Internal error - missing data', async () => {

        const response = await request(server).post('/user/signup').send( { email : 'error@example.com'});
        expect(response.statusCode).toBe(400);
    });

});