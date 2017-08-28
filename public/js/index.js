var socket=io();

socket.on("connect",()=>{
console.log("connected!!");
});

socket.emit("createMessage",{
  form:"Nana",
  to:"Abdallah"
});


socket.on("newMessage",(message)=>{
console.log("new message ${message}");
});
