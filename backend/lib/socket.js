const express = require('express');
const http = require('http')
const {Server} = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:['http://localhost:5173'],
        credentials:true
    }
})

const userMap ={} // userId:sockerId

io.on('connection',(socket)=>{
    console.log("user connected",socket.id);

    userMap[socket.handshake.query.userId] = socket.id
    // console.log('User Id',socket.handshake.query.userId)     

    io.emit('getActiveUsers',Object.keys(userMap));  //io ensures list to be emitted to all socket connections and not only the one newly connected
    
    socket.on('send-message',(msg)=>{
       
        if(userMap[msg.recieverId]){
            io.to(userMap[msg.recieverId]).emit('receive-message',msg);
        }

    })

    socket.on('user-added',(user)=>{
        
        io.emit('user-created',user);
    })

    socket.on('disconnect',()=>{
        console.log("user disconnected",socket.id);
        delete userMap[socket.handshake.query.userId]
        io.emit('getActiveUsers',Object.keys(userMap));  //io ensures list to be emitted to all socket connections and not only the one newly connected

    })



})

module.exports = {app,server}