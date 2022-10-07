const express = require('express')
const router = express.Router()
const log = require('./logger')
const verify = require('../facilitator-register/auth.controller')

router.get('/:id/getlogs', verify.verifytoken, log.getLogs);

module.exports = router