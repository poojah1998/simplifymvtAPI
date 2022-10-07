const express = require('express')
const router = express.Router()
const opd = require('./controller')
const verify = require('../hospital-auth/auth.controller');


// Add Opd

router.post('/:patientid/addopd', verify.verifytoken, opd.postAddOpd);
router.get('/:patientid/addopdgroup', verify.verifytoken, opd.getAddOpdGroup);
router.get('/addopdunit/:hospitalid/:patientid', verify.verifytoken, opd.getAddOpdUnit);

// send Opd 


router.post('/:patientid/sendopd', verify.verifytoken, opd.sendOpd);


module.exports = router