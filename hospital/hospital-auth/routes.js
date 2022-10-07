const express = require('express')
const router = express.Router()
const hosauth = require('./auth.controller');
const verify = require('../../app/facilitator-register/auth.controller');

router.post('/login', hosauth.login);

router.post('/register', hosauth.verifytoken, verify.validateRole, hosauth.register);
router.get('/register', hosauth.verifytoken, verify.validateRole, hosauth.registerget);
router.get('/register/:id', hosauth.verifytoken, hosauth.registerid);
router.put('/register/:id', hosauth.verifytoken, verify.validateRole, hosauth.registerupdate);
router.put('/registerprofile/:id', hosauth.verifytoken, hosauth.registerProfileUpdate);

router.delete('/register/:id', hosauth.verifytoken, verify.validateRole, hosauth.registerdelete);

// userroles
router.post('/loginuserroles', hosauth.loginuserroles);
router.post('/:userid/userroles', hosauth.verifytoken, hosauth.plan, hosauth.userroles);
router.get('/:userid/userroles', hosauth.verifytoken, hosauth.userrolesgetbyid);

router.get('/userroles', hosauth.verifytoken, hosauth.userrolesget);
router.get('/planuser/:id', verify.verifytoken, hosauth.getUserByLimit);
router.put('/userRolesProfile/:id', hosauth.verifytoken, hosauth.userRolesProfileUpdate);

router.get('/userroles/:id', hosauth.verifytoken, hosauth.userrolesid);
router.put('/userroles/:id', hosauth.verifytoken, hosauth.userrolesupdate);
router.delete('/:userid/userroles/:id', hosauth.verifytoken, hosauth.userrolesdelete);
router.get('/hospitalUsers/:hospitalid', verify.verifytoken, hosauth.getUsersByHospitalId);

// forgot password

router.post('/register/forgetpassword', hosauth.forgetPassword);
router.post('/register/verifyotp', hosauth.verifyOtp);
router.put('/registerr/updateforgotpassword', hosauth.updateForgotPassword);
module.exports = router