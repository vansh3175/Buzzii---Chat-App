const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    recieverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    text:{
        type:String,
    },
    img:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    
})

module.exports = mongoose.model("Chat",chatSchema);