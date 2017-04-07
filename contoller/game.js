
exports.Game = class Game{

    constructor(roomname,category,players,gamerounds){
        this.roomname = roomname;
        this.category = category;
        this.players = players;
        this.gamerounds = gamerounds;
        this.users = [];
        this.round = 1;
        this.roundquestion = {};
        
        
    };

    cnslPrint(){
        console.log("worked");
    }

    createGame(req, res){
        console.log("Game creation has been initialized");
        gameRounds = req.rounds;
    }

    pickquestion(sio,req, res){
        this.roundquestion = "Where am I?";// this needs to get the question from db in its scheme BSON

        
        //update all users to createAnswer screen

        for( var i = 0, len = this.users.length; i<len; i++)
        {
            this.users[i].screen = "answering";
        }
        res({question:this.roundquestion});
    }

    addUserToRoom(socket, username, ret){
        socket.join(this.roomname);
        var found = this.users.some(function (el){
            return el.user === username;
        })
        if(!found)
        {
            this.users.push({user:username, screen:"wait1", socketID:socket.id});
        }
        console.log(username + " has joined " + this.roomname);
        socket.to(this.roomname).emit('updateUsers', {users : this.users});
        ret(this.users);
    }

    randomHost(response){
        var x = this.users.length;
        //if(x > 1 && gameRounds > 0){
            var host = this.users[Math.floor(Math.random() * x)];
            return host.user;
        //}else{
        //    return "wait for more players";
        //}
    }

    randomPlayerContinue(sio,userid, response){
        this.currentPlayer = userid;
       sio.to(this.roomname).emit('gotoPickQuestion', {user:userid});
    }

    countRounds(){
        gameRounds = gameRounds - 1;
    }

   displayQuestion(){ 
        socket.emit() 
    } 
};
