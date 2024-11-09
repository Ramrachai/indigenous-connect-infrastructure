const express = require('express');
const app = express();

app.get('/', (req, res) => {
    console.log("test commit")
    res.send('Hello World from Express.js running on AWS Lambda!');
});

module.exports = app;
