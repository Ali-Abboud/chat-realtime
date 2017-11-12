const http = require('http');
const express=require('express');
const path=require("path");
const socketIo=require("socket.io");
const publicPath=path.join(__dirname,"./public");

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
                console.log(message.state);
                console.log(message.room);
                socket.broadcast.to(message.room).emit("newMessage",{type:"state",room:message.room,state:message.state});

                	console.log("begin asking") ;

                		console.log("asking room "+params.to[i+1]+" if it is online");





              });

              /////////////////////////////////////////////

              socket.on("message "+params.to[i+1],(message)=>{
                console.log("message sent to " +message.room);

                    socket.emit("server_ack",{
                    	mid:message.id,
                    	room:message.room
                    });
                    socket.broadcast.to(message.room).emit("newMessage",{type:"textMessage",content:message.content,id:message.id,parentRoom:message.room});
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
