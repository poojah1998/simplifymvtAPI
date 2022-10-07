const express = require('express')
const router = express.Router()
const reqvil = require('./requestvil.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/:patientid/requestvil', verify.verifytoken, reqvil.uploads, reqvil.postRequestvil);
router.post('/:userid/:patientid/requestvilresend', verify.verifytoken, reqvil.postVilRequestResend);

router.post('/:patientid/sentvil', verify.verifytoken, reqvil.postSentvil);
router.get('/requestvilhospital/:email', verify.verifytoken, reqvil.getRequestVilByEmail);

router.get('/:userid/:patientid/requestvil', verify.verifytoken, reqvil.getRequestvil);
router.put('/requestvil/:id', verify.verifytoken, reqvil.Putrequestvil);

// response vil
router.post('/:userid/:patientid/responsevil', verify.verifytoken, reqvil.uploadvil, reqvil.postResponsevil);

router.get('/:userid/:patientid/responsevil', verify.verifytoken, reqvil.getResponsevil);
router.get('/:userid/responsevil', verify.verifytoken, reqvil.getResponsevilbyuser);

router.get('/:patientid/responsevil/:hospitalid', verify.verifytoken, reqvil.getResponseVilByHospital);
router.put('/responsevil/:id', verify.verifytoken, reqvil.uploadvil, reqvil.putResponsevil);




module.exports = router