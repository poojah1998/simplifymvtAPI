const express = require('express')
const router = express.Router()
const req = require('./request.controller')
    // opinion request
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/opinionrequests/:patientid', verify.verifytoken, req.postOpinionrequest);
router.post('/:userid/opinionrequestresend/:patientid', verify.verifytoken, req.postOpinionRequestResend);

router.get('/:userid/opinionrequests/:patientid', verify.verifytoken, req.getOpinionrequest);

router.get('/opinionrequestsbyhospital/:userid/:hospitalname', verify.verifytoken, req.getOpinionRequestByHospital);

router.get('/opinionrequestshospitalbydate/:email', verify.verifytoken, req.getRequestByEmailDate);
router.get('/hospitalperformance/:userid', verify.verifytoken, req.hospitalPerformance);
router.get('/hospitalperformancebypatient/:userid', verify.verifytoken, req.hospitalPerformanceByPatient);

router.put('/opinionrequestsread/:id', verify.verifytoken, req.putOpinionrequestread);

router.get('/opinionrequests/:id', req.getOpinionrequestid);
router.put('/opinionrequests/:id', req.PutOpinionrequest);
router.put('/opinionhistoryreviewed/:id', req.PutOpinionHistoryReviewed);


// opinion received

router.post('/:requestid/opinionreceived/:patientid', req.postOpinionreceived);
router.get('/opinionreceived/:patientid', verify.verifytoken, req.getOpinionreceived);
router.get('/:patientid/hospitalopinionhospital/:hospitalname', verify.verifytoken, req.getHospitalOpinionbyhospital);
router.get('/opinionreceivedd/:opinionid', req.getOpinionreceivedByopinionid);

router.put('/opinionreceived/:id', verify.verifytoken, req.putOpinionResponseReadByRole);
router.get('/opinionreceived/:id', verify.verifytoken, req.getOpinionreceivedid);

// opinion received edited
router.post('/:userid/opinionreceivededit/:patientid', req.postOpinionreceivededit);
router.get('/:userid/opinionreceivededit/:patientid', verify.verifytoken, req.getOpinionreceivededit);
router.put('/opinionreceivededit/:id', verify.verifytoken, req.putOpinionResponseEditReadByRole);

// hospital opinion
router.post('/:requestid/hospitalopinion/:patientid', req.postHospitalOpinion);
router.get('/:requestid/hospitalopinion/:patientid', req.getHospitalOpinion);
router.get('/hospitalopinion/:id', req.getHospitalOpinionid);
router.get('/hospitalopinionn/:opinionid', req.getHospitalOpinionPopulate);

// doctor opinion
router.post('/:requestid/doctoropinion/:patientid/:hospitalopinionid', req.postDoctorOpinion);
router.get('/:requestid/doctoropinion/:patientid/:hospitalopinionid', req.getDoctorOpinion);
router.get('/doctoropinion/:id', req.getDoctorByIdOpinion);
router.put('/doctorrequestsread/:id', verify.verifytoken, req.putDoctorrequestread);

router.put('/doctoropinion/:id', req.putDoctorOpinion);
module.exports = router