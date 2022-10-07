const express = require('express')
const router = express.Router()
const doc = require('./doctor.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/doctors', doc.upload, verify.verifytoken, doc.plan, doc.postDoctor);
router.post('/:userid/doctorsProfile/:doctorid', verify.verifytoken, doc.downloadDoctorProfile);
router.post('/:hospitalid/doctorsProfileHospital/:doctorid', verify.verifytoken, doc.downloadDoctorProfileByHospital);

router.get('/:userid/doctors', verify.verifytoken, doc.getDoctorid);
router.delete('/:userid/doctors/:id', verify.verifytoken, doc.delDoctorid);
router.put('/doctors/:id', doc.upload, verify.verifytoken, doc.putDoctor);
router.get('/doctors/:userid/:hospitalid', doc.getDoctorHospital);

module.exports = router