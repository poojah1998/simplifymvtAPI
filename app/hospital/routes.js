const express = require('express')
const router = express.Router()
const hos = require('./hospital.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/hospitals', verify.verifytoken, hos.plan, hos.postHospital);
router.get('/hospitals/:userid/:city', verify.verifytoken, hos.getHospitalCity);

router.get('/:userid/hospitals', hos.getHospital);
router.delete('/:userid/hospitals/:id', verify.verifytoken, hos.delHospitalid);
router.put('/:userid/hospitals/:id', verify.verifytoken, hos.putHospital);

module.exports = router