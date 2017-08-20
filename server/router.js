'use strict';
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('./config');
const UsersModel = require('./models/users.model');

const checkAuth = (request, res, next) => {
  passport.authenticate('jwt', {session: false},
    (err, decryptToken, jwtError) => {
      if (jwtError != void(0) || err != void(0)) {
        return res.render('index.html', {error: err || jwtError});
      }

      request.user = decryptToken;
      next();
    })(request, res);
};

function createToken (body) {
  return jwt.sign(
    body,
    config.jwt.secretOrKey,
    {expiresIn: config.expiresIn}
  );
}

function findUser (req) {
  return UsersModel.findOne(
    {username: {$regex: _.escapeRegExp(req.body.username), $options: 'i'}}
  ).lean().exec();
}

module.exports = app => {
  app.use('/assets', express.static('./client/public'));

  app.get('/', checkAuth, (req, res) => {
    res.render('index.html', {username: req.user.username});
  });

  app.post('/login', async (req, res) => {
    try {
      let user = await findUser(req);

      if (user != void(0) &&
        bcrypt.compareSync(req.body.password, user.password)) {
        const token = createToken({id: user._id, username: user.username});

        res.cookie('token', token, {httpOnly: true});

        return res.status(200).send({message: 'User login success!'});
      }

      res.status(400)
        .send({message: 'User already exists or password is incorrect!'});

    } catch (e) {
      console.error('E', 'login', e);
      res.status(500).send({message: 'Some error'});
    }
  });

  app.post('/register', async (req, res) => {
    try {
      let user = await findUser(req);

      if (user != void(0)) {
        return res.status(400).send({message: 'User already exists!'});
      }

      user = await UsersModel.create({
        username: req.body.username,
        password: req.body.password
      });

      const token = createToken({id: user._id, username: user.username});

      res.cookie('token', token, {httpOnly: true});
      res.status(200).send({message: 'User created'});
    } catch (e) {
      console.error('E', 'register', e);
      res.status(500).send({message: 'Some error'});
    }
  });

  app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send({message: 'Logout success'});
  });
};