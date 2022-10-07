const express = require('express')
const router = express.Router()
const dis = require('./controller')
const verify = require('../hospital-auth/auth.controller');

router.post('/:userid/disputemanagement', verify.verifytoken, dis.postDisputeManagement);
router.get('/:userid/disputemanagement', verify.verifytoken, dis.getDisputeManagment);
router.put('/disputemanagement/:id', verify.verifytoken, dis.putDisputeManagement);

// patient 
router.get('/patientcheck/:hospitalgroup/:patientid', verify.verifytoken, dis.getPatientRequestQryMngmtByGroup);

router.put('/patientdispute/:id', verify.verifytoken, dis.putPatientDispute);


module.exports = router