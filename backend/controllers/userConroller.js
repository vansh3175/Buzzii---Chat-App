const User = require('../models/user');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs')
const {createJWTToken} = require('../lib/util')
const axios = require('axios')
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

module.exports.googleLogin = async (req,res)=>{
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID
    }&redirect_uri=${process.env.GOOGLE_REDIRECT_URI
    }&response_type=code&scope=email%20profile`;
  res.redirect(redirectUrl);
}

module.exports.googleCallback =async (req,res)=>{
    const {code} = req.query;

    try {
    
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      },
    });

    const { access_token } = tokenRes.data;

    // 2. Get user info
    const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: googleId, email, name , picture} = userInfoRes.data;


    // 3. Check DB
    let user = await User.findOne({ email });

    if (!user) {
        user = new User({ email, name, googleId, profilePic:picture });
        await user.save();
    } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
    }

    // 4. Create JWT
    createJWTToken(user,res)
    // 5. Redirect to frontend with token
    res.redirect(`http://localhost:5173/`);
  } catch (err) {
        console.error("Google login error", err.message);
        res.status(500).send("Login failed");
  }
}

