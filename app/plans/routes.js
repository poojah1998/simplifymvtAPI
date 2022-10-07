const express = require('express')
const router = express.Router()
const verify = require('../facilitator-register/auth.controller');
const plan = require('./plan.controller');

router.post('/plan', verify.verifytoken, verify.validateRole, plan.postPlan);
router.get('/plan', verify.verifytoken, verify.validateRole, plan.getPlan);
router.get('/plan/:id', verify.verifytoken, verify.validateRole, plan.getPlanById);
router.put('/plan/:id', verify.verifytoken, verify.validateRole, plan.planUpdate);
router.delete('/plan/:id', verify.verifytoken, verify.validateRole, plan.planDelete);

module.exports = router