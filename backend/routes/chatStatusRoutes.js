const express = require('express');
const router = express.Router();
const chatStatusController = require('../controllers/chatStatusController');
const { authCheck } = require('../middlewares/auth');

router.route('/updateLastSeen')
.post(authCheck,chatStatusController.updateLastSeen);

router.route('/unseenCount')
.get(authCheck,chatStatusController.getAllUnseenCounts);

module.exports = router;