var express=require('express');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var jsonParser=bodyParser.json();


//making the connections
mongoose.connect('mongodb://127.0.0.1:27017/db',function (error) {
    if(error){console.log("error");}
    else{

        console.log("connected!!");

    }

});
