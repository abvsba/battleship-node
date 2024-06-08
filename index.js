require('dotenv').config();
//require('./util/createTable');

const userRoute = require('./router/user');

const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

//app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.urlencoded( {extended : true}));
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //every website/location can access the api
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

app.use('/user', userRoute);

module.exports = app