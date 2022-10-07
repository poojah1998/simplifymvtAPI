const express = require('express')
const router = express.Router()
const my = require('./myhospitalzone.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/myhospitalzones', verify.verifytoken, my.plan, my.postmyHospitalZone);
router.get('/:userid/myhospitalzones', verify.verifytoken, my.getmyHospitalZOne);
router.delete('/:userid/myhospitalzones/:id', verify.verifytoken, my.delmyHospitalZone);
router.get('/myhospitalzones/:userid/:hospitalid', verify.verifytoken, my.getmyHospitalZoneId);
router.get('/myhospitalzonesopinion/:userid/:hospitalid/:country/:treatment', my.getmyHospitalOpinionZoneId);

router.put('/myhospitalzones/:id', verify.verifytoken, my.putmyHospitalZone);
router.get('/myhospitalzoness/:id', verify.verifytoken, my.getmyHospitalZoneIddetail);

// My employees Rooute
router.post('/:userid/myemployees', verify.verifytoken, my.postmyEmployee);
router.get('/:userid/myemployees', verify.verifytoken, my.getmyEmployee);
router.delete('/:userid/myemployees/:id', verify.verifytoken, my.delmyEmployee);
router.get('/myemployees/:userid/:hospitalid', verify.verifytoken, my.getmyEmployeeId);

router.put('/myemployees/:id', verify.verifytoken, my.putmyEmployee);
router.get('/myemployeess/:id', verify.verifytoken, my.getmyEmployeeIddetail);

// My doctors Route
router.post('/:userid/mydoctors', verify.verifytoken, my.postmyDoctor);
router.get('/:userid/mydoctors', verify.verifytoken, my.getmyDoctor);
router.delete('/:userid/mydoctors/:id', verify.verifytoken, my.delmyDoctor);
router.get('/mydoctors/:userid/:hospitalid', verify.verifytoken, my.getmyDoctorId);
router.get('/mydoctorss/:id', verify.verifytoken, my.getmyDoctorIddetail);
router.put('/mydoctors/:id', verify.verifytoken, my.putmyDoctor);

// Pre default Route
router.post('/:userid/mydefualt', verify.verifytoken, my.postMyDefualt);
router.get('/:userid/mydefualt', verify.verifytoken, my.getMyDefualt);
router.get('/mydefualt/:userid/:hospitalid', my.getMyDefualtId);
router.get('/mydefualtt/:id', verify.verifytoken, my.getMyDefualtIdDetail);
router.put('/mydefualt/:id', verify.verifytoken, my.putMyDefault);
module.exports = router