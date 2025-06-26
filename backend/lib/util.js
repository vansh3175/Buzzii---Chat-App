const jwt = require('jsonwebtoken');

module.exports.createJWTToken = (user,res)=>{
    const token = jwt.sign(
        {id:user._id},
        process.env.TOKEN,
        {expiresIn:"1d"}
    )
    res.cookie("jwt",token,{
        httpOnly: true,
        secure: true,
        sameSite: "none", 
        maxAge: 3600000, 
    })

    return res;
    
}
