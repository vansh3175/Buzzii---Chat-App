const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {authCheck} = require('../middlewares/auth');
const {upload} = require('../lib/cloudinary');

router.route('/:id')
.get(authCheck,chatController.getMessages)
.post(authCheck,upload.single('image'),chatController.sendMessage)

module.exports = router;

