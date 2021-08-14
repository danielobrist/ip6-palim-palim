'use strict';

var os = require('os');
var express = require('express'); 

var app = express();
app.use(express.static('build'));
const favicon = require('serve-favicon');
app.use(favicon(__dirname + '/build/assets/favicon.ico'));

var port = process.env.PORT || 8080;
const server = app.listen(port);

console.log("Server running on localhost:" + port);

var io = require('socket.io')().listen(server);

io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var message = ['Message from server:'];
    message.push.apply(message, arguments);
    socket.emit('log', message);
  }

  socket.on('message', function(room, message) {
    log('Client said: ', message);
    socket.to(room).emit('message', message);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + (numClients + 1) + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('joinRequest', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address); 
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });

  socket.on('gameStart', function (room, gameMode, videoMode) {
    io.sockets.in(room).emit('gameStart', gameMode, videoMode, room);
  });

  socket.on('closeExplanationScreen', (room) => {
    io.sockets.in(room).emit('closeExplanationScreen');
  })

});
