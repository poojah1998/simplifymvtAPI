const express = require('express')
const router = express.Router()
const pi = require('./pi.controller')
const verify = require('../facilitator-register/auth.controller')



// hospital pi request
router.post('/:patientid/pi', verify.verifytoken, pi.postPiRequest);
router.post('/:patientid/pidirect', verify.verifytoken, pi.postPiRequestPreIntimationDirect);
router.post('/:patientid/pidirecthospital', verify.verifytoken, pi.postPiRequestDirectHospital);

router.get('/:patientid/pi', pi.getPiRequest);
router.get('/pi/:id', pi.getPiRequestById);
router.put('/pi/:id', pi.PutPiStatus);

// hospital pi response

router.post('/:patientid/piresponse/', pi.upload, pi.postPiResponse);
router.get('/:patientid/piresponse', verify.verifytoken, pi.getPiResponse);
router.get('/piresponse/:piid', pi.getPibyPiId);
router.put('/piresponse/:id', verify.verifytoken, pi.upload, pi.PutPiResponse);

// send pi to patient
router.post('/:patientid/pisent/', verify.verifytoken, pi.piSent);

module.exports = router