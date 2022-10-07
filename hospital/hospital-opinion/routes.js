const express = require('express')
const router = express.Router()
const add = require('./controller')
const verify = require('../hospital-auth/auth.controller');


// assignQueries

router.post('/:patientid/addopinion', verify.verifytoken, add.postAddOpinion);
router.post('/:patientid/editopinion', verify.verifytoken, add.postEditOpinion);

router.get('/:patientid/addopiniongroup', verify.verifytoken, add.getAddOpinionGroup);
router.get('/addopinionunit/:hospitalid/:patientid', verify.verifytoken, add.getAddOpinionUnit);

// send opinion 


router.post('/:patientid/sendopinion', verify.verifytoken, add.sendOpinion);
router.post('/:patientid/downloadopinion', verify.verifytoken, add.downloadOpinion);


// Hospital opinion

router.post('/:opinionid/hospitalOpinion/', add.postHospitalOpinion);
router.get('/:patientid/:hospitalid/hospitalOpinion/', add.getHospitalOpinion);
router.get('/:patientid/hospitalOpinion/', add.getHospitalOpinionGroup);

router.get('/hospitalOpinionDoctor/:id', add.getHospitalOpinionPatient);

// doctor opinion
router.post('/doctorOpinion/:hospitalopinionid', add.postDoctorOpinion);
router.get('/doctorOpinion/:id', add.getDoctorByIdOpinion);

// router.put('/doctorOpinion/:id', add.putDoctorOpinion);

module.exports = router