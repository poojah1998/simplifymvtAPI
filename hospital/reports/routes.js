const express = require('express')
const router = express.Router()
const report = require('./report.controller')
const verify = require('../../app/facilitator-register/auth.controller')
var json2xls = require('json2xls');

router.post('/:userid/reports/:hospitalgroup', verify.verifytoken, json2xls.middleware, report.getHospitalGroupReports);
router.get('/:userid/reports', verify.verifytoken, report.getReports);
router.get('/groupreport/:hospitalgroup', verify.verifytoken, report.getReportsByGroup);

// router.get('/auto', verify.verifytoken, report.getReportsByUnit);


module.exports = router