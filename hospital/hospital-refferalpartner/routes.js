const express = require('express')
const router = express.Router()
const ref = require('./refferal.controller')
const verify = require('../hospital-auth/auth.controller');

router.post('/:userid/refferalpartner', verify.verifytoken, ref.plan, ref.postRefferalPartner);
router.get('/:userid/refferalpartner', verify.verifytoken, ref.getRefferalPartner);
router.get('/refferal/:id', ref.getRefferalById);
router.delete('/:userid/refferalpartner/:id', verify.verifytoken, ref.delRefferalPartner);
router.put('/refferalpartner/:id', verify.verifytoken, ref.putRefferalPartner);
router.get('/planrefferal/:id', verify.verifytoken, ref.getRefferalByLimit);
router.post('/loginpartner', ref.loginPartner);
router.put('/refferalresetpassword/:id', verify.verifytoken, ref.putResetPassword);

// get Facilitator as Refferal Partner
router.get('/facilitator', verify.verifytoken, ref.getFacilitator);
router.get('/facilitator/:hospitalgroup', verify.verifytoken, ref.getFacilitatorByGroup);
router.get('/facilitatorunit/:hospitalid', verify.verifytoken, ref.getFacilitatorByUnit);

// router.get('/hospitalpatientrequestgroup/:hospitalgroup', verify.verifytoken, pat.getPatientRequestByGroup);

module.exports = router