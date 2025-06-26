const User = require('../models/user');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs')
const {createJWTToken} = require('../lib/util')
dotenv.config();

module.exports.login=async (req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(user){
        if(await bcrypt.compare(password,user.password)){ //look if this exists
            res = createJWTToken(user,res);
            res.status(200).json({msg:"login successful",user})
        }
        else{
            res.status(400).json({msg:"password is incorrect"});
        }
    }
    else{
        res.status(400).json({msg:"user dont exist"});
    }


}

module.exports.signup = async (req,res)=>{
    const {name,email,password} = req.body;
    const user = await User.findOne({email})
    if(user){
        res.status(400).json({msg: "User with this email already exists"});
    }
    else{
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({name,email,password:hashedPassword});
        await newUser.save();

        res =  createJWTToken(newUser,res);
        res.status(200).json({msg:"user successfully registered",user:newUser});
    }

}

module.exports.updatePhoto = async(req,res)=>{
    const img = req.file?.path;
    const userId = req.user.id;

    if(!img){
        res.status(500).json({"message":"image not recieved"});
    }

    const result = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePic: img } },
            { new: true } // to get the updated document else will give the old copy.
        );
    if(result){
        res.status(200).json({"message":"profile update successfully",result});
    }
    else{
        res.status(500).json({"message":"profile update failed"});
    }
}
 
module.exports.getUserData = async (req,res)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({msg:"data fetched",userData:user});
}

module.exports.getUsers = async(req,res)=>{
    const loggedInUserId = req.user.id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json({users:filteredUsers});

}


module.exports.logout = (req,res)=>{
    res.cookie('jwt','',{maxAge:0});
    res.status(200).json({msg:"logged out successfully"});
}


