const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports.authCheck = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(!token){
        res.status(401).json({msg:"authorization denied"});
    }
    else{
        jwt.verify(token,process.env.TOKEN,async(err,decoded)=>{
            if(err){
                res.status(401).json({msg:"authorization denied"});
            }
            else{
                req.user=decoded;
                // console.log("user verified");
                next();
            }

        })
    }

}