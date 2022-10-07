const express = require('express')
const router = express.Router()
const conf = require('./controller')
const verify = require('../hospital-auth/auth.controller');




// assignConf By Group

router.post('/:patientid/assignconf', verify.verifytoken, conf.uploadTicket, conf.postAssignConf);
router.get('/:patientid/assignconf', verify.verifytoken, conf.getAssignConf);
router.get('/assignconf/:hospitalid/:patientid', verify.verifytoken, conf.getAssignConfByPatientHospital);


module.exports = router