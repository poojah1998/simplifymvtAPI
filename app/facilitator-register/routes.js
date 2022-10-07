const express = require('express')
const router = express.Router()
const auth = require('./auth.controller');
router.post('/login', auth.login);

router.post('/register', auth.verifytoken, auth.register);
router.post('/register/forgetpassword', auth.forgetPassword);
router.post('/register/verifyotp', auth.verifyOtp);
router.put('/register/updateforgotpassword', auth.updateForgotPassword);
router.put('/updatePassword/:id', auth.updatePassword);

router.get('/register', auth.verifytoken, auth.validateRole, auth.registerget);
router.get('/getAllFacilitator', auth.verifytoken, auth.getAllFacilitator);

router.get('/register/:id', auth.registerid);
router.put('/register/:id', auth.verifytoken, auth.validateRole, auth.registerupdate);
// router.put('/registerApproved/:id', auth.verifytoken, auth.registerApproved);


router.delete('/register/:id', auth.verifytoken, auth.validateRole, auth.registerdelete);

// userroles

router.post('/loginuserroles', auth.loginuserroles);
router.post('/:userid/userroles', auth.plan, auth.verifytoken, auth.userroles);
router.post('/userroles/forgetpassword', auth.forgetUserRolePassword);
router.put('/userUpdatePassword/:id', auth.userUpdatePassword);

router.post('/userroles/verifyotp', auth.verifyUserRoleOtp);
router.put('/userroles/updateforgotpassword', auth.updateUserRoleForgotPassword);
router.get('/:userid/userroles', auth.userrolesgetbyid);
router.get('/userroles', auth.verifytoken, auth.validateRole, auth.userrolesget);
router.get('/userrolebranch/:country/:userid', auth.userRolesGetByCountry);
router.get('/:userid/usersbylimit', auth.verifytoken, auth.getUsersByLimit);

router.get('/userroles/:id', auth.userrolesid);
router.put('/userroles/:id', auth.verifytoken, auth.userrolesupdate);
router.delete('/:userid/userroles/:id', auth.verifytoken, auth.userrolesdelete);
module.exports = router