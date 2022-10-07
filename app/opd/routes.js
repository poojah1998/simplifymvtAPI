const express = require('express')
const router = express.Router()
const opd = require('./opd.controller')
const verify = require('../facilitator-register/auth.controller')



// hospital opd request
router.post('/:patientid/opdrequest', verify.verifytoken, opd.postOpdRequest);

router.get('/:patientid/opdrequest', opd.getOpdRequest);
router.get('/opdrequest/:id', opd.getOpdRequestById);
router.put('/opdrequeststatus/:id', opd.PutRequestStatus);

// hospital opd response

router.post('/:patientid/opdresponse/', opd.postOpdResponse);
router.get('/:patientid/opdresponse', verify.verifytoken, opd.getOpdResponse);
router.get('/opdresponse/:opdid', opd.getOpdbyOpdId);
router.put('/opdresponse/:id', opd.PutOpdResponse);

// send opd to patient
router.post('/:patientid/opdsent/', verify.verifytoken, opd.opdSent);

module.exports = router