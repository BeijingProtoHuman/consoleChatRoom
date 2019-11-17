//the libraries reuiqred by this chat application
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
//which is used to store the current users list
var connections = [];


//initiation for the html file path
app.use("/html", express.static(__dirname + "/htmlFile"));
app.use("/css", express.static(__dirname + "/cssFile"));
app.use("/json", express.static(__dirname + "/jsonDataFile"));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "./htmlFile/console.html"));
});

// Register events on socket connection
io.on('connection', function (socket) {
  connections.push(socket);
  console.log('Connected ' + connections.length + ' sockets already.');
  socket.on('chatMessage', function (from, msg) {
    //the system control code is under the branch 
    if (from == 'System') {
      //handle system msg
      socket.username = msg;
      //it is used for the record list of the current chat memenber
      io.emit('chatMessage', from, '<b>' + msg + '</b> has joined the discussion');
    }
    else {
      //handle user msg
      if (msg[0] == '-') {
        if (msg == '-ls') {
          const curSocket = connections[connections.indexOf(socket)];
          console.log(curSocket.username);
          updateUsernames(curSocket.id);
        }
      }
      else {
        io.emit('chatMessage', from, msg);
      }
    }
  }
  );

  socket.on('disconnect', function (data) {
    //this is used to delete the disconnted users from the users 
    connections.splice(connections.indexOf(socket), 1);
    io.emit('chatMessage', 'System', '<b>' + socket.username + '</b> has lefted the discussion');
    console.log(socket.username + ' is disconnected');
  });

  //handle reconnect part to reset the username
  socket.on('reconnection', function (from, msg) {
    socket.username = from;
    console.log(msg);    
  })

});

http.listen(3000, function () {
  console.log('This app listening on port 3000!');
});
//it is used when one user disconnected
function updateUsernames(socketId) {
  console.log('there are ' + connections.length + ' users in total');
  io.sockets.connected[socketId].emit('get users', connections.map(socket => socket.username));
}