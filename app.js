//var http = require('http');
//
//var port = (process.env.PORT || process.env.VCAP_APP_PORT || 8888);
//
//http.createServer(function (req, res) {
//	res.writeHead(200, {'Content-Type': 'text/plain'});
//	res.end('Hello World!\n');
//}).listen(port);
//
//console.log('Server running at http://127.0.0.1:'+port);
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


   socket.on("new message",(message,callbak)=>{
	     console.log("the new message is ",message);
       socket.emit("ack",{
         message:"ack"
       });
   });


   socket.on("dissconnect",()=>{
      console.log("User dissconnected");

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
              });
              /////////////////////////////////////////////

              socket.on("message "+params.to[i+1],(message)=>{
                console.log("message sent to " +message.room);
                    socket.broadcast.to(message.room).emit("newMessage",{type:"textMessage",content:message.content,id:message.id});
              });

              rooms.push(params.to[i+1]);
        }





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
