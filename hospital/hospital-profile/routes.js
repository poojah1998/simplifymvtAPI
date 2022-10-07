const express = require('express')
const router = express.Router()
const pro = require('./profile.controller')
const verify = require('../hospital-auth/auth.controller');

router.post('/:userid/profile', verify.verifytoken, pro.upload, pro.postProfile);
router.get('/:userid/profile', verify.verifytoken, pro.getProfile);
router.put('/profile/:id', verify.verifytoken, pro.upload, pro.putProfile);

module.exports = router