const express = require('express')
const router = express.Router()
const vil = require('./controller')
const verify = require('../hospital-auth/auth.controller');


// assignVil By Group

router.post('/:patientid/assignvil', verify.verifytoken, vil.uploads, vil.postAssignVil);
router.get('/:patientid/assignvil', verify.verifytoken, vil.getAssignVil);
router.get('/assignvil/:hospitalid/:patientid', verify.verifytoken, vil.getAssignVilByPatientHospital);
// send VIL 


router.post('/:patientid/sendVil', verify.verifytoken, vil.sendVilToFac);
router.post('/:patientid/sendVilMail', verify.verifytoken, vil.sendVilToMail);

router.post('/:patientid/sendVilemb', verify.verifytoken, vil.sendVilToEmb);
router.post('/:patientid/downloadVil', verify.verifytoken, vil.downloadVil);


module.exports = router