const express = require('express')
const router = express.Router()
const rep = require('./reports.controller')
const verify = require('../facilitator-register/auth.controller')
var json2xls = require('json2xls');

router.post('/:userid/report', verify.verifytoken, json2xls.middleware, rep.postReport);
router.get('/:userid/report', verify.verifytoken, rep.getReport);
router.get('/:userid/reportbranch/:branchid', verify.verifytoken, rep.getReportByBranch);
router.get('/:userid/reportrefferal/:refferalid', verify.verifytoken, rep.getReportByRefferal);
router.post('/cmsExcel/', verify.verifytoken, json2xls.middleware, rep.postCmsExcel);
router.get('/cmsExcel/', verify.verifytoken, rep.getCmsExcel);
router.post('/whatsappMessageWebhook/', rep.whatsappMessageWebhook);
router.post('/whatsappNotificationWebhook/', rep.whatsappNotificationWebhook);

router.post('/check/', rep.check);
router.post('/querycheck/', rep.queryCheck);
router.post('/checkReports/', rep.checkReports);

// router.post('/patientBackup/', json2xls.middleware, rep.patientBackup);
// router.post('/patientBackupHospital/', json2xls.middleware, rep.patientBackupHospital);
router.post('/patientFacBackupHospital/', json2xls.middleware, rep.patientFacBackupHospital);


module.exports = router