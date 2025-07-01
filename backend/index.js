require('dotenv').config()
const express = require('express');
const http = require('http')
const {Server} = require('socket.io')
const { connectDb } = require('./lib/db');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes')
const chatStatusRouter = require('./routes/chatStatusRoutes')
const cookieParser = require('cookie-parser');
const cors = require('cors')
const {app,server} = require('./lib/socket')

app.use(express.urlencoded({extended:true}));
app.use(express.json({limit:'10mb'}));
app.use(cookieParser());
app.use('/uploads',express.static("uploads"));
app.use(cors({
    origin:['http://localhost:5173'],
    credentials:true
}))


connectDb();

server.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
})


app.use('/user',userRouter);
app.use('/chat',chatRouter);
app.use('/chatStatus',chatStatusRouter)
// app.all('*',(req,res)=>{
//     res.status(404).json("page not found");
// })