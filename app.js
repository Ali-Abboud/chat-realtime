const http = require('http');
const express=require('express');
const path=require("path");
const socketIo=require("socket.io");
const publicPath=path.join(__dirname,"./public");
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var jsonParser=bodyParser.json();

var port=process.env.PORT_HTTP || 2999;
var MONGO_URL=process.env.MONGO_URL || "127.0.0.1";
var PORT_MONGO=process.env.MONGO_PORT || 27017 ;
var USERNAME_MONGO=process.env.MONGODB_USER || "username" ;
var PASSWORD_MONGO=process.env.MONGODB_PASSWORD || "password" ;

//making the connections\
/*'mongodb://'+USERNAME_MONGO+':'+PASSWORD_MONGO+'@'+MONGO_URL*/
//
mongoose.connect("mongodb://bintouch007:123456@ds129004.mlab.com:29004/bitdb@mongodb/bitdb",function (error) {
    if(error){console.log("error connecting mongodb!!!.");}
    else{

        console.log("connected!! ");

    }

});






//creating the shema for documents

var Schema=mongoose.Schema;
var clienctSchema=new Schema({
	phone_number:String,
	full_name:String,
	user_name:String,
	token:String,
	secondary_account:{},
	password:String
});
var phoneChatSchema=new Schema({
     rooms:[]

});

// var message={
//   from:,
//   to:,
//   state:,
//   date:,
//   content:
// };

var roomSchema=new Schema({
  room_name:String,
//  participants:[],
  chats:[]

});

var Client=mongoose.model('client',clienctSchema);
var Room=mongoose.model('room',roomSchema);
////////////////////////////////////////



 //using the exported function to create the server
 var app=express();






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var app=express();
var server=http.createServer(app);
var io=socketIo(server);



var rooms=[];


app.get('/api',function(req,res){
 	res.json([{firstname:'john',lastname:'doe'}]);
 });

 app.use(express.static(publicPath));

//Event listener to new connection
 io.on("connection",(socket)=>{
   console.log("New user connected");

  socket.emit("hello",{type:"hello"});

   socket.on("new message",(message,callbak)=>{
	     console.log("the new message is ",message);
       socket.emit("ack",{
         message:"ack"
       });
   });




socket.on("join",(params)=>{
        for(var i=0;i<params.to.length;i+=2){
              socket.join(params.to[i+1]);
              console.log(params.to[i] +" joined room "+params.to[i+1]);
              //handles the states of rooms aka of contacts
              socket.on("state "+params.to[i+1],(message)=>{
                socket.broadcast.to(message.room).emit("newMessage",{type:"state",room:message.room,state:message.state});
              });

              /////////////////////////////////////////////

              socket.on("message "+params.to[i+1],(message)=>{
                console.log("message sent to " +message.room);
                socket.broadcast.to(message.room).emit("newMessage",{type:"textMessage",content:message.content,id:message.id,parentRoom:message.room,account:message.account});
                    socket.emit("server_ack",{
                    	mid:message.id,
                    	room:message.room
                    });


                    console.log(message.account);

                     var chats=[];
                    	var isFound=false;//if the message already exist


                    Room.find({room_name:message.room},function(err,rooms){
                  		if( rooms!=null && rooms[0]!=null && rooms[0].chats.length>0)
                  			for(var i=0;i<rooms[0].chats.length;i++){
                  				chats.push(rooms[0].chats[i]);
                  				console.log("pushing "+rooms[0].chats[i].content);
                  				if(message.from==rooms[0].chats[i].from && message.id==rooms[0].chats[i].id)
                  					isFound=true;
                  			}

                  		if(!isFound){
                        message.state=1;
                        console.log("before adding the message "+message);
                      chats.push(message);
                      }


                  		Room.update({room_name:message.room},{$set:{chats:chats}},function(err,rooms){
                  			if(err) throw err;
                  			else
                  				console.log("message saved!!");
                  			console.log("after adding the message "+chats[0].id + " for "+rooms);

                  		});
                  	});


              });



              socket.on("onview "+params.to[i+1],(isviewing)=>{
              	console.log("viewing" +isviewing.room);
              	socket.broadcast.to(isviewing.room).emit("onview "+isviewing.room,{viewing:isviewing.is,room:isviewing.room});

              });




        }


          socket.on("whoIsOnline",(rooms)=>{
          	console.log("begin asking who is online");
              for(var i=0;i<rooms.length;i++){
              	socket.broadcast.to(rooms[i].room).emit("whoIsOnline");
              }
          });

        socket.on("disconnect",()=>{
        	for(var i=0;i<params.to.length;i+=2){
        		socket.broadcast.to(params.to[i+1]).emit("newMessage",{type:"state",room:params.to[i+1],state:"offline"});
        		console.log("disconnected "+params.to[i+1]);
        	}

         });


//



});







   socket.emit("new message",{
     message:"hi"
   });

   socket.on("createMessage",(message)=>{
         console.log(message);
   });




 });


server.listen(3000,()=>{
  console.log("Server is up");
});
