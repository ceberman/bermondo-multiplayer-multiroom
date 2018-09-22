// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3003;

var debugLevel = 10;

server.listen(port, function () {
              console.log('Server listening at port %d', port);
              });

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// ceb
// usernames which are currently connected to the chat
// var usernames = {};
// var numUsers = 0;
allRoomUserNames = {};
allRoomUserCounts = {};

// ceb
// new way of doing command history
// right now there's only one room in allRoomCommands
var defaultRoom = 'waitingRoom';
var allRoomCommands = {};
createRoomDataStructures(defaultRoom);

// ceb
// rooms subsystem
var rooms = [ defaultRoom , 'room2', 'room3' ];

// ceb - read in menu system
var fs = require('fs');
var  allMenus;
fs.readFile('webmenus.json', 'utf8', function (err, data) {
  if (err) throw err;
  allMenus = JSON.parse(data);
});


io.on('connection', function (socket) {
      var addedUser = false;

      // when the client emits 'new message', this listens and executes
      socket.on('new message', function (data) {
                // we tell the client to execute 'new message'
                socket.broadcast.to(socket.room).emit('new message', {
                                      username: socket.username,
                                      message: data
                                      });
                });

      // ceb
      // when the client emits 'new message', this listens and executes
      socket.on('RemoteMenu', function (data) {
                // we tell the client to execute 'new message'
                socket.broadcast.to(socket.room).emit('RemoteMenu', {
                                      username: socket.username,
                                      message: data
                                      });


                // ceb unfinished
                // need to unpack data and figure out command name and command values
                // logCommand(defaultRoom, );
                logMenuCommand(socket.room, data);
                if (debugLevel > 0) {
                  console.log('new menuCommand: ');
                  consolePrintMenuCommandObject(data);
                  consolePrintCommandDictionary(socket.room);
                }
                });

      // ceb
      socket.on('Player Position', function (data) {
                // we tell the client to execute 'new message'
                socket.broadcast.to(socket.room).emit('Player Position', {
                                      username: socket.username,
                                      message: data
                                      });

                });

      // when the client emits 'add user', this listens and executes
      socket.on('add user', function (username) {
                // we store the username in the socket session for this client
                socket.username = username;
                // multiroom additions
                socket.room = defaultRoom;
                socket.join(defaultRoom);

                // add the client's username to the global list
                userEntersRoomDataStructures(defaultRoom, username)
                addedUser = true;

                socket.emit('login', {
                            numUsers: allRoomUserCounts[defaultRoom]
                            });

                // used only for the HTML client
                socket.emit('set menus', allMenus);

                // ceb
                emitCatchup(socket, defaultRoom);

                //
                socket.emit('new message', {
                  username: 'SERVER',
                  message: 'you have connected to waitingRoom'});


                // echo globally (all clients) that a person has connected
                socket.broadcast.to(defaultRoom).emit('user joined', {
                                      username: socket.username,
                                      numUsers: allRoomUserCounts[defaultRoom]
                                      });

                socket.emit('updaterooms', rooms, defaultRoom);

                // ceb
                // for Unity/C# applications, need a well formed object with keys
                // Unity (by default at least) does not support .NET 4
                // and the assemblies as noted in https://stackoverflow.com/questions/3142495/deserialize-json-into-c-sharp-dynamic-object
                //  using System.Web.Script.Serialization;
                // or
                //  using System.Dynamic;
                //  using System.Web.Script.Serialization;
                //
                var roomDataStruct = {roomArray : rooms, currentRoom : defaultRoom};
                socket.emit('updateroomsJson', roomDataStruct);


                });

        socket.on('switchRoom', function(newroom){
                  // sent message to OLD room
                  socket.broadcast.to(socket.room).emit('new message', 'SERVER', socket.username+' has left this room');
                  // echo globally that this client has left
                  socket.broadcast.to(socket.room).emit('user left', {
                                        username: socket.username,
                                        numUsers: allRoomUserCounts[socket.room]
                                        });

              		socket.leave(socket.room);
                  userLeavesRoomDataStructures(socket.room, socket.username);
              		socket.join(newroom);
              		socket.emit('new message', {
                    username: 'SERVER',
                    message: 'you have connected to '+ newroom});



              		// update socket session room title
              		socket.room = newroom;
              		socket.broadcast.to(newroom).emit('new message', {
                    username: 'SERVER',
                    message: socket.username+' has joined this room'});
              		socket.emit('updaterooms', rooms, newroom);

                  // bermondo specific
                  var roomDataStruct = {roomArray : rooms, currentRoom : newroom};
                  socket.emit('updateroomsJson', roomDataStruct);
                  userEntersRoomDataStructures(newroom, socket.username)
                  emitCatchup(socket, newroom);

              	});

      // when the client emits 'typing', we broadcast it to others
      socket.on('typing', function () {
                socket.broadcast.to(socket.room).emit('typing', {
                                      username: socket.username
                                      });
                });

      // when the client emits 'stop typing', we broadcast it to others
      socket.on('stop typing', function () {
                socket.broadcast.to(socket.room).emit('stop typing', {
                                      username: socket.username
                                      });
                });

      // when the user disconnects.. perform this
      socket.on('disconnect', function () {

            if (addedUser) {
            // if (usernames.hasOwnProperty(socket.username)) {
                  // remove the username from global usernames list
                  userLeavesRoomDataStructures(socket.room, socket.username);
                  /*
                  var usernames = allRoomUserNames[socket.room];
                  delete usernames[socket.username];
                  allRoomUserCounts[socket.room] = allRoomUserCounts[socket.room] - 1;

                  // ceb
                  if (allRoomUserCounts[socket.room] <= 0) {
                    emptyRoomDataStructures(socket.room);
                  }
                  */

                  // echo globally that this client has left
                  socket.broadcast.to(socket.room).emit('user left', {
                                        username: socket.username,
                                        numUsers: allRoomUserCounts[socket.room]
                                        });

            } else {
              // this seems to happen if client disconnects before giving logging in
              console.log("Warning: received disconnect for unknown user %s", socket.username);
            }

        });

      });

// ceb

// handling user enter and leave
function userLeavesRoomDataStructures(roomName, userName)
{
  var usernames = allRoomUserNames[roomName];
  if (usernames == undefined) {
    // shouldn't happen
    console.log("userLeavesDataStructure(%s, %s), no usernames", roomName, userName);
    return;
  }
  delete usernames[userName];
  if (allRoomUserCounts[roomName] == undefined) {
    // shouldn't happen
    console.log("userLeavesDataStructure(%s, %s), no allRoomUserCounts[%s]", roomName, userName, roomName);
    return;
  }
  allRoomUserCounts[roomName] = allRoomUserCounts[roomName] - 1;

  // ceb
  if (allRoomUserCounts[roomName] <= 0) {
    emptyRoomDataStructures(roomName);
  }
}

function userEntersRoomDataStructures(roomName, userName)
{
  confirmOrCreateRoomDataStructures(roomName);
  var usernames = allRoomUserNames[roomName];
  usernames[userName] = userName;
  allRoomUserCounts[roomName] = allRoomUserCounts[roomName] + 1;
}
// handling room creation and deletion
function confirmOrCreateRoomDataStructures(roomName) {
  if (allRoomCommands.hasOwnProperty(roomName)) {
    if (debugLevel > 0) {
      console.log("confirmOrCreateRoomDataStructures(%s): already exists", roomName);
    }
  } else {
    createRoomDataStructures(roomName);
    if (debugLevel > 0) {
      console.log("confirmOrCreateRoomDataStructures(%s): NEED TO CREATE", roomName);
    }
  }
}
function createRoomDataStructures(roomName) {
  if (debugLevel > 0) {
    console.log("createRoomDataStructures(%s)", roomName);
  }
  var newRoomCommandDictionary = {};
  allRoomCommands[roomName] = newRoomCommandDictionary;
  var newRoomUserNames = {};
  allRoomUserNames[roomName] = newRoomUserNames;
  allRoomUserCounts[roomName] = 0;
}

function deleteRoomDataStructures(roomName) {
  if (debugLevel > 0) {
    console.log("deleteRoomDataStructures(%s)", roomName);
  }
  delete allRoomCommands[roomName];
}

function emptyRoomDataStructures(roomName) {
  if (debugLevel > 0) {
    console.log("emptyRoomDataStructures(%s)", roomName);
  }
  var commandDictionary = allRoomCommands[roomName];
  for (var commandName in commandDictionary) {
    if (commandDictionary.hasOwnProperty(commandName)) {
      delete(commandDictionary[commandName]);
    }
  }
  // shouldn't have to remove userNames or zero out allRoomUserCounts
  // might want to verify this with an assertion
}

function logMenuCommand(roomName, commandObject) {
  // this is necessary if the server restarts, but clients have previously connected
  confirmOrCreateRoomDataStructures(roomName);

  var roomCommandDictionary = allRoomCommands[roomName];
  var commandName = commandObject['menuName'];
  roomCommandDictionary[commandName] = commandObject;
}

function consolePrintCommandDictionary(roomName)
{
  var commandDictionary = allRoomCommands[roomName];
  console.log("room: %s.commandDictionary ------->", roomName);
  for (var commandName in commandDictionary) {
    if (commandDictionary.hasOwnProperty(commandName)) {
      var commandObject = commandDictionary[commandName];
      consolePrintMenuCommandObject(commandObject);
    }
  }
}

function emitCatchup(socket, roomName)
{
  var commandDictionary = allRoomCommands[roomName];
  if (debugLevel > 0) {
    console.log('room: %s.emitCatchup: commandDictionary ------->', roomName);
    consolePrintCommandDictionary(roomName);
  }
  for (var commandName in commandDictionary) {
    if (commandDictionary.hasOwnProperty(commandName)) {
      var commandObject = commandDictionary[commandName];
      socket.emit('RemoteMenu', {
        username: 'SERVER',
        message: commandObject});
    }
  }
}

function consolePrintMenuCommandObject(singleMenuObject)
{
  console.log('===>menuName = %s, menuItem = %s', singleMenuObject['menuName'], singleMenuObject['menuItem']);
}
