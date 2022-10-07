const express = require('express')
const router = express.Router()
const zoho = require('./controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/zohoPostPlan', verify.verifytoken, zoho.postPlan);
router.get('/getAllZohoPlanFac', verify.verifytoken, zoho.getAllPlanFac);
router.get('/getAllZohoPlanHos', verify.verifytoken, zoho.getAllPlanHos);
router.get('/getAllZohoPlan', verify.verifytoken, zoho.getAllZohoPlan);

router.put('/zohoPutPlan/:planCode', verify.verifytoken, zoho.zohoPutPlan);
router.delete('/zohoDelPlan/:planCode', verify.verifytoken, zoho.zohoDelPlan);

router.post('/zohoSubscription', verify.verifytoken, zoho.zohoSubscription);
router.get('/getAllZohoSubscription', verify.verifytoken, zoho.getAllZohoSubscription);
router.get('/getAllZohoCustomers', verify.verifytoken, zoho.getAllZohoCustomers);



module.exports = router