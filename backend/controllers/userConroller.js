const User = require('../models/user');
const Chat = require('../models/chat');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { createJWTToken } = require('../lib/util');
const axios = require('axios');

dotenv.config();

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .populate('friends', 'name email profilePic _id lastMsg')
      .populate('sentRequests', 'name email profilePic _id')
      .populate('recievedRequests', 'name email profilePic _id');

    if (user && await bcrypt.compare(password, user.password)) {
      res = createJWTToken(user, res);
      res.status(200).json({ msg: "login successful", user });
    } else {
      res.status(400).json({ msg: "email or password is incorrect" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
    err.message = "login failed"
  }
};

module.exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res = createJWTToken(newUser, res);
    res.status(200).json({ msg: "user successfully registered", user: newUser });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed", error: err.message });
  }
};

module.exports.updatePhoto = async (req, res) => {
  try {
    const img = req.file?.path;
    const userId = req.user.id;

    if (!img) return res.status(500).json({ message: "image not received" });

    const result = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic: img } },
      { new: true }
    );

    if (result) {
      res.status(200).json({ message: "profile updated successfully", result });
    } else {
      res.status(500).json({ message: "profile update failed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

module.exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'name email profilePic _id lastMsg')
      .populate('sentRequests', 'name email profilePic _id')
      .populate('recievedRequests', 'name email profilePic _id');

    res.status(200).json({ msg: "data fetched", userData: user });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user data", error: err.message });
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    const query = req.query.query || "";
    const loggedInUserId = req.user.id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
      name: { $regex: query, $options: "i" }
    }).select("-password");

    res.status(200).json({ users: filteredUsers });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

module.exports.logout = (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true, 
      sameSite: 'None', 
      path: '/', 
    });
    res.status(200).json({ msg: "logged out successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Logout failed", error: err.message });
  }
};

module.exports.googleLogin = async (req, res) => {
  try {
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID
      }&redirect_uri=${process.env.GOOGLE_REDIRECT_URI
      }&response_type=code&scope=email%20profile`;

    res.redirect(redirectUrl);
  } catch (err) {
    res.status(500).json({ msg: "Google login init failed", error: err.message });
  }
};

module.exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

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

    const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: googleId, email, name } = userInfoRes.data;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, googleId });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    createJWTToken(user, res);
    res.redirect(`https://buzzii-chat-app.vercel.app//`);
  } catch (err) {
    console.error("Google login error", err.message);
    res.status(500).send("Login failed");
  }
};

module.exports.sendReq = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: personToMakeFriendId } = req.params;

    if (userId === personToMakeFriendId) {
      return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    const user = await User.findById(userId);
    const target = await User.findById(personToMakeFriendId);

    if (!user || !target) {
      return res.status(404).json({ msg: "User not found." });
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { sentRequests: personToMakeFriendId } });
    await User.findByIdAndUpdate(personToMakeFriendId, { $addToSet: { recievedRequests: userId } });

    const data = await User.findById(userId)
      .populate('friends', 'name email profilePic _id lastMsg')
      .populate('sentRequests', 'name email profilePic _id')
      .populate('recievedRequests', 'name email profilePic _id');

    res.status(200).json({ msg: "request sent", userData: data });
  } catch (err) {
    res.status(500).json({ msg: "Failed to send request", error: err.message });
  }
};

module.exports.acceptReq = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: senderId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: senderId },
      $pull: { recievedRequests: senderId }
    });

    await User.findByIdAndUpdate(senderId, {
      $addToSet: { friends: userId },
      $pull: { sentRequests: userId }
    });

    const result = await User.findById(userId)
      .populate('friends', 'name email profilePic _id lastMsg')
      .populate('sentRequests', 'name email profilePic _id')
      .populate('recievedRequests', 'name email profilePic _id');

    res.status(200).json({ msg: "friend added successfully", result });
  } catch (err) {
    res.status(500).json({ msg: "Failed to accept request", error: err.message });
  }
};

module.exports.rejectReq = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: senderId } = req.params;

    await User.findByIdAndUpdate(userId, { $pull: { recievedRequests: senderId } });
    await User.findByIdAndUpdate(senderId, { $pull: { sentRequests: userId } });

    const result = await User.findById(userId)
      .populate('friends', 'name email profilePic _id lastMsg')
      .populate('sentRequests', 'name email profilePic _id')
      .populate('recievedRequests', 'name email profilePic _id');

    res.status(200).json({ msg: "friend request removed successfully", result });
  } catch (err) {
    res.status(500).json({ msg: "Failed to reject request", error: err.message });
  }
};

module.exports.deleteFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: friendId } = req.params;

    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ msg: "not a friend" });
    }

    const newUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true }
    ).populate('friends', 'name email profilePic _id lastMsg')
     .populate('sentRequests', 'name email profilePic _id')
     .populate('recievedRequests', 'name email profilePic _id');

    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    await Chat.deleteMany({
      $or: [
        { $and: [{ senderId: userId }, { recieverId: friendId }] },
        { $and: [{ senderId: friendId }, { recieverId: userId }] }
      ]
    });

    return res.status(200).json({ msg: "friend removed", result: newUser });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete friend", error: err.message });
  }
};
