const express = require('express');
const path = require('path');

const app = express();

app.use((req, res, next) => {
    console.log(path.resolve(__dirname, req.url));
    next();
});
app.use(express.static(path.resolve(__dirname, 'dist'), {index: 'index.html'}));


module.exports = app;
