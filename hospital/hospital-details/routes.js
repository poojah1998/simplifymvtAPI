const express = require('express')
const router = express.Router()
const det = require('./details.controller')
const verify = require('../../app/facilitator-register/auth.controller')

router.post('/:userid/details', verify.verifytoken, det.upload, det.postHospitalDetails);
router.get('/:userid/details', verify.verifytoken, det.getHospitalDetailsid);

router.delete('/details/:id', verify.verifytoken, det.delHospitalDetailsid);
router.put('/details/:id', det.upload, verify.verifytoken, det.putHospitalDetails);


// bank details

router.post('/:userid/bankdetails', verify.verifytoken, det.postBankDetails);
router.get('/:userid/bankdetails', verify.verifytoken, det.getBankDetails);
router.put('/bankdetails/:id', verify.verifytoken, det.putBankDetails);
module.exports = router