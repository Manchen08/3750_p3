module.exports = (io) => {

    // server side tracker of logged in users
    // used to populate initial list of online users
    let users = [];
    let assignedRoom = [];
    let running_games = [];
    let inst = require("./game");
    let pug = require('pug');
        /*
        ie:  running_game({roomid:1234,name:1234});
        ***user can change the name property
        */
    io.sockets.on('connection', socket => {


         const user = { 
             username: socket.request.user.username,
             roomname: ""
            };
         
         users[socket.id] = socket.request.user.username;
          

        function namechange(roomname,room){
            if(running_games.indexOf(roomname) >= 0){
                return "room already being used";
            }else{
                running_games.push({roomid:room, name:roomname});
            }
        }

        socket.on('connected', function (req, res){            
        });
        
        socket.on('getUser', (callback) => {
            io.to(socket.id).sockets.emit('whoami', user);
        });

        socket.on('getUsers', (callback) => {
            io.to(socket.id).emit('userList', users); // only send userList to newly connected user
        });

        socket.on('roomUsers', (callback) => {
            var roomMembers = [];
            //console.log(user.roomname);
            //console.log(io.sockets.adapter.rooms);
            console.log(io.sockets.adapter.rooms[user.roomname].sockets);
            for( var member in io.sockets.adapter.rooms[user.roomname].sockets ) {
                console.log(users[member]);
            }

            io.to(user.roomname).emit('userListRoom', roomMembers); 
            //console.log(socket.request.user);
            //console.log(socket.adapter.nsp.adapter.sids);
            //console.log(socket.adapter.nsp.adapter.rooms);
            //console.log(io.sockets.adapter.rooms);
            //console.log(socket.id);
            //console.log(io.sockets.adapter.rooms['bob'].sockets);
        });
        
        // Client to Server message
        socket.on('c2smsg', function(data, callback){
            var chatObject = {person: user.username, message: data};
            socket.broadcast.emit('s2cmsg', chatObject);
        });

        // Notify the chat room the user disconnected
        // update the server side tracker
        socket.on('disconnect', socket => {
            io.sockets.emit('userLoggedOut', user.username);
            users.splice(users.indexOf(user.username),1); // remove from user tracker
        });

        socket.on('newGameRoom', function (req, res){
            var pug = require('pug');
            res(pug.renderFile('views/includes/newGame.pug'));
        });

        socket.on('createNewGame', function(req,res) {
            //console.log(req);
            var roomname = req.roomname; //string of desired roomname;
            var category = req.category; //a array of all categories selected
            var players = req.players; //int of # of players
            var gamerounds = req.gamerounds; //int of # of games

            //if roomname exists in roomlist, send back warning message
            running_games.filter(function(item){
                if(roomname == item.name)
                {
                    res.send({status:400,page:""});
                };
            });
            //create the new game object
            var gm = new inst.Game(roomname,category,players,gamerounds);
            
            gm.roomname = roomname;
            gm.category = category;
            gm.players = players;
            gm.gamerounds = gamerounds;
            running_games[roomname] = gm;
            var roomUsers;
            gm.addUserToRoom(socket, user.username, function(ret) {
                roomUsers = ret;
            });
            //console.log(Ulist);
            user.roomname = roomname;
            //Send success, send roomname
            /*Don't know how to make this work yet. It needs to add the player as 
            a player on the players screen under names.*/ 
            res({  
                status:
                    200,
                page :
                    pug.renderFile('views/includes/waitForPlayers.pug',[room = roomname]),
                users :
                    roomUsers,
                room :
                    roomname
            });
        });

        socket.on('joinRoom', function(req,res) {
            var gm;
            
            //check if room exists return room doesn't exist if false
            if(running_games[req.room] != null)
            {
                gm = running_games[req.room];
                console.log(user.username);
                var roomUsers;
                gm.addUserToRoom(socket, user.username, function(ret) {
                    roomUsers = ret;
                });
                res({  
                    status:
                        200,
                    page :
                        pug.renderFile('views/includes/waitForPlayers.pug',[room = gm.roomname]),
                    users :
                        roomUsers,
                    room :
                        req.room
                });
            }
            //add user to room
            
            
            
        });

        socket.on('getCats', function(req,res) {
            //get the categories, 
        });

        function getUser() {
            return user;
        }

    });// end on connection event

};




/*


    running_games.push({roomid:1234,name:"newroom"});

        function namechange(roomname,room){
            if(running_games.indexOf(roomname) >= 0){
                return "room already being used";
            }else{
                running_games.push({roomid:room, name:roomname});
            }
        }

    //users.push({user:username,user:"roomid"})

    function adduser(username, roomid){
        users.push({user:username, user:roomid});
        return users;
    }

    function removeuser(username, roomid){
        var x = users.indexOf(username);
        if(x >= 0){
            users.splice(x,1);
        }
    }

    exports.adduser = adduser;
    exports.removeuser = removeuser;
    exports.namechange = namechange;
*/