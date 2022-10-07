const express = require('express')
const router = express.Router()
const pre = require('./prehospitalzone.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/prehospitalzones', verify.verifytoken, pre.plan, pre.postpreHospitalZone);
router.get('/:userid/prehospitalzones', verify.verifytoken, pre.getpreHospitalZOne);
router.delete('/:userid/prehospitalzones/:id', verify.verifytoken, pre.delpreHospitalZone);
router.get('/prehospitalzones/:userid/:hospitalid', verify.verifytoken, pre.getpreHospitalZoneId);
router.get('/prehospitalzonesopinion/:userid/:hospitalid/:country/:treatment', pre.getpreHospitalOpinionZoneId);

router.put('/prehospitalzones/:id', verify.verifytoken, pre.putPreHospitalZone);
router.get('/prehospitalzoness/:id', verify.verifytoken, pre.getpreHospitalZoneIddetail);

// Pre employees Route
router.post('/:userid/preemployees', verify.verifytoken, pre.postpreEmployee);
// router.post('/:userid/preemployeesimport', verify.verifytoken, pre.postpreEmployeeImport);

router.get('/:userid/preemployees', verify.verifytoken, pre.getpreEmployee);
router.delete('/:userid/preemployees/:id', verify.verifytoken, pre.delpreEmployee);
router.get('/preemployees/:userid/:hospitalid', verify.verifytoken, pre.getpreEmployeeId);

router.put('/preemployees/:id', verify.verifytoken, pre.putPreEmployee);
router.get('/preemployeess/:id', verify.verifytoken, pre.getpreEmployeeIddetail);

// Pre doctors Route
router.post('/:userid/predoctors', verify.verifytoken, pre.postpreDoctor);
router.get('/:userid/predoctors', verify.verifytoken, pre.getpreDoctor);
router.delete('/:userid/predoctors/:id', verify.verifytoken, pre.delpreDoctor);
router.get('/predoctors/:userid/:hospitalid', verify.verifytoken, pre.getpreDoctorId);
router.get('/predoctorss/:id', verify.verifytoken, pre.getpreDoctorIddetail);
router.put('/predoctors/:id', verify.verifytoken, pre.putPreDoctor);

// Pre default Route
router.post('/:userid/predefualt', verify.verifytoken, pre.postpreDefualt);
router.get('/:userid/predefualt', verify.verifytoken, pre.getpreDefualt);
router.get('/predefualt/:userid/:hospitalid', pre.getpreDefualtId);
router.get('/predefualtt/:id', verify.verifytoken, pre.getpreDefualtIdDetail);
router.put('/predefualt/:id', verify.verifytoken, pre.putPreDefault);

//get import

// router.get('/:userid/preimport', verify.verifytoken, pre.getpreImport);



module.exports = router