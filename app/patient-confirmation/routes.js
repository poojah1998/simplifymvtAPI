const express = require('express')
const router = express.Router()
const conf = require('./confirmation.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:patientid/confirmation', verify.verifytoken, conf.upload, conf.postConfirmation);
router.get('/:patientid/confirmation', verify.verifytoken, conf.getConfirmation);

module.exports = router