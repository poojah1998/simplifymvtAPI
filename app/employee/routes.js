const express = require('express')
const router = express.Router()
const emp = require('./controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/employee', verify.verifytoken, emp.postEmployee);

router.get('/:userid/employee', verify.verifytoken, emp.getEmployee);

router.delete('/:userid/employee/:id', verify.verifytoken, emp.delEmployee);

router.put('/employee/:id', verify.verifytoken, emp.putEmployee);



module.exports = router