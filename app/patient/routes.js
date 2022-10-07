const express = require('express')
const router = express.Router()
const verify = require('../facilitator-register/auth.controller')
const pat = require('./patient.controller')

router.post('/:userid/patients', pat.plan, pat.upload, pat.postPatient);

router.post('/:userid/patientestimation/:patientid', verify.verifytoken, pat.patientEstimation);
router.post('/:userid/addpatientestimation/:patientid', verify.verifytoken, pat.patientaddEstimation);
router.post('/:userid/downloadpatientestimation/:patientid', verify.verifytoken, pat.downloadpatientEstimation);

router.get('/:userid/patients', verify.verifytoken, pat.getPatient);
router.get('/:userid/patientsClosed', verify.verifytoken, pat.getPatientClosed);

router.get('/:userid/patientsDashboard', verify.verifytoken, pat.getPatientDashboard);

router.get('/:userid/patientsbylimit', verify.verifytoken, pat.getPatientByLimit);

router.get('/:userid/patientss', verify.verifytoken, pat.getPatientbydate);
router.get('/:userid/patients/:branchid', verify.verifytoken, pat.getPatientByRole);
router.get('/:userid/patientsClosed/:branchid', verify.verifytoken, pat.getPatientByRoleClosed);
router.get('/:userid/patientsDashboard/:branchid', verify.verifytoken, pat.getPatientByRoleDashboard);

router.get('/:userid/patientsbyrefferal/:refferalid', verify.verifytoken, pat.getPatientByRefferal);
router.get('/:userid/patientsbyrefferalClosed/:refferalid', verify.verifytoken, pat.getPatientByRefferalClosed);

router.get('/:userid/patientsbyrefferalDashboard/:refferalid', verify.verifytoken, pat.getPatientByRefferalDashboard);

router.get('/:userid/patientsroledate/:branchid', verify.verifytoken, pat.getPatientByRoleDate);
router.get('/:userid/patientsbyrefferaldate/:refferalid', verify.verifytoken, pat.getPatientByRefferalDate);

router.delete('/:userid/patients/:id', verify.verifytoken, pat.delPatientid);
router.get('/patients/:id', pat.getPatientId);
router.put('/patients/:id', verify.verifytoken, pat.upload, pat.putPatient);
router.put('/patientComment/:id', pat.comment);
router.put('/patientClosed/:id', pat.closed);
router.put('/patientOpen/:id', pat.opened);

router.get('/getTotalPatient', verify.verifytoken, pat.getTotalPatient);
router.get('/getTotalPatientMonth', verify.verifytoken, pat.getTotalPatientByMonth);
router.get('/getTotalVil', verify.verifytoken, pat.getTotalVil);
router.get('/getTotalVilMonth', verify.verifytoken, pat.getTotalVilByMonth);

router.get('/getTotalConf', verify.verifytoken, pat.getTotalConf);
router.get('/getTotalConfMonth', verify.verifytoken, pat.getTotalConfByMonth);

router.get('/getTotalOpd', verify.verifytoken, pat.getTotalOpd);
router.get('/getTotalOpdMonth', verify.verifytoken, pat.getTotalOpdByMonth);

router.get('/getTotalFacilitator', verify.verifytoken, pat.getTotalFacilitator);
router.get('/getTotalFacilitatorMonth', verify.verifytoken, pat.getTotalFacilitatorByMonth);

router.get('/getTotalHospitalUser', verify.verifytoken, pat.getTotalHospitalUser);
router.get('/getTotalHospitalUserMonth', verify.verifytoken, pat.getTotalHospitalUserByMonth);

router.get('/getTotalPatientByCountry', verify.verifytoken, pat.getTotalPatientByCountry);
router.get('/getTotalPatientByCountryLast6Months', verify.verifytoken, pat.getTotalPatientByCountryLast6Months);
router.get('/getTotalPatientByCountryCurrentMonth', verify.verifytoken, pat.getTotalPatientByCountryCurrentMonth);

router.get('/getTotalVilByCountry', verify.verifytoken, pat.getTotalVilByCountry);

router.get('/getTotalVilByCountryLast6Months', verify.verifytoken, pat.getTotalVilByCountryLast6Months);
router.get('/getTotalVilByCountryCurrentMonth', verify.verifytoken, pat.getTotalVilByCountryCurrentMonth);

router.get('/getTotalConfByCountry', verify.verifytoken, pat.getTotalConfByCountry);

router.get('/getTotalConfByCountryLast6Months', verify.verifytoken, pat.getTotalConfByCountryLast6Months);
router.get('/getTotalConfByCountryCurrentMonth', verify.verifytoken, pat.getTotalConfByCountryCurrentMonth);

router.get('/getTotalPatientByTreatment', verify.verifytoken, pat.getTotalPatientByTreatment);
router.get('/getTotalPatientByTreatmentLast6Months', verify.verifytoken, pat.getTotalPatientByTreatmentLast6Months);
router.get('/getTotalPatientByTreatmentCurrentMonth', verify.verifytoken, pat.getTotalPatientByTreatmentCurrentMonth);

router.get('/getTotalVilByTreatment', verify.verifytoken, pat.getTotalVilByTreatment);

router.get('/getTotalVilByTreatmentLast6Months', verify.verifytoken, pat.getTotalVilByTreatmentLast6Months);
router.get('/getTotalVilByTreatmentCurrentMonth', verify.verifytoken, pat.getTotalVilByTreatmentCurrentMonth);

router.get('/getTotalConfByTreatment', verify.verifytoken, pat.getTotalConfByTreatment);

router.get('/getTotalConfByTreatmentLast6Months', verify.verifytoken, pat.getTotalConfByTreatmentLast6Months);
router.get('/getTotalConfByTreatmentCurrentMonth', verify.verifytoken, pat.getTotalConfByTreatmentCurrentMonth);

router.get('/getDataLast6Months', verify.verifytoken, pat.getDataLast6Months);
router.get('/getVilLast6Months', verify.verifytoken, pat.getDataLast6MonthsVil);
router.get('/getConfLast6Months', verify.verifytoken, pat.getDataLast6MonthsConf);

module.exports = router