var cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log('Connected correctly to server');
}, (err) => { console.log(err); });

var app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
