const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        
    },
    googleId:{
        type:String,
    },
    profilePic:{
        type:String,
        // default:'https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
       
    },
    sentRequests:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    recievedRequests:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    createdAt:{
        type:Date,
        default:Date.now
    }
    

})
module.exports = mongoose.model("User",userSchema);