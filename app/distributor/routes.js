const express = require('express')
const router = express.Router()
const dis = require('./controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/distributor', verify.verifytoken, dis.postDistributor);

router.get('/distributor', verify.verifytoken, dis.getDistributor);

router.delete('/distributor/:id', verify.verifytoken, dis.delDistributor);

router.put('/distributor/:id', verify.verifytoken, dis.putDistributor);
router.post('/loginDistributor', dis.loginDistributor);



module.exports = router