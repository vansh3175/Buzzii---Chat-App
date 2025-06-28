const Chat = require("../models/chat");

module.exports.getMessages = async (req,res)=>{
    
    const {id:secondUser} = req.params;
    const firstUser = req.user.id;
    let result = await Chat.find({});
    
    result = result.filter((val)=>{
        return (val.senderId==firstUser && val.recieverId==secondUser) || (val.senderId==secondUser && val.recieverId==firstUser)
    })

    result.sort((a,b)=>(new Date(a.createdAt) - new Date(b.createdAt))); // in order to access last msg diff means desc
    
    res.status(200).json({messages:result});

}


module.exports.sendMessage = async ( req,res)=>{
    const {id} = req.params;
    const {text} = req.body;
    const sender = req.user.id;
    const img =  req.file?.path;

    let chatObj = {
        recieverId:id,
        senderId:sender,
    }
    if(text){
        chatObj = {...chatObj,text};
    }
    if(img){
        chatObj={...chatObj,img}
    }


    const newChat = new Chat(chatObj)
    await newChat.save();

    res.status(200).json({message:"message sent",chat:newChat});


}


