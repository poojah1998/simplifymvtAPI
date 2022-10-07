const express = require('express')
const router = express.Router()
const cre = require('./credentials.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/credentials', verify.verifytoken, cre.postCredentials);
router.get('/:userid/credentials', verify.verifytoken, cre.getCredentialsid);
router.put('/credentials/:id', verify.verifytoken, cre.putCredentials);


// router.get('/companydetailss/:id', com.getCompanydetailsbyID);

// emailcc

router.post('/:userid/emailcc', verify.verifytoken, cre.postEmailcc);
router.get('/:userid/emailcc', verify.verifytoken, cre.getEmailcc);
router.put('/emailcc/:id', verify.verifytoken, cre.putEmailcc);
module.exports = router