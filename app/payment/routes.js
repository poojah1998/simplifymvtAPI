const express = require('express')
const router = express.Router()
const pay = require('./payment.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/order', pay.order);
router.post('/order/verify', pay.orderVerify);


module.exports = router