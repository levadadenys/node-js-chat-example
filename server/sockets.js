'use strict';
const cookieParser = require('cookie-parser');
const passport = require('passport');

const MessageModel = require('./models/messages.model');

function auth (socket, next) {
  cookieParser()(socket.request, socket.request.res, () => {});

  passport.authenticate('jwt', {session: false},
    (error, decryptToken, jwtError) => {
      if (!error && !jwtError && decryptToken) {
        next(false, {username: decryptToken.username, id: decryptToken.id});
      } else {
        next(true);
      }
    })(socket.request, socket.request.res);
}

module.exports = io => {
  io.on('connection', function (socket) {
    auth(socket, (isGuest, user) => {
      if (!isGuest) {
        socket.username = user.username;
        socket.join('all');
        socket.emit('connected',
          `you are connected to chat as ${user.username}`);
      }
    });

    socket.on('msg', (content) => {
      console.log(content);
      console.log(socket);
      console.log(socket.username);
      const obj = {
        date: new Date(),
        content: content,
        username: socket.username
      };

      MessageModel.create(obj, (err, result) => {
        if (err) {
          return console.log('MessageModel', err);
        }

        socket.emit('message', obj);
        socket.to('all').emit('message', obj);
      });
    });

    socket.on('receiveHistory', () => {
      MessageModel.find({})
        .sort({date: -1})
        .limit(50)
        .sort({date: 1})
        .lean()
        .exec((err, messages) => {
          if (!err) {
            socket.emit('history', messages);
          }
        });
    });
  });
};
