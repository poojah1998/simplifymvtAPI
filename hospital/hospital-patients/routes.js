const express = require('express')
const router = express.Router()
const pat = require('./patient.controller')
const verify = require('../hospital-auth/auth.controller');

router.post('/patient', verify.verifytoken, pat.plan, pat.upload, pat.postPatient);
router.get('/patient/:hospitalid', verify.verifytoken, pat.getPatientByUnit);
router.get('/grouppatient/:hospitalgroup', verify.verifytoken, pat.getPatientByGroup);
router.delete('/:hospitalid/patient/:id', verify.verifytoken, pat.delPatientid);
router.put('/patient/:id', verify.verifytoken, pat.upload, pat.putPatient);
router.get('/patientid/:id', verify.verifytoken, pat.getPatientById);
router.get('/planqueries/:id', verify.verifytoken, pat.getPatientByLimit);


// assignQueries By Group

router.post('/:patientid/assignquery', verify.verifytoken, pat.postAssignQuery);
router.get('/:patientid/assignquery', verify.verifytoken, pat.getAssignQuery);
router.get('/assignquery/:hospitalid/:patientid', verify.verifytoken, pat.getAssignQueryByPatientHospital);

router.put('/assignquery/:id', pat.PutAssignQueryStatus);

// assignOpd By Group

router.post('/:patientid/assignopd', verify.verifytoken, pat.postAssignOpd);
router.get('/:patientid/assignopd', verify.verifytoken, pat.getAssignOpd);
router.get('/assignopd/:hospitalid/:patientid', verify.verifytoken, pat.getAssignOpdByPatientHospital);

router.put('/assignopd/:id', pat.PutAssignOpdStatus);



// get Facilitator Request Patient
router.get('/patientrequest/:hospitalid', verify.verifytoken, pat.getPatientRequestByUnit);
router.get('/patientrequestgroup/:hospitalgroup', verify.verifytoken, pat.getPatientRequestByGroup);
router.get('/patientrequestqrymngmt/:hospitalid', verify.verifytoken, pat.getPatientRequestQryMngmtByUnit);
router.get('/patientrequestqrymngmtgroup/:hospitalgroup', verify.verifytoken, pat.getPatientRequestQryMngmtByGroup);
router.get('/singlepatientrequestqrymngmt/:hospitalgroup/:patientid', verify.verifytoken, pat.getSinglePatientRequestQryMngmt);
router.get('/singlepatientrequestqrymngmtunit/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientRequestQryMngmtByUnit);

router.get('/patientOpinionReveivedByGroup/:patientid/:hospitalgroup', verify.verifytoken, pat.getOpininReceivedByGroup);
router.post('/:requestid/patientopinionresponse/:patientid', verify.verifytoken, pat.postPatientRequest);
router.post('/:requestid/downloadopinionresponse/:patientid', verify.verifytoken, pat.postDownloadPatientRequest);

router.post('/:requestid/addopinionresponse/:patientid', verify.verifytoken, pat.addPatientRequest);
router.get('/:patientid/facaddopinion', verify.verifytoken, pat.getAddFacOpinionGroup);
router.get('/facaddopinionunit/:hospitalid/:patientid', verify.verifytoken, pat.getAddFacOpinionUnit)

router.post('/:requestid/editopinionresponse/:patientid', verify.verifytoken, pat.editPatientRequest);
router.get('/:patientid/faceditopinion', verify.verifytoken, pat.getEditFacOpinionGroup);
router.get('/faceditopinionunit/:hospitalid/:patientid', verify.verifytoken, pat.getEditFacOpinionUnit)
    // get Facilitator vil Patient
router.get('/patientvil/:hospitalid', verify.verifytoken, pat.getPatientVilByUnit);
router.get('/patientvilgroup/:hospitalgroup', verify.verifytoken, pat.getPatientVilByGroup);
router.get('/patientvilid/:id', verify.verifytoken, pat.getPatientVilById);

// hospital vil
router.post('/:userid/:patientid/vil', verify.verifytoken, pat.postHospitalVil);
router.post('/:userid/:patientid/vilMail', verify.verifytoken, pat.postHospitalVilMail);

router.post('/:userid/:patientid/downloadvil', verify.verifytoken, pat.postHospitalVilDownload);
router.post('/:userid/:patientid/embassyvil', verify.verifytoken, pat.postHospitalVilEmbassy);
router.get('/singlePatientVil/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientVil);
router.get('/singlePatientVilByUnit/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientVilByUnit);

router.get('/embassycms/:country', verify.verifytoken, pat.getEmbassyCms);

router.get('/responsevil/:patientid/:hospitalid', verify.verifytoken, pat.getResponseVilById);
router.get('/responsevilgroup/:hospitalgroup', verify.verifytoken, pat.getResponseVilGroup);
router.get('/responsevilunit/:hospitalid', verify.verifytoken, pat.getResponseVilUnit);



// get Patient intimation
router.get('/patientpreintimation/:hospitalid', verify.verifytoken, pat.getPatientPreIntimationByUnit);
router.get('/patientpreintimationgroup/:hospitalgroup', verify.verifytoken, pat.getPatientPreIntimationByGroup);
router.post('/patientpreintimation', verify.verifytoken, pat.postPatientIntimation);

// get Patient Opd
router.get('/patientopd/:hospitalid', verify.verifytoken, pat.getPatientOpdByUnit);
router.get('/patientopdgroup/:hospitalgroup', verify.verifytoken, pat.getPatientOpdByGroup);
router.get('/patientresopd/:hospitalid', verify.verifytoken, pat.getPatientOpdResByUnit);
router.get('/patientopdresgroup/:hospitalgroup', verify.verifytoken, pat.getPatientOpdResByGroup);
router.get('/patientopdid/:id', verify.verifytoken, pat.getPatientOpdById);
router.get('/patientopdresponse/:id', verify.verifytoken, pat.getResponseOpdByOpdId);
router.post('/:patientid/patientopdresponse', verify.verifytoken, pat.postOpdResponse);
router.get('/singlePatientOpd/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientOpd);
router.get('/singlePatientOpdByUnit/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientOpdByUnit);

router.post('/addopdresponse/:patientid', verify.verifytoken, pat.addPatientOpd);
router.get('/:patientid/facaddopd', verify.verifytoken, pat.getAddFacOpdGroup);
router.get('/facaddopdunit/:hospitalid/:patientid', verify.verifytoken, pat.getAddFacOpdUnit)
    // get PI Request

router.get('/patientpi/:hospitalid', verify.verifytoken, pat.getPatientPiByUnit);
router.get('/patientpigroup/:hospitalgroup', verify.verifytoken, pat.getPatientPiByGroup);
router.get('/patientpiid/:id', verify.verifytoken, pat.getPatientPiById);
router.get('/patientpiresponse/:id', verify.verifytoken, pat.getResponsePiByPiId);
router.post('/:patientid/patientpiresponse', verify.verifytoken, pat.postPiResponse);
router.get('/:patientid/facaddpi', verify.verifytoken, pat.getAddFacPiGroup);
router.get('/facaddpiunit/:hospitalid/:patientid', verify.verifytoken, pat.getAddFacPiUnit)
router.get('/singlePatientPi/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientPi);
router.get('/singlePatientPiByUnit/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientPiByUnit);
// Patient Confirmation

router.get('/patientconf/:hospitalid', verify.verifytoken, pat.getPatientConfByUnit);
router.get('/patientconfgroup/:hospitalgroup', verify.verifytoken, pat.getPatientConfByGroup);
router.get('/patientconfid/:id', verify.verifytoken, pat.getPatientConfById);
router.put('/patientconf/:id', verify.verifytoken, pat.putConfirmation);
router.get('/singlePatientConf/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientConf);
router.get('/singlePatientConfByUnit/:hospitalid/:patientid', verify.verifytoken, pat.getSinglePatientConfByUnit);

// Hospital Performance

router.get('/hospitalperformancegroup/:hospitalgroup', verify.verifytoken, pat.hospitalPerformanceByGroup);
router.get('/hospitalperformanceunit/:hospitalid', verify.verifytoken, pat.hospitalPerformanceByUnit);

router.get('/hospitalperformancebypatientgroup/:hospitalgroup', verify.verifytoken, pat.hospitalPerformanceByPatientGroup);
router.get('/hospitalperformancebypatientunit/:hospitalid', verify.verifytoken, pat.hospitalPerformanceByPatientUnit);
router.get('/opinionbyhospital/:hospitalname', verify.verifytoken, pat.getOpinionRequestByHospital);
router.get('/opinionbypatient/:patientid', verify.verifytoken, pat.getOpinionRequestByPatientid);


// Hospital Performance Own Patient
router.get('/ownhospitalperformancegroup/:hospitalgroup', verify.verifytoken, pat.ownHospitalPerformanceByGroup);
router.get('/ownhospitalperformanceunit/:hospitalid', verify.verifytoken, pat.ownHospitalPerformanceByUnit);
router.get('/ownhospitalperformancebypatientgroup/:hospitalgroup', verify.verifytoken, pat.ownHospitalPerformanceByPatientGroup);
router.get('/ownhospitalperformancebypatientunit/:hospitalid', verify.verifytoken, pat.ownHospitalPerformanceByPatientUnit);
router.get('/ownopinionbyhospital/:hospitalname', verify.verifytoken, pat.getOwnOpinionRequestByHospital);
router.get('/ownopinionbypatient/:patientid', verify.verifytoken, pat.getOwnOpinionRequestByPatientid);
module.exports = router