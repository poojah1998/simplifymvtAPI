const express = require('express')
const router = express.Router()
const ref = require('./refferal.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/refferal', verify.verifytoken, ref.plan, ref.postRefferal);
router.post('/loginrefferalpartner', ref.loginRefferalPartner);
router.get('/refferal/:id', ref.getRefferalById);
router.get('/:userid/refferalbylimit', verify.verifytoken, ref.getRefferalByLimit);

router.get('/:userid/refferal', ref.getRefferal);
router.get('/refferalbranchid/:branchid', ref.getRefferalBybranchid);

router.delete('/:userid/refferal/:id', verify.verifytoken, ref.delRefferal);
router.put('/refferal/:id', ref.putRefferal);
router.put('/refferalresetpassword/:id', verify.verifytoken, ref.putResetPassword);

// forgot Password

router.post('/refferal/forgetpassword', ref.forgetPassword);
router.post('/refferal/verifyotp', ref.verifyOtp);
router.put('/refferalpass/updateforgotpassword', ref.updateForgotPassword);

module.exports = router