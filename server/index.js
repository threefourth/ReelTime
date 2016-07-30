// Requires
const express = require('express');
const socket = require('socket.io');
const http = require('http');

// Init
const app = express();
const server = http.createServer(app);
const io = socket.listen(server);

// Config
const EXPRESS_PORT = 3000;

// Routes
app.use(express.static(`${__dirname}/../client`));



// var filenames = ['My Neighbor Totoro', 'Spirited Away', 'Ponyo', 'Howl\'s Moving Castle'];

var files = {
  videos: [],
  audio: [],
  images: []
};

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected with socket id', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected with socket id', socket.id);
  });

  socket.on('room', function(room) {
    socket.join(room);
  });

  // Add filenames to files object
  socket.on('add media', (name, type) => {
    if (type === 'video') {
      files.videos.push(name);
    } else if (type === 'audio') {
      files.audio.push(name);
    } else if (type === 'image') {
      files.images.push(name);
    }
  });

  socket.on('request files', () => {
    socket.emit('send files', files);
  });

  // Chat messaging events
  socket.on('chat message', (msg, roomId) => {
    console.log('MSG: ', msg);
    console.log('RoomID: ', roomId);

    socket.to(roomId).broadcast.emit('chat message', msg);
  });

  // Video sync events
  socket.on('play', (time) => {
    console.log('Play command recieved');
    socket.broadcast.emit('play', time);
  });

  socket.on('pause', (time) => {
    console.log('Pause command recieved');
    socket.broadcast.emit('pause', time);
  });

  socket.on('newFile', (fileType) => {
    console.log('New file type command recieved');
    socket.broadcast.emit('newFile', fileType);
  });

  socket.on('media update', (filler) => {
    console.log('media update command recieved');
    socket.broadcast.emit('media update', filler);
  });
});


server.listen(process.env.PORT || EXPRESS_PORT);
console.log(`Listening on port ${EXPRESS_PORT}`);
