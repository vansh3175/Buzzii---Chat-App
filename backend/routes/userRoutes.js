const express = require('express');
const router = express.Router();
const userController = require('../controllers/userConroller')
const {authCheck} = require('../middlewares/auth')
const {upload} = require('../lib/cloudinary');

router.route('/signup')
.post(userController.signup);

router.route('/login')
.post(userController.login);

router.route('/logout')
.get(authCheck,userController.logout);

router.route('/getUserData')
.get(authCheck,userController.getUserData);

router.route('/getUsers')
.get(authCheck,userController.getUsers);

router.route('/updateProfilePic')
.post(authCheck,upload.single('img'),userController.updatePhoto);

module.exports = router;
