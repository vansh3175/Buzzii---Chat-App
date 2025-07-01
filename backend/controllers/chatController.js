const Chat = require("../models/chat");

module.exports.getMessages = async (req, res) => {
    try {
        const { id: secondUser } = req.params;
        const firstUser = req.user.id;

        let result = await Chat.find({});

        result = result.filter((val) => {
            return (
                (val.senderId == firstUser && val.recieverId == secondUser) ||
                (val.senderId == secondUser && val.recieverId == firstUser)
            );
        });

        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.status(200).json({ messages: result });
    } catch (err) {
        console.error("Error in getMessages:", err.message);
        res.status(500).json({ msg: "Failed to retrieve messages" });
    }
};


module.exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const sender = req.user.id;
        const img = req.file?.path;

        let chatObj = {
            recieverId: id,
            senderId: sender,
        };

        if (text) chatObj.text = text;
        if (img) chatObj.img = img;

        const newChat = new Chat(chatObj);
        await newChat.save();

        res.status(200).json({ msg: "Message sent", chat: newChat });
    } catch (err) {
        console.error("Error in sendMessage:", err.message);
        res.status(500).json({ msg: "Failed to send message" });
    }
};
