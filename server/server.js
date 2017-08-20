'use strict';

const express = require('express');
const app = express();
const server = require('http').Server(app);
const nunjucks = require('nunjucks');
const io = require('socket.io')(server, {serverClient: true});
const mongoose = require('mongoose');
const passport = require('passport');
const {Strategy} = require('passport-jwt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const {jwt} = require('./config');

passport.use(new Strategy(jwt, (jwt_payload, done) => {
  if (jwt_payload != void(0)) {
    return done(false, jwt_payload);
  }
  done();
}));

mongoose.connect('mongodb://localhost:27017/chatick', {useMongoClient: true});
mongoose.Promise = require('bluebird');
mongoose.set('debug', true);

nunjucks.configure('./client/views', {
  autoescape: true,
  express: app
});

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
//parse application/JSON
app.use(bodyParser.json());
app.use(cookieParser());

require('./router')(app);

require('./sockets')(io);

server.listen(7777, '0.0.0.0', () => {
  console.log('server started on port 7777');
});