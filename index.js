//the libraries reuiqred by this chat application
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
//which is used to store the current users list
var connections = [];
var users = [];


//initiation for the html file path
app.use("/html", express.static(__dirname + "/htmlFile"));
app.use("/css",express.static(__dirname+ "/cssFile"));
app.use("/json",express.static(__dirname+ "/jsonDataFile"));
/*
// which is used to store the json file for test
var testJson = require(__dirname+ "/jsonDataFile/acd.json");
console.log(testJson);

fs.writeFile(__dirname +"/jsonDataFile/acd.json", "[{\"name\":\"haha\"}]", function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
*/

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname,"./htmlFile/console.html"));
});

// Register events on socket connection
io.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected '+connections.length+' sockets already.');
  socket.on('chatMessage', function(from, msg){
  	//the system control code is under the branch 
  	if(from == 'System'){
  		socket.username = msg;
  		//it is used for the record list of the current chat memenber
  		users.push(socket.username);
  		io.emit('chatMessage', from, '<b>' +msg+ '</b> has joined the discussion');
  	}
  	else {
      if(msg[0] == '-'){
        if(msg=='-ls'){
          var socketIndex = users.indexOf(from);
          console.log(connections[socketIndex].id);
          updateUsernames(connections[socketIndex].id);
        }
      }
      else{
        io.emit('chatMessage', from, msg);
      }	
  	}
  });

  socket.on('disconnect',function(data){
    //this is used to delete the disconnted users from the users list
  	users.splice(users.indexOf(socket.username), 1);
  	connections.splice(connections.indexOf(socket), 1);
  	io.emit('chatMessage', 'System', '<b>' +socket.username+ '</b> has lefted the discussion');
	console.log(socket.username+' is disconnected');
  });
});

http.listen(3000, function () {
  console.log('This app listening on port 3000!');
});
//it is used when one user disconnected
function updateUsernames(socketId){
	console.log('there are '+ users.length+' users in total');
	io.sockets.connected[socketId].emit('get users',users);
}