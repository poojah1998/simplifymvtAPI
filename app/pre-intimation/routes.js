const express = require('express')
const router = express.Router()
const int = require('./intimation.controller')
const verify = require('../facilitator-register/auth.controller')



// hospital vil
router.post('/:patientid/preintimation', int.postPreIntemation);

router.get('/:patientid/preintimation', int.getPreIntimation);


module.exports = router