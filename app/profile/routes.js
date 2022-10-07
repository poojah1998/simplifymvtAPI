const express = require('express')
const router = express.Router()
const pro = require('./controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/profile', verify.verifytoken, pro.postProfile);
router.get('/:userid/profile', verify.verifytoken, pro.getProfile);
router.put('/profile/:id', verify.verifytoken, pro.putProfile);

module.exports = router