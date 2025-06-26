const mongoose = require('mongoose');
const dbURI = process.env.MONGO_URI;

module.exports.connectDb = ()=>{
    mongoose.connect(dbURI)
    .then(()=>console.log("connected to DB"))
    .catch((e)=>console.log(e))
}

