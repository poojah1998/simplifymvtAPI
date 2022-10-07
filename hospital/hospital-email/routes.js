const express = require('express')
const router = express.Router()
const email = require('./zone.controller')
const verify = require('../hospital-auth/auth.controller');

router.post('/hospitalzone', verify.verifytoken, email.postHospitalZones);
router.delete('/hospitalzone/:id', verify.verifytoken, email.delHospitalZone);
router.get('/hospitalzone/:partnerid/:hospitalid', verify.verifytoken, email.getHospitalEmailByHospitalId);

router.get('/hospitalzone/:partnerid/:hospitalid/:country/:treatment', email.getHospitalEmailBySearch);
router.get('/hospitalzonefac/:partnerid/:hospitalid/:country/:treatment', email.getHospitalEmailBySearchFac);

router.put('/hospitalzone/:id', verify.verifytoken, email.putHospitalZone);
router.get('/hospitalzoneid/:id', verify.verifytoken, email.getHospitalZoneIdDetail);

// Pre employees Route

router.post('/hospitalemployee', verify.verifytoken, email.postEmployee);
router.delete('/hospitalemployee/:id', verify.verifytoken, email.delEmployee);
router.get('/hospitalemployee/:partnerid/:hospitalid', verify.verifytoken, email.getEmployeeByHospitalId);
router.get('/hospitalallemployee/:hospitalgroup', verify.verifytoken, email.getAllEmployeeByHospitalId);

router.put('/hospitalemployee/:id', verify.verifytoken, email.putEmployee);
router.get('/hospitalemployeeid/:id', verify.verifytoken, email.getEmployeeIdDetail);

// Pre doctors Route
router.post('/doctor', verify.verifytoken, email.postDoctor);
router.delete('/doctor/:id', verify.verifytoken, email.delDoctor);
router.get('/doctor/:partnerid/:hospitalid', verify.verifytoken, email.getDoctorByHospitalId);
router.get('/doctorid/:id', verify.verifytoken, email.getDoctorIdDetail);
router.put('/doctor/:id', verify.verifytoken, email.putDoctor);

// Pre default Route

router.post('/defualt', verify.verifytoken, email.postDefualt);
router.get('/defualt/:partnerid/:hospitalid', email.getDefualtByHospitalId);
router.get('/defualtfac/:partnerid/:hospitalid', email.getDefualtByHospitalIdFac);
router.get('/defualtcombine/:partnerid/:hospitalid', email.getDefualtByHospitalIdCombine);

router.get('/defualtid/:id', verify.verifytoken, email.getDefualtIdDetail);
router.put('/defualt/:id', verify.verifytoken, email.putDefault);


// Pre Default Vil Route

router.post('/defualtvil', verify.verifytoken, email.postDefualtVil);
router.get('/defualtvil/:partnerid/:hospitalid', email.getDefualtVilByHospitalId);
router.get('/defualtvilfac/:partnerid/:hospitalid', email.getDefualtVilByHospitalIdFac);
router.get('/defualtvilcombine/:partnerid/:hospitalid', email.getDefualtVilByHospitalIdCombine);

router.get('/defualtvilid/:id', verify.verifytoken, email.getDefualtVilIdDetail);
router.put('/defualtvil/:id', verify.verifytoken, email.putDefaultVil);


// Pre Default Conf Route

router.post('/defualtconf', verify.verifytoken, email.postDefualtConf);
router.get('/defualtconf/:partnerid/:hospitalid', email.getDefualtConfByHospitalId);
router.get('/defualtconffac/:partnerid/:hospitalid', email.getDefualtConfByHospitalIdFac);
router.get('/defualtconfcombine/:partnerid/:hospitalid', email.getDefualtConfByHospitalIdCombine);

router.get('/defualtconfid/:id', verify.verifytoken, email.getDefualtConfIdDetail);
router.put('/defualtconf/:id', verify.verifytoken, email.putDefaultConf);

// Pre Vil Route

router.post('/hospitalemailvil', verify.verifytoken, email.postVil);
router.delete('/hospitalemailvil/:id', verify.verifytoken, email.delVil);
router.get('/hospitalemailvil/:hospitalid', verify.verifytoken, email.getVilByHospitalId);
router.put('/hospitalemailvil/:id', verify.verifytoken, email.putVil);
router.get('/hospitalemailvilid/:id', verify.verifytoken, email.getVilIdDetail);

// Pre Vil Route


router.post('/hospitalemailconf', verify.verifytoken, email.postConf);
router.delete('/hospitalemailconf/:id', verify.verifytoken, email.delConf);
router.get('/hospitalemailconf/:hospitalid', verify.verifytoken, email.getConfByHospitalId);
router.put('/hospitalemailconf/:id', verify.verifytoken, email.putConf);
router.get('/hospitalemailconfid/:id', verify.verifytoken, email.getConfIdDetail);

// router.get('/importData', verify.verifytoken, email.postPreImport);

module.exports = router