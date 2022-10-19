const express= require('express');
const cors = require('cors')
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cors());


const config=require('./config');
//config.mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true}).then((res)=>{
    config.mongoose.connect(config.url,config.options).then(()=>{
        console.log(" Connected to the database MangoDB!"); 

}).catch((err)=>{
    console.log("cannot connect to the database MangoDB!",error);
});
require('./helper/socket')
// app.use('/api',require('./routes/route'));
var route = require('./routes/route')
app.use(route);
app.listen(4000,()=>{
    console.log("Server is running"+4000);
});
//  var socket = require('./helper/socket')
//  app.use(socket);
//  app.listen(4001,()=>{
//     console.log("Server is running"+4001);
//  })
