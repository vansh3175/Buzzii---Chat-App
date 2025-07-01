const Chat = require("../models/chat");
const ChatStatus = require('../models/chatStatus');
const User = require("../models/user");

module.exports.updateLastSeen = async (req, res) => {
    const userId = req.user.id;
    const { chatWith } = req.body;

    if (!userId || !chatWith) {
        return res.status(400).json({ message: 'Missing userId or chatWith' });
    }

    try {
        const updated = await ChatStatus.findOneAndUpdate(
        { userId, chatWith },
        { lastSeenAt: new Date() },
        { upsert: true, new: true } //upsert to creat if not there
        );

        res.status(200).json({ message: "Updated LastSeen", data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports.getAllUnseenCounts = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  try {
    // Get all friends (you can replace this if you already have it in frontend)
    const userData = await User.findById(userId).populate('friends','name email _id');
    const friends = userData.friends;

    const chatStatuses = await ChatStatus.find({ userId });

    const lastSeenMap = {};
    chatStatuses.forEach(status => {
      lastSeenMap[status.chatWith] = status.lastSeenAt;   //last time i saw that friend 
    });

    // Prepare all promises to count messages for each friend
    const countPromises = friends.map(async (friend) => {
    const friendIdStr = friend._id.toString(); 
    const unseenCount = await Chat.countDocuments({
        senderId: friend._id,
        recieverId: userId,
        createdAt: {
        $gt: lastSeenMap[friendIdStr] || new Date(0)
        }
    });
    return { [friendIdStr]: unseenCount };
    });


    const countsArray = await Promise.all(countPromises);
    const counts = Object.assign({}, ...countsArray);

    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};