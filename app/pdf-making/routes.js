const express = require('express')
const router = express.Router()
const pdf = require('./pdf.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:patientid/pdf', verify.verifytoken, pdf.postPdfData);
router.get('/:patientid/pdf', verify.verifytoken, pdf.getPdfData);
router.put('/pdf/:id', verify.verifytoken, pdf.putPdfData);

module.exports = router