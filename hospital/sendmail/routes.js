const express = require('express')
const router = express.Router()
const cre = require('./credentials.controller')
const verify = require('../hospital-auth/auth.controller');

router.post('/:userid/credentials', verify.verifytoken, cre.postCredentials);
router.get('/:userid/credentials', verify.verifytoken, cre.getCredentialsid);
router.put('/credentials/:id', verify.verifytoken, cre.putCredentials);

module.exports = router