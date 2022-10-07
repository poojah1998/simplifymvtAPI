const express = require('express')
const router = express.Router()
const com = require('./company.controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/:userid/companydetails', verify.verifytoken, com.upload, com.postCompanydetails);
router.get('/:userid/companydetails', com.getCompanydetailsid);
router.delete('/companydetails/:id', verify.verifytoken, com.delCompanydetailsid);
router.put('/companydetails/:id', com.upload, verify.verifytoken, com.putCompanydetails);
// router.get('/companydetailss/:id', com.getCompanydetailsbyID);


// branch office
router.post('/:userid/branchcompanydetails', verify.verifytoken, com.postBranchCompanydetails);
router.get('/:userid/branchcompanydetails', com.getBranchCompanydetailsid);
router.delete('/:userid/branchcompanydetails/:id', verify.verifytoken, com.delBranchCompanyDetails);
router.put('/branchcompanydetails/:id', verify.verifytoken, com.putBranchCompayDetails);
module.exports = router