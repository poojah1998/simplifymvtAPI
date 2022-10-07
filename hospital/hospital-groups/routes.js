const express = require('express')
const router = express.Router()
const grp = require('./group.controller')
const verify = require('../../app/facilitator-register/auth.controller')
var multer = require('multer')
var upload = multer()
router.get('/groups/:hospitalgroup', verify.verifytoken, grp.getHospitalGroups);
router.get('/getFacAllHospitals', verify.verifytoken, grp.getFacAllHospitals);

router.get('/allHospitals/', verify.verifytoken, grp.getAllHospitals);
router.get('/allHospitalsSupreme/', verify.verifytoken, grp.getAllHospitalSupreme);

router.get('/single/:hospitalid', verify.verifytoken, grp.getSingleHospital);
router.get('/countryUser', verify.verifytoken, grp.getCountry);

router.get('/unitadmin/:hospitalgroup', verify.verifytoken, grp.unitAdmin);
router.put('/cmshospital/:id', verify.verifytoken, grp.putCmsHospital);
router.put('/cmsdoctor/:id', verify.verifytoken, grp.putCmsDoctor);

// router.post('/uploadcms', upload.any(), verify.verifytoken, grp.uploadCmsImage);

module.exports = router