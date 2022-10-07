const Patient = require('./patient.model')
const QueryAssign = require('./queryassign.model')
const OpdAssign = require('./opdassign.model')
const VilAssign = require('../hospital-vil/vil.model')
const HospitalUserRole = require('../hospital-auth/userole.model')
const HospitalPartner = require('../hospital-refferalpartner/refferal.model')
const Designation = require('../hospital-profile/profile.model')

const OpinionAdded = require('../hospital-opinion/response.model')
const OpdAdded = require('../hospital-opd/opd.model')

const ConfAssign = require('../hospital-conf/conf.model')

const OpinionSent = require('../hospital-opinion/send.model')
const OpdSent = require('../hospital-opd/send.model')
const VilSent = require('../hospital-vil/send.model')
const AddOpinion = require('./add-fac-opnion.model')
const EditOpinion = require('./edit-fac-opinion.model')

const AddOpd = require('./add-fac-opd')

const Counter = require('./counter.model')
const Group = require('../hospital-groups/group.model')
const Request = require('../../app/opinion-request/request.model')
const Received = require('../../app/opinion-request/received.model')
const Preintimation = require('../../app/pre-intimation/intimation.model')
const Opd = require('../../app/opd/opd.model')
const OpdResponse = require('../../app/opd/opdresponse.model')
const Pi = require('../../app/Proforma Invoice/pi.model')
const PiRes = require('../../app/Proforma Invoice/pi.response.model')
const HospitalBank = require('../hospital-details/bank.model')
const Conf = require('../../app/patient-confirmation/confirmation.model')

const Vil = require('../../app/request-vil/requestvil.model')
const ResponseVil = require('../../app/request-vil/responsevil.model')
const Promise = require('bluebird');
const UserRoleFac = require('../../app/facilitator-register/userrole.model')
const CompanyFac = require('../../app/send-email/credentials.model')

const Embassy = require('./embassy.model')

const Facilitator = require('../../app/facilitator-register/facilitator.model')
const HospitalDetails = require('../hospital-details/details.model')
const HospitalProfile = require('../hospital-profile/profile.model')
const PatientFac = require('../../app/patient/patient.model')
const Status = require('../../app/patient/patient.status')
const sendEmail = require('../sendmail/sendmail')
const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const Zoho = require('../../app/zoho-subscription/model');
const axios = require('axios');
var moment = require('moment-timezone');
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
const jwt_decode = require('jwt-decode');
var fs = require('fs');
var pdf = require('html-pdf');
var mustache = require('mustache');
const { crossOriginOpenerPolicy } = require('helmet')
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {

        cb(null, 'images')
    } else if (file.mimetype === 'application/pdf') {
        cb(null, 'files')
    } else {
        console.log(file.mimetype)
        cb({ error: 'Mime type not supported' })
    }
}

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: process.env.BUCKETNAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,

        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: function(req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
        }
    }),
    fileFilter: fileFilter

})


module.exports.upload = (upload.array('patientProfile')), (request, response, next) => {
    next();
}
exports.postPatient = async(req, res, next) => {
    try {
        const refferalpartner = JSON.parse(req.body.refferalpartner)

        const associatedhospital = JSON.parse(req.body.associatedhospital)
        console.log(associatedhospital)
        const patient = new Patient();
        patient.name = req.body.name;
        patient.gender = req.body.gender;
        patient.hospital = req.body.hospital;
        patient.country = req.body.country;
        patient.refferalpartner = req.body.refferalpartner;
        patient.age = req.body.age;
        patient.ageduration = req.body.ageduration;
        patient.contact = req.body.contact;
        patient.source = req.body.source;
        patient.emailid = req.body.emailid;
        patient.treatment = req.body.treatment;
        patient.associatedhospital = associatedhospital;
        patient.medicalhistory = req.body.medicalhistory;
        patient.remarks = req.body.remarks;

        if (req.files !== undefined) {
            for (let i = 0; i < req.files.length; i++) {
                patient.patientProfile[i] = req.files[i];

            }
        }
        if (req.body.refferalpartner == "{}") {
            patient.refferalpartner = 'NAN';

        } else {
            patient.refferalpartner = refferalpartner;

        }
        const count = await Counter.find({ "hospital": req.body.hospital })
        if (!count.length) {
            const counter = new Counter()
            counter.hospital = req.body.hospital
            await counter.save()
            patient.mhid = counter.seq

        } else {
            value = await Counter.findByIdAndUpdate(count[0]._id, { $inc: { seq: 1 } }, { new: true })
            patient.mhid = value.seq

        }
        await patient.save()

        if (patient.associatedhospital['Role'] == "Hospital Unit Admin" || patient.associatedhospital['Role'] == "Unit Management" || patient.associatedhospital['Role'] == "Unit Manager" || patient.associatedhospital['Role'] == "Unit Executive" || patient.associatedhospital['Role'] == "Unit Query Manager" || patient.associatedhospital['Role'] == "Unit Operation Manager" || patient.associatedhospital['Role'] == "Unit Refferal Partner") {
            const queryassign = new QueryAssign();
            const opdassign = new OpdAssign();
            opdassign.hospitalName = patient.associatedhospital['name']
            opdassign.hospitalId = patient.associatedhospital['hospitalid']
            queryassign.hospitalName = patient.associatedhospital['name']
            queryassign.hospitalId = patient.associatedhospital['hospitalid']
            queryassign.patient = patient
            queryassign.history = [{
                'status': 'RCVD',
                'info': 'Opinion Request Received',
                'date': new Date()
            }]
            opdassign.patient = patient
            await queryassign.save()
            await opdassign.save()
            patient.hospitalQueryAssigns.push(queryassign)
            patient.hospitalOpdAssigns.push(opdassign)
            await patient.save()
        }

        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}
exports.getPatientByUnit = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const data = await Patient.find({
                "hospital": { "$in": req.params.hospitalid },
                country: { $in: userRole.country }
            })
            res.send(data)
        } else {
            const data = await Patient.find({ "hospital": { "$in": req.params.hospitalid } })
            res.send(data)
        }

    } catch (err) {
        next(err);
    }

}
exports.getPatientByGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);
        console.log(decoded)

        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            data = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                },
                "country": {
                    $in: userRole.country
                }
            })
            res.send(data)

        } else if (decoded.Role == 'Group Refferal Partner' || decoded.Role == 'Unit Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            console.log(partner)
            data = await Patient.find({
                "refferalpartner._id": partner._id.toString()

            })
            res.send(data)

        } else {
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            data = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                }
            })
            res.send(data)
        }


    } catch (err) {
        next(err)
    }

}
exports.getPatientById = async(req, res) => {
    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);


    if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager' || decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {
        userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        Patient.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        }).populate({
            "path": "hospitalQueryAssigns hospitalOpdAssigns hospitalVilAssigns hospitalConfirmationAssign",
            match: {
                "hospitalId": {
                    $in: userRole.hospitalVisiblity
                },
            }
        })
    } else if (decoded.Role == 'Group Refferal Partner' || decoded.Role == 'Unit Refferal Partner') {
        partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        Patient.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        }).populate({
            "path": "hospitalQueryAssigns hospitalOpdAssigns hospitalVilAssigns hospitalConfirmationAssign",
            match: {
                "hospitalId": {
                    $in: partner.hospitalVisiblity
                },
            }
        })
    } else {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        Patient.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        }).populate('hospitalQueryAssigns hospitalOpdAssigns hospitalVilAssigns hospitalConfirmationAssign')
    }


}
exports.delPatientid = async(req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
        patientdoc = await Patient.findById(req.params.id)
        console.log('patientdoc', patientdoc)
        if (patientdoc.associatedhospital.hospitalid == req.params.hospitalid) {
            patRemove = await Patient.findByIdAndRemove(req.params.id);
            res.send(patRemove);
            await QueryAssign.deleteMany({ "patient": req.params.id });
            await OpinionAdded.deleteMany({ "patient": req.params.id });
            await OpinionSent.deleteMany({ "patient": req.params.id });
            await OpdAssign.deleteMany({ "patient": req.params.id });
            await OpdAdded.deleteMany({ "patient": req.params.id });
            await OpdSent.deleteMany({ "patient": req.params.id });
            await VilAssign.deleteMany({ "patient": req.params.id });
            await VilSent.deleteMany({ "patient": req.params.id });
            await ConfAssign.deleteMany({ "patient": req.params.id });


        } else {
            patUpdate = await Patient.update({ "hospital": { "$in": req.params.hospitalid } }, { $pull: { hospital: req.params.hospitalid } });
            if (patUpdate.nModified == 0) {
                res.status(400).send({ "message": "You can delete your own query only" });

            } else {
                res.send(patUpdate);

            }

        }

    } catch (err) {
        next(err);
    }

}
exports.putPatient = async(req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
        const patient = new Patient();
        const refferalpartner = JSON.parse(req.body.refferalpartner)

        if (req.files.length != 0) {
            var id = req.params.id;
            zoneQuery = { "_id": id };

            data = await Patient.find(zoneQuery)
            if (data) {
                qry1 = data[0].patientProfile

            } else {
                console.log("Data not found");
            }
            Array.prototype.push.apply(req.files, data[0].patientProfile);

            for (let i = 0; i < req.files.length; i++) {
                patient.patientProfile[i] = req.files[i];

            }

            var patientt = {
                name: req.body.name,
                gender: req.body.gender,
                country: req.body.country,
                uhidcode: req.body.uhidcode,
                refferalpartner: refferalpartner,
                age: req.body.age,
                ageduration: req.body.ageduration,
                contact: req.body.contact,
                emailid: req.body.emailid,
                treatment: req.body.treatment,
                medicalhistory: req.body.medicalhistory,
                patientProfile: patient.patientProfile,
                remarks: req.body.remarks,

            };
            if (req.body.refferalpartner == "{}") {
                patientt.refferalpartner = 'NAN';

            } else {
                patientt.refferalpartner = refferalpartner;

            }
            Patient.findByIdAndUpdate(req.params.id, { $set: patientt }, { new: true }, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else { return res.status(400).send({ message: 'error in update the documents' }); }
            });

        } else if (req.files.length == 0) {
            console.log('second')
            var patientt = {
                name: req.body.name,
                gender: req.body.gender,
                country: req.body.country,
                uhidcode: req.body.uhidcode,
                age: req.body.age,
                ageduration: req.body.ageduration,
                contact: req.body.contact,
                refferalpartner: refferalpartner,
                emailid: req.body.emailid,
                treatment: req.body.treatment,
                remarks: req.body.remarks,
                medicalhistory: req.body.medicalhistory,

            };
            if (req.body.refferalpartner == "{}") {
                patientt.refferalpartner = 'NAN';

            } else {
                patientt.refferalpartner = refferalpartner;

            }
            Patient.findByIdAndUpdate(req.params.id, { $set: patientt }, { new: true }, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else { return res.status(400).send({ message: 'error in update the documents' }); }
            });

        }


    }
    // assignPatientQueries

exports.postAssignQuery = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        qry = req.body;
        qry.forEach(async element => {
            // console.log("Save ")

            const queryassign = new QueryAssign();
            queryassign.hospitalName = element.hospitalName
            queryassign.hospitalId = element.hospitalId
            queryassign.hospitalEmail = element.hospitalEmail
            queryassign.history = [{
                'status': 'RCVD',
                'info': 'Opinion Request Received',
                'date': new Date()
            }]
            qry1 = queryassign.hospitalEmail.executivesTo
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = queryassign.hospitalEmail.executivesCc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (queryassign.hospitalEmail.doctorsTo != undefined) {
                qry3 = queryassign.hospitalEmail.doctorsTo
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = queryassign.hospitalEmail.doctorsCc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const patient = await Patient.findById(patientid)

            patient.hospital.push(element.hospitalId)

            queryassign.patient = patient._id
            await queryassign.save()


            patient.hospitalQueryAssigns.push(queryassign)
            await patient.save()
            if (patient.remarks == '') {
                patient.remarks = "NIL"
            }
            let token = req.headers.authorization.split(' ')[1]
            var decoded = jwt_decode(token);
            if (decoded.Role == 'Group Refferal Partner') {
                sendEmail.assignHospitalRefferal(patient, queryassign, emailsto, emailscc, element.hospital, decoded, req)

            } else {
                sendEmail.assignHospital(patient, queryassign, emailsto, emailscc, element.hospital, element.groupName, req)

            }

        });
        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }
}
exports.getAssignQuery = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalQueryAssigns",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalQueryAssigns)
        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalQueryAssigns",
                match: {
                    "hospitalId": {
                        $in: partner.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalQueryAssigns)
        } else {
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate('hospitalQueryAssigns')
            res.send(patient.hospitalQueryAssigns)
        }

    } catch (err) {
        next(err);
    }

}
exports.getAssignQueryByPatientHospital = async(req, res) => {


    QueryAssign.findOne({ "patient": req.params.patientid, "hospitalId": req.params.hospitalid })
        .then(data => {

            if (data) {

                res.send(data);
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.PutAssignQueryStatus = (req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        var updateData = {
            linkStatus: 'submit',

        };
        QueryAssign.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in update the documents' }); }
        });
    }
    // assignPatientOpd

exports.postAssignOpd = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        qry = req.body;
        qry.forEach(async element => {
            // console.log("Save ")

            const opdassign = new OpdAssign();
            opdassign.hospitalName = element.hospitalName
            opdassign.hospitalId = element.hospitalId
            opdassign.hospitalEmail = element.hospitalEmail

            qry1 = opdassign.hospitalEmail.executivesTo
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = opdassign.hospitalEmail.executivesCc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (opdassign.hospitalEmail.doctorsTo != undefined) {
                qry3 = opdassign.hospitalEmail.doctorsTo
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = opdassign.hospitalEmail.doctorsCc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const patient = await Patient.findById(patientid)

            patient.hospital.push(element.hospitalId)

            opdassign.patient = patient._id
            await opdassign.save()


            patient.hospitalOpdAssigns.push(opdassign)
            await patient.save()

            sendEmail.assignHospitalOpd(patient, opdassign, emailsto, emailscc, element.hospital, element.groupName, req)

        });
        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }
}
exports.getAssignOpd = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalOpdAssigns",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalOpdAssigns)

        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalOpdAssigns",
                match: {
                    "hospitalId": {
                        $in: partner.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalOpdAssigns)
        } else {
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate('hospitalOpdAssigns')
            res.send(patient.hospitalOpdAssigns)
        }

    } catch (err) {
        next(err);
    }

}
exports.getAssignOpdByPatientHospital = async(req, res) => {


    OpdAssign.findOne({ "patient": req.params.patientid, "hospitalId": req.params.hospitalid })
        .then(data => {

            if (data) {

                res.send(data);
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.PutAssignOpdStatus = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        linkStatus: 'submit',

    };
    OpdAssign.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}




// Patient Opinion Request 

projectOpinion = {
    createdAt: 1,
    hospitalname: 1,
    hospitalid: 1,
    patient: 1,
    linkstatus: 1,
    doctors: 1,
    hospitalcity: 1,
    accreditations: 1,
    email: 1,
    _id: 1,
    hospitalopinions: 1,
    receives: 1,
    doctoropinions: 1,
    hospitalreviewed: 1,
    history: 1
}
exports.getPatientRequestByUnit = async(req, res) => {

    Request.find({ "hospitalid": req.params.hospitalid }, projectOpinion).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        .then(data => {

            if (data) {
                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getPatientRequestByGroup = async(req, res, next) => {
    try {
        const { hospitalgroup } = req.params;

        var pipeline = [{
                $match: {
                    hospitalgroup: ObjectId(hospitalgroup),
                }
            },

            {
                $group: {
                    _id: "$hospitalgroup",
                    hospitalid: {
                        $push: {
                            $toString: "$_id",


                        }

                    }
                }
            },

        ]
        doc = await Group.aggregate(pipeline)
        doc[0].hospitalid.push(hospitalgroup)
        data = await Request.find({
            "hospitalid": {
                $in: doc[0].hospitalid
            }
        }, projectOpinion).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')


        res.send(data)

    } catch (err) {
        next(err)
    }

}

exports.getPatientRequestQryMngmtByUnit = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            console.log('decoded', decoded)
            console.log('userRole', userRole)

            pipeline1 = [{
                    $match: {
                        hospitalid: req.params.hospitalid

                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        "patientCheck.country": {
                            $in: userRole.country
                        },
                    }
                },

                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                createdAt: "$createdAt",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                linkstatus: "$linkstatus",
                                doctors: "$doctors",
                                hospitalcity: "$hospitalcity",
                                accreditations: "$accreditations",
                                email: "$email",
                                _id: "$_id",
                                hospitalopinions: "$hospitalopinions",
                                receives: "$receives",
                                doctoropinions: "$doctoropinions",
                                hospitalreviewed: "$hospitalreviewed",
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'addFacOpinion',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'addedOpinion',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        addedOpinion: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        "receivesTotal": {
                            "$reduce": {
                                "input": "$data.receives",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }
                        },
                        "doctorOpinionTotal": {
                            "$reduce": {
                                "input": "$data.doctoropinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        },
                        "hospitalOpinionTotal": {
                            "$reduce": {
                                "input": "$data.hospitalopinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        }
                    }
                },
                {
                    $lookup: {
                        from: 'received',
                        "let": { "id": "$receivesTotal" },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                        ],

                        as: 'receivesTotal',

                    }
                }
            ]
            data = await Request.aggregate(pipeline1)
            const pat = await Patient.find({
                "hospital": { "$in": req.params.hospitalid },
                country: { $in: userRole.country }

            }).populate('hospitalQueryAssigns')
            filterPat = []
            pat.forEach(element => {
                if (element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                    element.hospitalQueryAssigns.forEach(element1 => {
                        if (element1.hospitalId == req.params.hospitalid) {
                            filterPat.push(element)
                        }
                    })
                }
                if (!element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                } else if (element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                }
            });
            result = data.concat(filterPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        } else if (decoded.Role == 'Unit Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const pat = await Patient.find({ "refferalpartner._id": partner._id.toString() }).populate('hospitalQueryAssigns')
            filterPat = []
            pat.forEach(element => {
                if (element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                    element.hospitalQueryAssigns.forEach(element1 => {
                        if (element1.hospitalId == req.params.hospitalid) {
                            filterPat.push(element)
                        }
                    })
                }
                if (!element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                } else if (element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                }
            });
            res.send(filterPat)
        } else {

            pipeline1 = [{
                    $match: {
                        hospitalid: req.params.hospitalid
                            // createdAt: { $gt: new Date("2021--21T00:00:00Z") },

                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                createdAt: "$createdAt",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                linkstatus: "$linkstatus",
                                doctors: "$doctors",
                                hospitalcity: "$hospitalcity",
                                accreditations: "$accreditations",
                                email: "$email",
                                _id: "$_id",
                                hospitalopinions: "$hospitalopinions",
                                receives: "$receives",
                                doctoropinions: "$doctoropinions",
                                hospitalreviewed: "$hospitalreviewed",
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'addFacOpinion',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'addedOpinion',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        addedOpinion: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        "receivesTotal": {
                            "$reduce": {
                                "input": "$data.receives",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }
                        },
                        "doctorOpinionTotal": {
                            "$reduce": {
                                "input": "$data.doctoropinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        },
                        "hospitalOpinionTotal": {
                            "$reduce": {
                                "input": "$data.hospitalopinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        }
                    }
                },
                {
                    $lookup: {
                        from: 'received',
                        "let": { "id": "$receivesTotal" },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                        ],

                        as: 'receivesTotal',

                    }
                }
            ]
            data = await Request.aggregate(pipeline1)
            const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid } }).populate('hospitalQueryAssigns')
            filterPat = []
            pat.forEach(element => {
                if (element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                    element.hospitalQueryAssigns.forEach(element1 => {
                        if (element1.hospitalId == req.params.hospitalid) {
                            filterPat.push(element)
                        }
                    })
                }
                if (!element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                } else if (element.hospitalQueryAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                }
            });
            result = data.concat(filterPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        }

    } catch (err) {
        next(err)
    }
}
exports.getPatientRequestQryMngmtByGroup = async(req, res, next) => {
    try {

        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            console.log('decoded', decoded)
            console.log('userRole', userRole)
            const { hospitalgroup } = req.params;
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },

                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                createdAt: "$createdAt",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                linkstatus: "$linkstatus",
                                doctors: "$doctors",
                                hospitalcity: "$hospitalcity",
                                accreditations: "$accreditations",
                                email: "$email",
                                _id: "$_id",
                                hospitalopinions: "$hospitalopinions",
                                receives: "$receives",
                                doctoropinions: "$doctoropinions",
                                hospitalreviewed: "$hospitalreviewed",
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'addFacOpinion',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'addedOpinion',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        addedOpinion: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        "receivesTotal": {
                            "$reduce": {
                                "input": "$data.receives",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }
                        },
                        "doctorOpinionTotal": {
                            "$reduce": {
                                "input": "$data.doctoropinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        },
                        "hospitalOpinionTotal": {
                            "$reduce": {
                                "input": "$data.hospitalopinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        }
                    }
                },
                {
                    $lookup: {
                        from: 'received',
                        "let": { "id": "$receivesTotal" },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                        ],

                        as: 'receivesTotal',

                    }
                }
            ]
            data = await Request.aggregate(pipeline1)

            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                },
                country: { $in: userRole.country }

            }).populate({
                    "path": "hospitalQueryAssigns",
                    match: {
                        "hospitalId": {
                            $in: userRole.hospitalVisiblity
                        },
                    }

                }

            )

            result = await data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            dataPat = await Patient.find({
                "refferalpartner._id": partner._id.toString()
            }).populate('hospitalQueryAssigns')

            res.send(dataPat)

        } else {

            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        },
                        // createdAt: { $gt: new Date("2021--21T00:00:00Z") },

                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                createdAt: "$createdAt",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                linkstatus: "$linkstatus",
                                doctors: "$doctors",
                                hospitalcity: "$hospitalcity",
                                accreditations: "$accreditations",
                                email: "$email",
                                _id: "$_id",
                                hospitalopinions: "$hospitalopinions",
                                receives: "$receives",
                                doctoropinions: "$doctoropinions",
                                hospitalreviewed: "$hospitalreviewed",
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'addFacOpinion',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'addedOpinion',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        addedOpinion: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        "receivesTotal": {
                            "$reduce": {
                                "input": "$data.receives",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }
                        },
                        "doctorOpinionTotal": {
                            "$reduce": {
                                "input": "$data.doctoropinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        },
                        "hospitalOpinionTotal": {
                            "$reduce": {
                                "input": "$data.hospitalopinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        }
                    }
                },
                {
                    $lookup: {
                        from: 'received',
                        "let": { "id": "$receivesTotal" },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                        ],

                        as: 'receivesTotal',

                    }
                }
            ]
            data = await Request.aggregate(pipeline1)
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]

            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                }
            }).populate('hospitalQueryAssigns')

            result = await data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        }
    } catch (err) {
        next(err)
    }

}

exports.getSinglePatientRequestQryMngmt = async(req, res, next) => {

    try {
        const { hospitalgroup } = req.params;

        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            console.log('decoded', decoded)
            console.log('userRole', userRole)
            const { hospitalgroup } = req.params;
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        },
                        patient: ObjectId(req.params.patientid)

                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },

                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                createdAt: "$createdAt",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                linkstatus: "$linkstatus",
                                doctors: "$doctors",
                                hospitalcity: "$hospitalcity",
                                accreditations: "$accreditations",
                                email: "$email",
                                _id: "$_id",
                                hospitalopinions: "$hospitalopinions",
                                receives: "$receives",
                                doctoropinions: "$doctoropinions",
                                hospitalreviewed: "$hospitalreviewed",
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'addFacOpinion',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'addedOpinion',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        addedOpinion: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        "receivesTotal": {
                            "$reduce": {
                                "input": "$data.receives",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }
                        },
                        "doctorOpinionTotal": {
                            "$reduce": {
                                "input": "$data.doctoropinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        },
                        "hospitalOpinionTotal": {
                            "$reduce": {
                                "input": "$data.hospitalopinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        }
                    }
                },
                {
                    $lookup: {
                        from: 'received',
                        "let": { "id": "$receivesTotal" },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                        ],

                        as: 'receivesTotal',

                    }
                }
            ]
            data = await Request.aggregate(pipeline1)
            res.send(data[0])

        } else {
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        },
                        patient: ObjectId(req.params.patientid)
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                createdAt: "$createdAt",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                linkstatus: "$linkstatus",
                                doctors: "$doctors",
                                hospitalcity: "$hospitalcity",
                                accreditations: "$accreditations",
                                email: "$email",
                                _id: "$_id",
                                hospitalopinions: "$hospitalopinions",
                                receives: "$receives",
                                doctoropinions: "$doctoropinions",
                                hospitalreviewed: "$hospitalreviewed",
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'addFacOpinion',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'addedOpinion',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        addedOpinion: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        "receivesTotal": {
                            "$reduce": {
                                "input": "$data.receives",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }
                        },
                        "doctorOpinionTotal": {
                            "$reduce": {
                                "input": "$data.doctoropinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        },
                        "hospitalOpinionTotal": {
                            "$reduce": {
                                "input": "$data.hospitalopinions",
                                "initialValue": [],
                                "in": { "$setUnion": ["$$value", "$$this"] }
                            }

                        }
                    }

                },
                {
                    $lookup: {
                        from: 'received',
                        "let": { "id": "$receivesTotal" },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                        ],

                        as: 'receivesTotal',

                    }
                }
            ]
            data = await Request.aggregate(pipeline1)


            res.send(data[0])

        }

    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientRequestQryMngmtByUnit = async(req, res, next) => {
    try {
        const { hospitalid } = req.params;



        pipeline1 = [{
                $match: {
                    hospitalid: hospitalid,
                    patient: ObjectId(req.params.patientid)
                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            createdAt: "$createdAt",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            linkstatus: "$linkstatus",
                            doctors: "$doctors",
                            hospitalcity: "$hospitalcity",
                            accreditations: "$accreditations",
                            email: "$email",
                            _id: "$_id",
                            hospitalopinions: "$hospitalopinions",
                            receives: "$receives",
                            doctoropinions: "$doctoropinions",
                            hospitalreviewed: "$hospitalreviewed",
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },
            {
                $lookup: {
                    from: 'addFacOpinion',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                    ],

                    as: 'addedOpinion',

                }
            },
            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },
                    addedOpinion: 1

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    "receivesTotal": {
                        "$reduce": {
                            "input": "$data.receives",
                            "initialValue": [],
                            "in": { "$setUnion": ["$$value", "$$this"] }
                        }
                    },
                    "doctorOpinionTotal": {
                        "$reduce": {
                            "input": "$data.doctoropinions",
                            "initialValue": [],
                            "in": { "$setUnion": ["$$value", "$$this"] }
                        }

                    },
                    "hospitalOpinionTotal": {
                        "$reduce": {
                            "input": "$data.hospitalopinions",
                            "initialValue": [],
                            "in": { "$setUnion": ["$$value", "$$this"] }
                        }

                    }
                }
            },
            {
                $lookup: {
                    from: 'received',
                    "let": { "id": "$receivesTotal" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                    ],

                    as: 'receivesTotal',

                }
            }
        ]
        data = await Request.aggregate(pipeline1)


        res.send(data[0])
    } catch (err) {
        next(err)
    }

}
exports.postPatientRequest = async(req, res, next) => {
    try {
        console.log(req.body)
        qry = req.body
        const { patientid } = req.params;

        qry.forEach(async element => {
            const received = new Received();
            var hospitalid = element.hospital

            received.hospitalname = element.hospitalname;
            received.hospitalcity = element.hospitalcity;
            received.accreditations = element.accreditations;
            received.hospitalemail = element.hospitalemail;
            received.diagnosis = element.diagnosis;
            received.hospitalid = element.hospitalid;
            received.linkstatus = element.linkstatus;
            received.opinionid = element.opinionid;
            received.doctorid = element.doctorid;
            received.doctorname = element.doctorname;
            received.doctorprofile = element.doctorprofile;
            received.stayincountry = element.stayincountry;
            received.countryduration = element.countryduration;
            received.hospitalduration = element.hospitalduration;
            received.stayinhospital = element.stayinhospital;
            received.treatmentplan = element.treatmentplan;
            received.initialevaluationminimum = element.initialevaluationminimum;
            received.initialevaluationmaximum = element.initialevaluationmaximum;
            received.initialevaluationmaximum = element.initialevaluationmaximum;
            received.treatment = element.treatment;

            received.remarks = element.remarks;

            const request = await Request.findById(element.opinionid)
            const patient = await PatientFac.findById(patientid)
            const opinionSend = await Received.find({ opinionid: element.opinionid })


            received.request = request._id
            received.patient = patient._id
            if (!opinionSend.length) {

                await received.save()
            }
            if (request.aggregator == 'NIL') {
                userid = patient.user

            } else {

                userid = request.aggregator

            }
            emailcc = await UserRoleFac.find({ "user": userid })
            companyFac = await CompanyFac.findOne({ "user": userid })
            facilitator = await Facilitator.findOne({ "_id": userid })
            emailccsend = []
            emailcc.forEach(element1 => {
                if (element1.Role == "Management")
                    emailccsend.push(element1.email)
            })
            element.emailCc.forEach(element2 => {
                emailccsend.push(element2.emailcc)
            });
            emailccsend.push(facilitator.email)
            received.date = element.todayDate
            received.treatment.forEach(element => {
                if (element.roomType == '') {
                    element.roomType = 'NIL'
                }
                if (element.maxCost == null) {
                    element.maxCost = 'NIL'

                }
            });

            if (element.type == 'Send') {
                sendEmail.sendOpinionToFacilitator(patient, received, emailccsend, companyFac, hospitalid, element.type, res, req, userid)
            } else if (element.type == 'Mail') {
                companyFac.email1 = element.emailTo
                emailccsend = []
                element.emailCc.forEach(element2 => {
                    emailccsend.push(element2.emailcc)
                });
                sendEmail.sendOpinionToFacilitator(patient, received, emailccsend, companyFac, hospitalid, element.type, res, req, userid)

            }
            if (!opinionSend.length) {
                request.receives.push(received)
                await request.save()

                patient.receives.push(received)
                patient.currentstatus = Status.opinionreceived

                await patient.save()
            }
            var data = []
            request.history.push({
                'status': 'SUBMITMAGNUS',
                'info': `Opinion Sent`,
                'date': new Date()
            })
            data = request.history
            var requestdata = {
                history: data,
                hospitalreviewed: true
            };
            await Request.findByIdAndUpdate(element.opinionid, { $set: requestdata }, { new: true });
            res.send({ message: "success" })

        })

    } catch (err) {
        next(err);
    }
}
exports.postDownloadPatientRequest = async(req, res, next) => {
    try {
        console.log(req.body)
        qry = req.body
        const { patientid } = req.params;

        qry.forEach(async element => {
            const received = new Received();
            var hospitalid = element.hospital

            received.hospitalname = element.hospitalname;
            received.hospitalcity = element.hospitalcity;
            received.accreditations = element.accreditations;
            received.hospitalemail = element.hospitalemail;
            received.diagnosis = element.diagnosis;
            received.hospitalid = element.hospitalid;
            received.linkstatus = element.linkstatus;
            received.opinionid = element.opinionid;
            received.doctorid = element.doctorid;
            received.doctorname = element.doctorname;
            received.doctorprofile = element.doctorprofile;
            received.stayincountry = element.stayincountry;
            received.countryduration = element.countryduration;
            received.hospitalduration = element.hospitalduration;
            received.stayinhospital = element.stayinhospital;
            received.treatmentplan = element.treatmentplan;
            received.initialevaluationminimum = element.initialevaluationminimum;
            received.initialevaluationmaximum = element.initialevaluationmaximum;
            received.treatment = element.treatment;

            received.remarks = element.remarks;

            const request = await Request.findById(element.opinionid)
            const patient = await PatientFac.findById(patientid)
            const opinionSend = await Received.find({ opinionid: element.opinionid })


            received.request = request._id
            received.patient = patient._id

            userid = patient.user
            emailcc = await UserRoleFac.find({ "user": userid })
            companyFac = await CompanyFac.findOne({ "user": userid })
            const facilitator = await Facilitator.findOne({ "_id": userid })

            emailccsend = []
            emailcc.forEach(element1 => {
                if (element1.Role == "Management")
                    emailccsend.push(element1.email)
            })

            emailccsend.push(facilitator.email)
            received.date = element.todayDate
            sendEmail.sendOpinionToFacilitator(patient, received, emailccsend, companyFac, hospitalid, element.type, res, req)


        })

    } catch (err) {
        next(err);
    }
}
exports.addPatientRequest = async(req, res, next) => {
    try {
        var hospitalid = req.body.hospital
        console.log(req.body)
        const { requestid } = req.params;
        const { patientid } = req.params;

        const addopinion = new AddOpinion();
        addopinion.hospitalname = req.body.hospitalname;
        addopinion.hospitalcity = req.body.hospitalcity;
        addopinion.accreditations = req.body.accreditations;
        addopinion.hospitalemail = req.body.hospitalemail;
        addopinion.diagnosis = req.body.diagnosis;
        addopinion.hospitalid = req.body.hospitalid;
        addopinion.opinionid = req.body.opinionid;
        addopinion.doctorid = req.body.doctorid;
        addopinion.doctorname = req.body.doctorname;
        addopinion.doctorprofile = req.body.doctorprofile;
        addopinion.stayincountry = req.body.stayincountry;
        addopinion.countryduration = req.body.countryduration;
        addopinion.hospitalduration = req.body.hospitalduration;
        addopinion.stayinhospital = req.body.stayinhospital;
        addopinion.treatmentplan = req.body.treatmentplan;
        addopinion.initialevaluationminimum = req.body.initialevaluationminimum;
        addopinion.initialevaluationmaximum = req.body.initialevaluationmaximum;
        addopinion.treatment = req.body.treatment;

        addopinion.remarks = req.body.remarks;

        const request = await Request.findById(requestid)
        const patient = await PatientFac.findById(patientid)

        addopinion.request = request._id
        addopinion.patient = patient._id
        await addopinion.save()

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getAddFacOpinionGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })

            data = await AddOpinion.find({
                "hospitalid": {
                    $in: userRole.hospitalVisiblity
                },
                "patient": req.params.patientid
            })

            res.send(data)
        } else {
            data = await AddOpinion.find({ "patient": req.params.patientid })
            res.send(data)
        }

    } catch (err) {
        next(err);
    }

}

exports.getAddFacOpinionUnit = async(req, res) => {



    AddOpinion.find({ "patient": req.params.patientid, "hospitalid": req.params.hospitalid })
        .then(data => {

            if (data) {

                res.send(data);
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.editPatientRequest = async(req, res, next) => {
    try {
        var hospitalid = req.body.hospital
        console.log(req.body)
        const { requestid } = req.params;
        const { patientid } = req.params;

        const editopinion = new EditOpinion();
        editopinion.hospitalname = req.body.hospitalname;
        editopinion.hospitalcity = req.body.hospitalcity;
        editopinion.accreditations = req.body.accreditations;
        editopinion.hospitalemail = req.body.hospitalemail;
        editopinion.diagnosis = req.body.diagnosis;
        editopinion.hospitalid = req.body.hospitalid;
        editopinion.opinionid = req.body.opinionid;
        editopinion.doctorid = req.body.doctorid;
        editopinion.doctorname = req.body.doctorname;
        editopinion.doctorprofile = req.body.doctorprofile;
        editopinion.stayincountry = req.body.stayincountry;
        editopinion.countryduration = req.body.countryduration;
        editopinion.hospitalduration = req.body.hospitalduration;
        editopinion.stayinhospital = req.body.stayinhospital;
        editopinion.treatmentplan = req.body.treatmentplan;
        editopinion.initialevaluationminimum = req.body.initialevaluationminimum;
        editopinion.initialevaluationmaximum = req.body.initialevaluationmaximum;
        editopinion.treatment = req.body.treatment;

        editopinion.remarks = req.body.remarks;

        const request = await Request.findById(requestid)
        const patient = await PatientFac.findById(patientid)

        editopinion.request = request._id
        editopinion.patient = patient._id
        await editopinion.save()

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getEditFacOpinionGroup = async(req, res, next) => {
    try {

        data = await EditOpinion.find({ "patient": req.params.patientid })
        res.send(data)
    } catch (err) {
        next(err);
    }

}

exports.getEditFacOpinionUnit = async(req, res) => {



    EditOpinion.find({ "patient": req.params.patientid, "hospitalid": req.params.hospitalid })
        .then(data => {

            if (data) {

                res.send(data);
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.getOpininReceivedByGroup = async(req, res, next) => {
    try {
        const { hospitalgroup } = req.params;
        const { patientid } = req.params;

        var pipeline = [{
                $match: {
                    hospitalgroup: ObjectId(hospitalgroup),
                }
            },

            {
                $group: {
                    _id: "$hospitalgroup",
                    hospitalid: {
                        $push: {
                            $toString: "$_id",


                        }

                    }
                }
            },

        ]
        doc = await Group.aggregate(pipeline)
        doc[0].hospitalid.push(hospitalgroup)

        received = await Received.find({
            "hospitalid": {
                $in: doc[0].hospitalid
            },
            "patient": patientid
        })
        res.send(received)
    } catch (err) {
        next(err)
    }

}


// Patient Vil Request
projectVil = {
    hospitalname: 1,
    hospitalid: 1,
    patient: 1,
    passports: 1,
    dateofAppointment: 1,
    doctorname: 1,
    embassy: 1,
    hospitalemail: 1,
    _id: 1,
    patientname: 1,
    passportnumber: 1,
    linkstatus: 1,
    attendant: 1,
    donor: 1,
    embassyAddress: 1,
    user: 1,
    createdAt: 1
}
exports.getPatientVilByUnit = async(req, res) => {
    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);


    if (decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {

        userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
        console.log('decoded', decoded)
        console.log('userRole', userRole)
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$patient" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { country: 1 } }
                    ],

                    as: 'patientCheck',

                }
            },
            {
                $addFields: {
                    patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                }
            },
            {
                $match: {
                    "patientCheck.country": {
                        $in: userRole.country
                    },
                }
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            patient: "$patient",
                            passports: "$passports",
                            dateofAppointment: "$dateofAppointment",
                            doctorname: "$doctorname",
                            embassy: "$embassy",
                            hospitalemail: "$hospitalemail",
                            _id: "$_id",
                            patientname: "$patientname",
                            passportnumber: "$passportnumber",
                            linkstatus: "$linkstatus",
                            attendant: "$attendant",
                            donor: "$donor",
                            embassyAddress: "$embassyAddress",
                            user: "$user",
                            createdAt: "$createdAt"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        { "$match": { "$expr": { "$eq": ["$hospitalid", req.params.hospitalid] } } },

                    ],

                    as: 'vilResponse',

                }
            },
            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },
                    vilResponse: 1

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    linkStatus: "$data.linkstatus",


                }
            },
        ]
        data = await Vil.aggregate(pipeline1)
        const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid }, country: { $in: userRole.country } }).populate('hospitalVilAssigns')
        filterPat = []
        pat.forEach(element => {
            if (element.hospitalVilAssigns.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                element.hospitalVilAssigns.forEach(element1 => {
                    if (element1.hospitalId == req.params.hospitalid) {
                        filterPat.push(element)
                    }
                })
            }
            if (!element.hospitalVilAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            } else if (element.hospitalVilAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            }
        });
        result = data.concat(filterPat)
        res.send(result.sort((a, b) => a.createdAt - b.createdAt))

    } else if (decoded.Role == 'Unit Refferal Partner') {
        partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
        const pat = await Patient.find({ "refferalpartner._id": partner._id.toString() }).populate('hospitalVilAssigns')
        filterPat = []
        pat.forEach(element => {
            if (element.hospitalVilAssigns.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                element.hospitalVilAssigns.forEach(element1 => {
                    if (element1.hospitalId == req.params.hospitalid) {
                        filterPat.push(element)
                    }
                })
            }
            if (!element.hospitalVilAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            } else if (element.hospitalVilAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            }
        });
        res.send(filterPat)
    } else {
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            patient: "$patient",
                            passports: "$passports",
                            dateofAppointment: "$dateofAppointment",
                            doctorname: "$doctorname",
                            embassy: "$embassy",
                            hospitalemail: "$hospitalemail",
                            _id: "$_id",
                            patientname: "$patientname",
                            passportnumber: "$passportnumber",
                            linkstatus: "$linkstatus",
                            attendant: "$attendant",
                            donor: "$donor",
                            embassyAddress: "$embassyAddress",
                            user: "$user",
                            createdAt: "$createdAt"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        { "$match": { "$expr": { "$eq": ["$hospitalid", req.params.hospitalid] } } },

                    ],

                    as: 'vilResponse',

                }
            },
            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },
                    vilResponse: 1

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    linkStatus: "$data.linkstatus",


                }
            },
        ]
        data = await Vil.aggregate(pipeline1)
        const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid } }).populate('hospitalVilAssigns')
        filterPat = []
        pat.forEach(element => {
            if (element.hospitalVilAssigns.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                element.hospitalVilAssigns.forEach(element1 => {
                    if (element1.hospitalId == req.params.hospitalid) {
                        filterPat.push(element)
                    }
                })
            }
            if (!element.hospitalVilAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            } else if (element.hospitalVilAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            }
        });
        result = data.concat(filterPat)
        res.send(result.sort((a, b) => a.createdAt - b.createdAt))
    }

}
exports.getPatientVilByGroup = async(req, res, next) => {
    try {

        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            console.log('decoded', decoded)
            console.log('userRole', userRole)
            const { hospitalgroup } = req.params;
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },

                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                patient: "$patient",
                                passports: "$passports",
                                dateofAppointment: "$dateofAppointment",
                                doctorname: "$doctorname",
                                embassy: "$embassy",
                                hospitalemail: "$hospitalemail",
                                _id: "$_id",
                                patientname: "$patientname",
                                passportnumber: "$passportnumber",
                                linkstatus: "$linkstatus",
                                attendant: "$attendant",
                                donor: "$donor",
                                embassyAddress: "$embassyAddress",
                                user: "$user",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'responsevil',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },

                        ],

                        as: 'vilResponse',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        vilResponse: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",


                    }
                },
            ]
            data = await Vil.aggregate(pipeline1)
            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                },
                country: { $in: userRole.country }

            }).populate({
                "path": "hospitalVilAssigns",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }

            })

            result = data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))

        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            dataPat = await Patient.find({
                "refferalpartner._id": partner._id.toString()
            }).populate('hospitalVilAssigns')

            res.send(dataPat)

        } else {

            const { hospitalgroup } = req.params;
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                patient: "$patient",
                                passports: "$passports",
                                dateofAppointment: "$dateofAppointment",
                                doctorname: "$doctorname",
                                embassy: "$embassy",
                                hospitalemail: "$hospitalemail",
                                _id: "$_id",
                                patientname: "$patientname",
                                passportnumber: "$passportnumber",
                                linkstatus: "$linkstatus",
                                attendant: "$attendant",
                                donor: "$donor",
                                embassyAddress: "$embassyAddress",
                                user: "$user",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'responsevil',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },

                        ],

                        as: 'vilResponse',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        vilResponse: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",


                    }
                },
            ]
            data = await Vil.aggregate(pipeline1)
            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                }
            }).populate('hospitalVilAssigns')
            result = data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))

        }

    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientVil = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);

        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { hospitalid } = req.params;

            console.log(req.params.patientid)
            console.log(hospitalid)

            pipeline1 = [{
                    $match: {

                        patient: ObjectId(req.params.patientid)
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                patient: "$patient",
                                passports: "$passports",
                                dateofAppointment: "$dateofAppointment",
                                doctorname: "$doctorname",
                                embassy: "$embassy",
                                hospitalemail: "$hospitalemail",
                                _id: "$_id",
                                patientname: "$patientname",
                                passportnumber: "$passportnumber",
                                linkstatus: "$linkstatus",
                                attendant: "$attendant",
                                donor: "$donor",
                                embassyAddress: "$embassyAddress",
                                user: "$user",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'responsevil',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },

                        ],

                        as: 'vilResponse',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        vilResponse: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",


                    }
                },
            ]
            data = await Vil.aggregate(pipeline1)


            res.send(data[0])

        } else {
            const { hospitalid } = req.params;

            console.log(req.params.patientid)
            console.log(hospitalid)

            pipeline1 = [{
                    $match: {

                        patient: ObjectId(req.params.patientid)
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                patient: "$patient",
                                passports: "$passports",
                                dateofAppointment: "$dateofAppointment",
                                doctorname: "$doctorname",
                                embassy: "$embassy",
                                hospitalemail: "$hospitalemail",
                                _id: "$_id",
                                patientname: "$patientname",
                                passportnumber: "$passportnumber",
                                linkstatus: "$linkstatus",
                                attendant: "$attendant",
                                donor: "$donor",
                                embassyAddress: "$embassyAddress",
                                user: "$user",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'responsevil',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },

                        ],

                        as: 'vilResponse',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        vilResponse: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",


                    }
                },
            ]
            data = await Vil.aggregate(pipeline1)


            res.send(data[0])
        }
    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientVilByUnit = async(req, res, next) => {
    try {
        const { hospitalid } = req.params;

        console.log(req.params.patientid)
        console.log(hospitalid)
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid,
                    patient: ObjectId(req.params.patientid)

                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            patient: "$patient",
                            passports: "$passports",
                            dateofAppointment: "$dateofAppointment",
                            doctorname: "$doctorname",
                            embassy: "$embassy",
                            hospitalemail: "$hospitalemail",
                            _id: "$_id",
                            patientname: "$patientname",
                            passportnumber: "$passportnumber",
                            linkstatus: "$linkstatus",
                            attendant: "$attendant",
                            donor: "$donor",
                            embassyAddress: "$embassyAddress",
                            user: "$user",
                            createdAt: "$createdAt"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        { "$match": { "$expr": { "$eq": ["$hospitalid", req.params.hospitalid] } } },

                    ],

                    as: 'vilResponse',

                }
            },
            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },
                    vilResponse: 1

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    linkStatus: "$data.linkstatus",


                }
            },
        ]
        data = await Vil.aggregate(pipeline1)




        res.send(data[0])
    } catch (err) {
        next(err)
    }

}
exports.getPatientVilById = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Vil.findById(req.params.id, projectVil).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        .then(data => {

            if (data) {
                res.send(data);

            } else {
                s
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}

// Hospital Vil
module.exports.uploadHosVil = (upload.single('villetter')), (request, response, next) => {
    next();
}
exports.postHospitalVil = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        console.log(req.body)
        const designation = await Designation.find({ "hospital": decoded.userid });

        var hospitalid = req.body.hospital

        const { patientid } = req.params;
        const requestVil = await Vil.findOne({ patient: patientid, hospitalid: req.body.hospitalid })

        const responsevil = new ResponseVil();
        responsevil.hospitalname = req.body.hospitalname
        responsevil.hospitalemail = req.body.hospitalemail
        responsevil.hospitalid = req.body.hospitalid

        responsevil.linkstatus = req.body.linkstatus
        if (requestVil.aggregator == 'NIL') {
            userid = req.params.userid;

        } else {
            userid = requestVil.aggregator

        }


        const user = await Facilitator.findById(userid)

        const patient = await PatientFac.findById(patientid)
        embassy = []
        embassyAddress = req.body.embassyAddress
        embassyCms = req.body.embassy
        if (req.body.embassy == undefined) {
            embassyAddress.forEach(element => {
                embassy.push(element.address)
            });
            responsevil.embassy = embassy
            console.log('own', responsevil.embassy)

        } else {
            embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassy = embassy.filter(function(element) {
                return element !== undefined && element !== '';
            });
            responsevil.embassy = embassy
            console.log('cms', responsevil.embassy)
        }


        responsevil.patientname = req.body.patientname
        responsevil.passportnumber = req.body.passportnumber
        responsevil.patientcountry = req.body.patientcountry
        responsevil.attendant = req.body.attendant
        responsevil.donor = req.body.donor
        responsevil.doctorname = req.body.doctorname
        responsevil.date = req.body.date

        responsevil.dateofAppointment = moment(req.body.dateofAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
        responsevil.attendant.map((obj, i) => {

            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.attendant.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })

        responsevil.donor.map((obj, i) => {
            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.donor.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const facilitator = await Facilitator.findOne({ "_id": userid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
        responsevil.hospitalLogo = hospital.logosize1
        responsevil.address = hospital.address
        responsevil.companyEmail = hospital.companyemail
        responsevil.hospitalUsername = hospitalUsername.name['name']
        responsevil.signName = decoded['name']

        responsevil.hospitalUserDesignation = designation[0].designation
        responsevil.hospitalUserSignature = designation[0].documentSignature['key']
        html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');
        if (responsevil.dateofAppointment !== 'Invalid date') {
            responsevil.checkAppointment = [responsevil.dateofAppointment]
        } else {
            responsevil.checkAppointment = []

        }

        var htmlContent = mustache.render(html, { "dataObj": responsevil });
        var attachments = [];
        var options = {

            format: 'letter',
            orientation: "potrait",

        };


        const rest = await pdf.create(htmlContent, options)
        let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
        let bufferResult = await pdfToBuffer();

        attachments.push({
            filename: `Visa Invite ${patient.name}` + '.pdf',
            content: bufferResult,
            contentType: 'application/pdf'
        })

        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `Visa Invite ${patient.name}.pdf`,
            Body: bufferResult,
            ACL: 'public-read',
            ContentType: 'application/pdf'
        };
        emailccsend = []


        emailcc = await UserRoleFac.find({ "user": userid })
        emailcc.forEach(element => {
            if (element.Role == "Management")
                emailccsend.push(element.email)
        })
        searchExist = {
            "patient": patient._id,
            "hospitalid": req.body.hospitalid
        }
        await s3.upload(params, async function(err, data) {
            responsevil.villetter = {
                key: data.key,
                mimetype: 'application/pdf',
                originalname: 'VIL Letter.pdf'

            }
            vilExist = await ResponseVil.find(searchExist)
            if (vilExist.length) {
                console.log('Exist')
                villetterUpdate = {
                    villetter: {
                        key: data.key,
                        originalname: 'VIL Letter.pdf',
                        mimetype: 'application/pdf',

                    }
                }
                updateExisting = await ResponseVil.findByIdAndUpdate(vilExist[0]._id, { $set: villetterUpdate }, { new: true })

            } else {
                console.log('notExist')
                responsevil.user = user._id
                responsevil.patient = patient._id
                user.responsevils.push(responsevil)
                patient.responsevils.push(responsevil)
                patient.currentstatus = Status.receivedvil
                await responsevil.save()
                await patient.save()
                await user.save()
            }

            res.status(201).send({ message: 'success' })
            sendEmail.sendHospitalVil(attachments, hospitalid, patient, facilitator, responsevil.hospitalname, emailccsend, req)
        });

    } catch (err) {
        next(err);
    }
}
exports.postHospitalVilMail = async(req, res, next) => {
    try {
        console.log(req.body)
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        var hospitalid = req.body.hospital
        const designation = await Designation.find({ "hospital": decoded.userid });

        const { patientid } = req.params;
        const requestVil = await Vil.findOne({ patient: patientid, hospitalid: req.body.hospitalid })

        const responsevil = new ResponseVil();
        responsevil.hospitalname = req.body.hospitalname
        responsevil.hospitalemail = req.body.hospitalemail
        responsevil.hospitalid = req.body.hospitalid

        responsevil.linkstatus = req.body.linkstatus
        if (requestVil.aggregator == 'NIL') {
            userid = req.params.userid;

        } else {
            userid = requestVil.aggregator

        }

        const user = await Facilitator.findById(userid)

        const patient = await PatientFac.findById(patientid)
        embassy = []
        embassyAddress = req.body.embassyAddress
        embassyCms = req.body.embassy
        if (req.body.embassy == undefined) {
            embassyAddress.forEach(element => {
                embassy.push(element.address)
            });
            responsevil.embassy = embassy
            console.log('own', responsevil.embassy)

        } else {
            embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassy = embassy.filter(function(element) {
                return element !== undefined && element !== '';
            });
            responsevil.embassy = embassy
            console.log('cms', responsevil.embassy)
        }


        responsevil.patientname = req.body.patientname
        responsevil.passportnumber = req.body.passportnumber
        responsevil.patientcountry = req.body.patientcountry
        responsevil.attendant = req.body.attendant
        responsevil.donor = req.body.donor
        responsevil.doctorname = req.body.doctorname
        responsevil.date = req.body.date

        responsevil.dateofAppointment = moment(req.body.dateofAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
        responsevil.attendant.map((obj, i) => {

            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.attendant.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })

        responsevil.donor.map((obj, i) => {
            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.donor.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const facilitator = await Facilitator.findOne({ "_id": userid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
        responsevil.hospitalLogo = hospital.logosize1
        responsevil.address = hospital.address
        responsevil.companyEmail = hospital.companyemail
        responsevil.hospitalUsername = hospitalUsername.name['name']
        responsevil.signName = decoded['name']

        responsevil.hospitalUserDesignation = designation[0].designation
        responsevil.hospitalUserSignature = designation[0].documentSignature['key']
        html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');
        if (responsevil.dateofAppointment !== 'Invalid date') {
            responsevil.checkAppointment = [responsevil.dateofAppointment]
        } else {
            responsevil.checkAppointment = []

        }

        var htmlContent = mustache.render(html, { "dataObj": responsevil });
        var attachments = [];
        var options = {

            format: 'letter',
            orientation: "potrait",

        };


        const rest = await pdf.create(htmlContent, options)
        let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
        let bufferResult = await pdfToBuffer();

        attachments.push({
            filename: `Visa Invite ${patient.name}` + '.pdf',
            content: bufferResult,
            contentType: 'application/pdf'
        })

        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `Visa Invite ${patient.name}.pdf`,
            Body: bufferResult,
            ACL: 'public-read',
            ContentType: 'application/pdf'
        };
        emailccsend = []


        emailcc = await UserRoleFac.find({ "user": userid })
        emailcc.forEach(element => {
            if (element.Role == "Management")
                emailccsend.push(element.email)
        })
        searchExist = {
            "patient": patient._id,
            "hospitalid": req.body.hospitalid
        }
        await s3.upload(params, async function(err, data) {
            responsevil.villetter = {
                key: data.key,
                mimetype: 'application/pdf',
                originalname: 'VIL Letter.pdf'

            }
            vilExist = await ResponseVil.find(searchExist)
            if (vilExist.length) {
                console.log('Exist')
                villetterUpdate = {
                    villetter: {
                        key: data.key,
                        originalname: 'VIL Letter.pdf',
                        mimetype: 'application/pdf',

                    }
                }
                updateExisting = await ResponseVil.findByIdAndUpdate(vilExist[0]._id, { $set: villetterUpdate }, { new: true })

            } else {
                console.log('notExist')
                responsevil.user = user._id
                responsevil.patient = patient._id
                user.responsevils.push(responsevil)
                patient.responsevils.push(responsevil)
                patient.currentstatus = Status.receivedvil
            }

            res.status(201).send({ message: 'success' })
            sendEmail.sendHospitalVilMail(attachments, hospitalid, patient, facilitator, responsevil.hospitalname, emailccsend, req.body.email, req)
        });

    } catch (err) {
        next(err);
    }
}
exports.postHospitalVilDownload = async(req, res, next) => {
    try {
        console.log(req.body)
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        var hospitalid = req.body.hospital
        const { userid } = req.params;
        const designation = await Designation.find({ "hospital": decoded.userid });

        const { patientid } = req.params;

        const responsevil = new ResponseVil();
        responsevil.hospitalname = req.body.hospitalname
        responsevil.hospitalemail = req.body.hospitalemail
        responsevil.hospitalid = req.body.hospitalid

        responsevil.linkstatus = req.body.linkstatus


        const user = await Facilitator.findById(userid)

        const patient = await PatientFac.findById(patientid)
        embassy = []
        embassyAddress = req.body.embassyAddress
        embassyCms = req.body.embassy
        if (req.body.embassy == undefined) {
            embassyAddress.forEach(element => {
                embassy.push(element.address)
            });
            responsevil.embassy = embassy
            console.log('own', responsevil.embassy)

        } else {
            embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassy = embassy.filter(function(element) {
                return element !== undefined && element !== '';
            });
            responsevil.embassy = embassy
            console.log('cms', responsevil.embassy)
        }


        responsevil.patientname = req.body.patientname
        responsevil.passportnumber = req.body.passportnumber
        responsevil.patientcountry = req.body.patientcountry
        responsevil.attendant = req.body.attendant
        responsevil.donor = req.body.donor
        responsevil.doctorname = req.body.doctorname
        responsevil.date = req.body.date

        responsevil.dateofAppointment = moment(req.body.dateofAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
        responsevil.attendant.map((obj, i) => {

            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.attendant.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })

        responsevil.donor.map((obj, i) => {
            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.donor.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const facilitator = await Facilitator.findOne({ "_id": userid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
        responsevil.hospitalLogo = hospital.logosize1
        responsevil.address = hospital.address
        responsevil.companyEmail = hospital.companyemail
        responsevil.hospitalUsername = hospitalUsername.name['name']
        responsevil.signName = decoded['name']

        responsevil.hospitalUserDesignation = designation[0].designation
        responsevil.hospitalUserSignature = designation[0].documentSignature['key']
        html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');
        if (responsevil.dateofAppointment !== 'Invalid date') {
            responsevil.checkAppointment = [responsevil.dateofAppointment]
        } else {
            responsevil.checkAppointment = []

        }

        var htmlContent = mustache.render(html, { "dataObj": responsevil });
        var options = {

            format: 'letter',
            orientation: "potrait",

        };


        const rest = await pdf.create(htmlContent, options)
        let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
        let bufferResult = await pdfToBuffer();

        filename = encodeURIComponent(`VIL Invite`) + '.pdf'
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
        res.setHeader('Content-type', 'application/pdf')
        res.send(bufferResult)

    } catch (err) {
        next(err);
    }
}

exports.getResponseVilById = async(req, res) => {


    ResponseVil.findOne({ "patient": req.params.patientid, "hospitalid": req.params.hospitalid })
        .then(data => {

            if (data) {
                res.send(data);

            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}

exports.postHospitalVilEmbassy = async(req, res, next) => {
    try {
        console.log(req.body)

        var hospitalid = req.body.hospital

        const { patientid } = req.params;
        const requestVil = await Vil.findOne({ patient: patientid, hospitalid: req.body.hospitalid })

        const responsevil = new ResponseVil();
        responsevil.hospitalname = req.body.hospitalname
        responsevil.hospitalemail = req.body.hospitalemail
        responsevil.hospitalid = req.body.hospitalid

        responsevil.linkstatus = req.body.linkstatus

        if (requestVil.aggregator == 'NIL') {
            userid = req.params.userid;

        } else {
            userid = requestVil.aggregator

        }
        const user = await Facilitator.findById(userid)

        const patient = await PatientFac.findById(patientid)
        embassy = []
        embassyAddress = req.body.embassyAddress

        embassyCms = req.body.embassy
        if (req.body.embassy == undefined) {
            embassyAddress.forEach(element => {
                embassy.push(element.address)
            });
            responsevil.embassy = embassy
            console.log('own', responsevil.embassy)

        } else {
            embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassy = embassy.filter(function(element) {
                return element !== undefined && element !== '';
            });
            responsevil.embassy = embassy
            console.log('cms', responsevil.embassy)
        }

        embassyEmailTo = []
        embassyEmailCc = []
        embassyEmail = req.body.embassyEmail
        if (req.body.embassy == undefined) {
            embassyEmail.forEach(element => {
                embassyEmailTo.push(element.email)
            });
            console.log('ownEmail', embassyEmailTo)

        } else {
            embassyEmailTo.push(embassyCms.emailTo1, embassyCms.emailTo2)
            embassyEmailCc.push(embassyCms.emailCc1, embassyCms.emailCc2)

            embassyEmailTo = embassyEmailTo.filter(function(element) {
                return element !== undefined && element !== '';
            });
            embassyEmailCc = embassyEmailCc.filter(function(element) {
                return element !== undefined && element !== '';
            });
            console.log('cmsEmailto', embassyEmailTo)
            console.log('cmsEmailcc', embassyEmailCc)

        }

        responsevil.patientname = req.body.patientname
        responsevil.passportnumber = req.body.passportnumber
        responsevil.patientcountry = req.body.patientcountry
        responsevil.attendant = req.body.attendant
        responsevil.donor = req.body.donor
        responsevil.doctorname = req.body.doctorname
        responsevil.date = req.body.date

        responsevil.dateofAppointment = moment(req.body.dateofAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
        responsevil.attendant.map((obj, i) => {

            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.attendant.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })

        responsevil.donor.map((obj, i) => {
            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (responsevil.donor.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const facilitator = await Facilitator.findOne({ "_id": userid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
        responsevil.hospitalLogo = hospital.logosize1
        responsevil.address = hospital.address
        responsevil.companyEmail = hospital.companyemail
        responsevil.hospitalUsername = hospitalUsername.name['name']
        responsevil.hospitalUserDesignation = hospitalProfile.designation
        responsevil.hospitalUserSignature = hospitalProfile.documentSignature['key']
        html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');
        if (responsevil.dateofAppointment !== 'Invalid date') {
            responsevil.checkAppointment = [responsevil.dateofAppointment]
        } else {
            responsevil.checkAppointment = []

        }

        var htmlContent = mustache.render(html, { "dataObj": responsevil });
        var attachments = [];
        var options = {

            format: 'letter',
            orientation: "potrait",

        };


        const rest = await pdf.create(htmlContent, options)
        let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
        let bufferResult = await pdfToBuffer();

        attachments.push({
            filename: `Visa Invite ${patient.name}` + '.pdf',
            content: bufferResult,
            contentType: 'application/pdf'
        })

        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `Visa Invite ${patient.name}.pdf`,
            Body: bufferResult,
            ACL: 'public-read',
            ContentType: 'application/pdf'
        };
        emailccsend = []


        emailcc = await UserRoleFac.find({ "user": userid })
        companyFac = await CompanyFac.findOne({ "user": userid })

        emailcc.forEach(element => {
            if (element.Role == "Management")
                emailccsend.push(element.email)
        })
        embassyEmailCc.forEach(element => {
            emailccsend.push(element)
        })
        emailccsend.push(companyFac.email2)
        console.log(emailccsend)
        searchExist = {
            "patient": patient._id,
            "hospitalid": req.body.hospitalid
        }
        await s3.upload(params, async function(err, data) {
            responsevil.villetter = {
                key: data.key,
                originalname: 'VIL Letter.pdf',
                mimetype: 'application/pdf'
            }
            vilExist = await ResponseVil.find(searchExist)
            if (vilExist.length) {
                console.log('Exist')
                villetterUpdate = {
                    villetter: {
                        key: data.key,
                        originalname: 'VIL Letter.pdf',
                        mimetype: 'application/pdf'
                    }
                }
                updateExisting = await ResponseVil.findByIdAndUpdate(vilExist[0]._id, { $set: villetterUpdate }, { new: true })

            } else {
                console.log('notExist')
                responsevil.user = user._id
                responsevil.patient = patient._id
                user.responsevils.push(responsevil)
                patient.responsevils.push(responsevil)
                patient.currentstatus = Status.receivedvil
                await responsevil.save()
                await patient.save()
                await user.save()
            }

            res.status(201).send({ message: 'success' })
            sendEmail.sendHospitalVilToEmbassy(attachments, hospitalid, patient, facilitator, responsevil.hospitalname, emailccsend, responsevil.doctorname, embassyEmailTo, req)
        });

    } catch (err) {
        next(err);
    }
}

exports.getEmbassyCms = (req, res) => {

    const { country } = req.params;
    var pipeline = [{
            $lookup: {
                from: 'countries',
                localField: 'country',
                foreignField: '_id',
                as: 'country',

            },

        },
        {
            $match: {
                "country.name": country
            }
        },
        {
            $project: {
                "country": 0
            }
        },

    ]
    Embassy.aggregate(pipeline, (err, doc) => {
        if (!err) {
            res.send(doc)

        } else {
            res.send(err)

        }

    })

}
exports.getResponseVilUnit = async(req, res) => {

    ResponseVil.find({ "hospitalid": req.params.hospitalid })
        .then(data => {

            if (data) {
                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}
exports.getResponseVilGroup = async(req, res, next) => {
        try {
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            data = await ResponseVil.find({
                "hospitalid": {
                    $in: doc[0].hospitalid
                }
            })
            res.send(data)

        } catch (err) {
            next(err)
        }

    }
    // Pre Intimation
projectIntimation = {
    hospitalname: 1,
    hospitalid: 1,
    date: 1,
    patient: 1,
    sent: 1,
    _id: 1
}
exports.getPatientPreIntimationByUnit = async(req, res) => {

    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);


    if (decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {

        userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$patient" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { country: 1 } }
                    ],

                    as: 'patientCheck',

                }
            },
            {
                $addFields: {
                    patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                }
            },
            {
                $match: {
                    "patientCheck.country": {
                        $in: userRole.country
                    },
                }
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            date: "$date",
                            patient: "$patient",
                            sent: "$sent",
                            _id: "$_id"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },


                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    sent: "$data.sent",


                }
            },
        ]
    } else {
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            date: "$date",
                            patient: "$patient",
                            sent: "$sent",
                            _id: "$_id"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },


                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    sent: "$data.sent",


                }
            },
        ]
    }


    data = await Preintimation.aggregate(pipeline1)
    res.send(data.sort((a, b) => a.createdAt - b.createdAt))
}
exports.getPatientPreIntimationByGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)


            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                patient: "$patient",
                                sent: "$sent",
                                _id: "$_id"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },


                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        sent: "$data.sent",


                    }
                },
            ]
            data = await Preintimation.aggregate(pipeline1)
            res.send(data.sort((a, b) => a.createdAt - b.createdAt))

        } else {
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)


            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                patient: "$patient",
                                sent: "$sent",
                                _id: "$_id"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },


                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        sent: "$data.sent",


                    }
                },
            ]
            data = await Preintimation.aggregate(pipeline1)
            res.send(data.sort((a, b) => a.createdAt - b.createdAt))

        }

    } catch (err) {
        next(err)
    }

}

exports.postPatientIntimation = async(req, res, next) => {
    try {
        console.log(req.body)
        const patient = await PatientFac.findById(req.body.patient)
        const intimation = await Preintimation.findById(req.body.intimationId)
        intimation.sent = true
        await intimation.save()
        if (intimation.aggregator == 'NIL') {
            userid = patient.user

        } else {
            userid = intimation.aggregator

        }
        emailcc = await UserRoleFac.find({ "user": userid })
        companyFac = await CompanyFac.findOne({ "user": userid })
        const facilitator = await Facilitator.findOne({ "_id": userid })

        emailccsend = []
        emailcc.forEach(element => {
            if (element.Role == "Management")
                emailccsend.push(element.email)
        })
        emailccsend.push(facilitator.email)
        res.send({ message: "Success" })
        sendEmail.sendPreIntimation(req.body, patient, emailccsend, companyFac, req, userid)


    } catch (err) {
        next(err);
    }
}


// Opd Resuest
projectOpd = {
    _id: 1,
    doctors: 1,
    linkstatus: 1,
    hospitalname: 1,
    hospitalid: 1,
    date: 1,
    email: 1,
    createdAt: 1
}

exports.getPatientOpdByUnit = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            pipeline1 = [{
                    $match: {
                        hospitalid: req.params.hospitalid
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        "patientCheck.country": {
                            $in: userRole.country
                        },
                    }
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                doctors: "$doctors",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'opdresponse',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'opdSent',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        opdSent: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Opd.aggregate(pipeline1)

            const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid }, country: { $in: userRole.country } }).populate('hospitalOpdAssigns')
            filterPat = []
            pat.forEach(element => {
                if (element.hospitalOpdAssigns.length) {
                    element.hospitalOpdAssigns.forEach(element1 => {
                        if (element1.hospitalId == req.params.hospitalid && element.associatedhospital.hospitalid != req.params.hospitalid) {
                            filterPat.push(element)
                        }
                    })
                }
                if (!element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                } else if (element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                }
            });
            result = data.concat(filterPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        } else if (decoded.Role == 'Unit Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const pat = await Patient.find({ "refferalpartner._id": partner._id.toString() }).populate('hospitalConfirmationAssign')
            filterPat = []
            pat.forEach(element => {
                if (element.hospitalOpdAssigns.length) {
                    element.hospitalOpdAssigns.forEach(element1 => {
                        if (element1.hospitalId == req.params.hospitalid && element.associatedhospital.hospitalid != req.params.hospitalid) {
                            filterPat.push(element)
                        }
                    })
                }
                if (!element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                } else if (element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                }
            });

            res.send(filterPat)
        } else {
            pipeline1 = [{
                    $match: {
                        hospitalid: req.params.hospitalid
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                doctors: "$doctors",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'opdresponse',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'opdSent',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        opdSent: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Opd.aggregate(pipeline1)

            const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid } }).populate('hospitalOpdAssigns')
            filterPat = []
            pat.forEach(element => {
                if (element.hospitalOpdAssigns.length) {
                    element.hospitalOpdAssigns.forEach(element1 => {
                        if (element1.hospitalId == req.params.hospitalid && element.associatedhospital.hospitalid != req.params.hospitalid) {
                            filterPat.push(element)
                        }
                    })
                }
                if (!element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                } else if (element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                    filterPat.push(element)

                }
            });
            result = data.concat(filterPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        }

    } catch (err) {
        next(err)
    }

}
exports.getPatientOpdByGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            const { hospitalgroup } = req.params;

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                doctors: "$doctors",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'opdresponse',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'opdSent',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        opdSent: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Opd.aggregate(pipeline1)
            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                },
                country: { $in: userRole.country }

            }).populate({
                    "path": "hospitalOpdAssigns",
                    match: {
                        "hospitalId": {
                            $in: userRole.hospitalVisiblity
                        },
                    }

                }

            )
            result = data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            dataPat = await Patient.find({
                "refferalpartner._id": partner._id.toString()
            }).populate('hospitalOpdAssigns')

            res.send(dataPat)

        } else {
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                doctors: "$doctors",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'opdresponse',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'opdSent',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        opdSent: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Opd.aggregate(pipeline1)
            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                }
            }).populate('hospitalOpdAssigns')
            result = data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        }


    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientOpd = async(req, res, next) => {
    try {

        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            pipeline1 = [{
                    $match: {

                        patient: ObjectId(req.params.patientid)

                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                doctors: "$doctors",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'opdresponse',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'opdSent',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        opdSent: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Opd.aggregate(pipeline1)


            res.send(data[0])

        } else {
            pipeline1 = [{
                    $match: {

                        patient: ObjectId(req.params.patientid)

                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                doctors: "$doctors",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },
                {
                    $lookup: {
                        from: 'opdresponse',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                        ],

                        as: 'opdSent',

                    }
                },
                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },
                        opdSent: 1

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Opd.aggregate(pipeline1)


            res.send(data[0])
        }


    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientOpdByUnit = async(req, res, next) => {
    try {
        const { hospitalid } = req.params;

        console.log(req.params.patientid)
        console.log(hospitalid)

        pipeline1 = [{
                $match: {
                    hospitalid: hospitalid,
                    patient: ObjectId(req.params.patientid)

                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            _id: "$_id",
                            doctors: "$doctors",
                            linkstatus: "$linkstatus",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            date: "$date",
                            email: "$email",
                            createdAt: "$createdAt"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },
            {
                $lookup: {
                    from: 'opdresponse',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$patient", "$$id"] } } },
                    ],

                    as: 'opdSent',

                }
            },
            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },
                    opdSent: 1

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    linkStatus: "$data.linkstatus",

                }
            },
        ]
        data = await Opd.aggregate(pipeline1)


        res.send(data[0])
    } catch (err) {
        next(err)
    }

}
exports.getPatientOpdResByUnit = async(req, res, next) => {
    try {
        data = await OpdResponse.find({ "hospitalid": req.params.hospitalid }).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid } }).populate('hospitalOpdAssigns hospitalOpdAdded')
        filterPat = []
        pat.forEach(element => {
            if (element.hospitalOpdAssigns.length) {
                element.hospitalOpdAssigns.forEach(element1 => {
                    if (element1.hospitalId == req.params.hospitalid && element.associatedhospital.hospitalid != req.params.hospitalid) {
                        filterPat.push(element)
                    }
                })
            }
            if (!element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            } else if (element.hospitalOpdAssigns.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            }
        });
        res.send(data.concat(filterPat));
    } catch (err) {
        next(err)
    }

}
exports.getPatientOpdResByGroup = async(req, res, next) => {
    try {
        const { hospitalgroup } = req.params;

        var pipeline = [{
                $match: {
                    hospitalgroup: ObjectId(hospitalgroup),
                }
            },

            {
                $group: {
                    _id: "$hospitalgroup",
                    hospitalid: {
                        $push: {
                            $toString: "$_id",


                        }

                    }
                }
            },

        ]
        doc = await Group.aggregate(pipeline)
        doc[0].hospitalid.push(hospitalgroup)
        data = await OpdResponse.find({
            "hospitalid": {
                $in: doc[0].hospitalid
            }
        }).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        var pipeline = [{
                $match: {
                    hospitalgroup: ObjectId(hospitalgroup),
                }
            },

            {
                $group: {
                    _id: "$hospitalgroup",
                    hospitalid: {
                        $push: {
                            $toString: "$_id",


                        }

                    }
                }
            },

        ]
        docPat = await Group.aggregate(pipeline)
        docPat[0].hospitalid.push(hospitalgroup)
        dataPat = await Patient.find({
            "associatedhospital.hospitalid": {
                $in: doc[0].hospitalid
            }
        }).populate('hospitalOpdAssigns hospitalOpdAdded')

        res.send(data.concat(dataPat))

    } catch (err) {
        next(err)
    }

}
exports.getPatientOpdById = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Opd.findById(req.params.id, projectOpd).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        .then(data => {

            if (data) {
                res.send(data);

            } else {

                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.getResponseOpdByOpdId = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    OpdResponse.findOne({ "opdid": req.params.id })
        .then(data => {

            if (data) {
                res.send(data);

            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.addPatientOpd = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        var hospital = req.body.hospital
        const addOpd = new AddOpd();
        addOpd.hospitalname = req.body.hospitalname;
        addOpd.hospitalemail = req.body.hospitalemail;
        addOpd.linkstatus = req.body.linkstatus;
        addOpd.hospitalid = req.body.hospitalid;
        addOpd.opdid = req.body.opdid;
        addOpd.date = req.body.date;
        if (req.body.meetinglink == "") {
            addOpd.meetinglink = "NIL";

        } else {
            addOpd.meetinglink = req.body.meetinglink;

        }
        if (req.body.paymentlink == "") {
            addOpd.paymentlink = "NIL";

        } else {
            addOpd.paymentlink = req.body.paymentlink;

        }
        addOpd.doctorname = req.body.doctorname;

        const patient = await PatientFac.findById(patientid)

        addOpd.patient = patient._id

        await addOpd.save()

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getAddFacOpdGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })

            data = await AddOpd.find({
                "hospitalid": {
                    $in: userRole.hospitalVisiblity
                },
                "patient": req.params.patientid
            })

            res.send(data)
        } else {
            data = await AddOpd.find({ "patient": req.params.patientid })
            res.send(data)
        }

    } catch (err) {
        next(err);
    }

}

exports.getAddFacOpdUnit = async(req, res) => {

    AddOpd.find({ "patient": req.params.patientid, "hospitalid": req.params.hospitalid })
        .then(data => {

            if (data) {

                res.send(data);
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.postOpdResponse = async(req, res, next) => {
    try {
        console.log(req.body)
        const { patientid } = req.params;
        var hospital = req.body.hospital
        const opdresponse = new OpdResponse();
        opdresponse.hospitalname = req.body.hospitalname;
        opdresponse.hospitalemail = req.body.hospitalemail;
        opdresponse.linkstatus = req.body.linkstatus;
        opdresponse.hospitalid = req.body.hospitalid;
        opdresponse.opdid = req.body.opdid;
        opdresponse.date = req.body.date;
        opdRequest = await Opd.findOne({ _id: req.body.opdid })

        if (req.body.meetinglink == "") {
            opdresponse.meetinglink = "NIL";

        } else {
            opdresponse.meetinglink = req.body.meetinglink;

        }
        if (req.body.paymentlink == "") {
            opdresponse.paymentlink = "NIL";

        } else {
            opdresponse.paymentlink = req.body.paymentlink;

        }
        opdresponse.doctorname = req.body.doctorname;


        const patient = await PatientFac.findById(patientid)

        opdresponse.patient = patient._id
        await opdresponse.save()
        date = moment(req.body.date).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        if (opdRequest.aggregator == 'NIL') {
            userid = patient.user

        } else {
            userid = opdRequest.aggregator

        }
        emailcc = await UserRoleFac.find({ "user": userid })
        companyFac = await CompanyFac.findOne({ "user": userid })
        const facilitator = await Facilitator.findOne({ "_id": userid })

        emailccsend = []
        emailcc.forEach(element => {
            if (element.Role == "Management")
                emailccsend.push(element.email)
        })
        emailccsend.push(facilitator.email)
        reqEmailCc = req.body.emailCc
        reqEmailCc.forEach(element => {
            emailccsend.push(element.emailcc)
        });
        sendEmail.opdSent(patient, opdresponse, date, emailccsend, companyFac, hospital, req, userid)

        patient.opdresponses.push(opdresponse)
        patient.currentstatus = Status.opdreceived

        await patient.save()

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

// Pi Resuest
projectPi = {
    _id: 1,
    linkstatus: 1,
    hospitalname: 1,
    hospitalid: 1,
    date: 1,
    email: 1,
    query: 1,
    hospitalemail: 1
}
exports.getPatientPiByUnit = async(req, res) => {
    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);


    if (decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {

        userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$patient" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { country: 1 } }
                    ],

                    as: 'patientCheck',

                }
            },
            {
                $addFields: {
                    patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                }
            },
            {
                $match: {
                    "patientCheck.country": {
                        $in: userRole.country
                    },
                }
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            _id: "$_id",
                            linkstatus: "$linkstatus",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            date: "$date",
                            email: "$email",
                            query: "$query",
                            hospitalemail: "$hospitalemail"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    linkStatus: "$data.linkstatus",

                }
            },
        ]
    } else {
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            _id: "$_id",
                            linkstatus: "$linkstatus",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            date: "$date",
                            email: "$email",
                            query: "$query",
                            hospitalemail: "$hospitalemail"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    linkStatus: "$data.linkstatus",

                }
            },
        ]
    }

    data = await Pi.aggregate(pipeline1)
    res.send(data.sort((a, b) => a.createdAt - b.createdAt))
}
exports.getPatientPiByGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            const { hospitalgroup } = req.params;

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },

                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                query: "$query",
                                hospitalemail: "$hospitalemail"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Pi.aggregate(pipeline1)
            res.send(data.sort((a, b) => a.createdAt - b.createdAt))
        } else {
            const { hospitalgroup } = req.params;

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)
            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                query: "$query",
                                hospitalemail: "$hospitalemail"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Pi.aggregate(pipeline1)
            res.send(data.sort((a, b) => a.createdAt - b.createdAt))
        }



    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientPi = async(req, res, next) => {
    try {
        const { hospitalid } = req.params;

        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            pipeline1 = [{
                    $match: {

                        patient: ObjectId(req.params.patientid)

                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                query: "$query",
                                hospitalemail: "$hospitalemail"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Pi.aggregate(pipeline1)


            res.send(data[0])
        } else {
            pipeline1 = [{
                    $match: {

                        patient: ObjectId(req.params.patientid)

                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                linkstatus: "$linkstatus",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                date: "$date",
                                email: "$email",
                                query: "$query",
                                hospitalemail: "$hospitalemail"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        linkStatus: "$data.linkstatus",

                    }
                },
            ]
            data = await Pi.aggregate(pipeline1)


            res.send(data[0])
        }


    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientPiByUnit = async(req, res, next) => {
    try {
        const { hospitalid } = req.params;

        console.log(req.params.patientid)
        console.log(hospitalid)

        pipeline1 = [{
                $match: {
                    hospitalid: hospitalid,
                    patient: ObjectId(req.params.patientid)

                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            _id: "$_id",
                            linkstatus: "$linkstatus",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            date: "$date",
                            email: "$email",
                            query: "$query",
                            hospitalemail: "$hospitalemail"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    linkStatus: "$data.linkstatus",

                }
            },
        ]
        data = await Pi.aggregate(pipeline1)


        res.send(data[0])
    } catch (err) {
        next(err)
    }

}
exports.getPatientPiById = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Pi.findById(req.params.id, projectPi).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        .then(data => {

            if (data) {
                res.send(data);

            } else {

                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}

exports.getResponsePiByPiId = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    PiRes.findOne({ "piid": req.params.id })
        .then(data => {

            if (data) {
                res.send(data);

            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}

exports.postPiResponse = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        const designation = await Designation.find({ "hospital": decoded.userid });

        const { patientid } = req.params;
        var hospitalid = req.body.hospital
        const piresponse = new PiRes();
        piresponse.hospitalname = req.body.hospitalname;
        piresponse.hospitalid = req.body.hospitalid;
        piresponse.hospitalemail = req.body.hospitalemail;
        piresponse.linkstatus = req.body.linkstatus;
        piresponse.piid = req.body.piid;
        const patient = await PatientFac.findById(patientid)
        piresponse.doctorname = req.body.doctorname;
        piresponse.stayincountry = req.body.stayincountry;
        piresponse.countryduration = req.body.countryduration;
        piresponse.hospitalduration = req.body.hospitalduration;
        piresponse.stayinhospital = req.body.stayinhospital;
        piresponse.treatmentplan = req.body.treatmentplan;
        piresponse.initialevaluationminimum = req.body.initialevaluationminimum;
        piresponse.initialevaluationmaximum = req.body.initialevaluationmaximum;
        piresponse.costminimum = req.body.costminimum;
        piresponse.costmaximum = req.body.costmaximum;
        piresponse.roomcategory = req.body.roomcategory;
        piresponse.remarks = req.body.remarks;
        piRequest = await Pi.findOne({ _id: req.body.piid })

        if (piRequest.aggregator == 'NIL') {
            userid = patient.user

        } else {
            userid = piRequest.aggregator

        }
        console.log(userid)
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const facilitator = await Facilitator.findOne({ "_id": userid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
        const hospitalBank = await HospitalBank.findOne({ "hospital": hospitalid })
        const emailcc = await UserRoleFac.find({ "user": userid })
        const companyFac = await CompanyFac.findOne({ "user": userid })

        piresponse.hospitalLogo = hospital.logosize1
        piresponse.address = hospital.address
        piresponse.companyEmail = hospital.companyemail
        piresponse.hospitalUsername = hospitalUsername.name['name']
        piresponse.signName = decoded['name']

        piresponse.hospitalUserDesignation = designation[0].designation
        piresponse.hospitalUserSignature = designation[0].documentSignature['key']
        piresponse.patientName = patient.name

        piresponse.beneficiaryName = hospitalBank.beneficiaryName
        piresponse.accountNo = hospitalBank.accountNo
        piresponse.accountType = hospitalBank.accountType
        piresponse.bankName = hospitalBank.bankName
        piresponse.branch = hospitalBank.branch
        piresponse.bankAaddress = hospitalBank.address
        piresponse.city = hospitalBank.city
        piresponse.state = hospitalBank.state
        piresponse.ifscCode = hospitalBank.ifscCode
        piresponse.branchCode = hospitalBank.branchCode


        html = fs.readFileSync(__dirname + '/templates/pihospital.html', 'utf8');

        var htmlContent = mustache.render(html, { "dataObj": piresponse });
        var attachments = [];
        var options = {

            format: 'letter',
            orientation: "potrait",

        };


        const rest = await pdf.create(htmlContent, options)
        let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
        let bufferResult = await pdfToBuffer();

        attachments.push({
            filename: `Proforma Invoice ${patient.name}` + '.pdf',
            content: bufferResult,
            contentType: 'application/pdf'
        })

        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `Proforma Invoice ${patient.name}.pdf`,
            Body: bufferResult,
            ACL: 'public-read',
            ContentType: 'application/pdf'
        };

        emailccsend = []
        emailcc.forEach(element => {
            if (element.Role == "Management")
                emailccsend.push(element.email)
        })
        emailccsend.push(facilitator.email)
        piresponse.date = req.body.todayDate
        await s3.upload(params, async function(err, data) {
            piresponse.proformainvoice = {
                key: data.key,
                originalname: 'Proforma Invoice.pdf',
                mimetype: 'application/pdf'
            }
            piresponse.patient = patient._id
            await piresponse.save()
            patient.currentstatus = Status.pireceived
            patient.piresponses.push(piresponse)
            await patient.save()
            sendEmail.sendProformaInvoice(patient, piresponse, emailccsend, companyFac, attachments, hospitalid, req, userid)
            res.status(201).send({ message: 'success' })
        });

    } catch (err) {
        next(err);
    }
}

exports.getAddFacPiGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })

            data = await PiRes.find({
                "hospitalid": {
                    $in: userRole.hospitalVisiblity
                },
                "patient": req.params.patientid
            })

            res.send(data)
        } else {
            data = await PiRes.find({ "patient": req.params.patientid })
            res.send(data)
        }


    } catch (err) {
        next(err);
    }

}

exports.getAddFacPiUnit = async(req, res) => {



        PiRes.find({ "patient": req.params.patientid, "hospitalid": req.params.hospitalid })
            .then(data => {

                if (data) {

                    res.send(data);
                }
                // res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: "Some error occurred while searching"
                });

            });
    }
    // patient confirmation

// Pi Resuest
projectConf = {
    _id: 1,
    hospitalname: 1,
    hospitalid: 1,
    arrivaldate: 1,
    ticket: 1,
    villetter: 1,
    approved: 1,
    cabs: 1,
    flightName: 1,
    flightNo: 1,
    contactPerson: 1,
    contactPersonNo: 1,
    coordinatorAddress: 1,
    coordinatorTime: 1,
    remarks: 1,
    createdAt: 1
}
exports.getPatientConfByUnit = async(req, res) => {
    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);


    if (decoded.Role == 'Unit Manager' || decoded.Role == 'Unit Executive' || decoded.Role == 'Unit Query Manager' || decoded.Role == 'Unit Operation Manager') {

        userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$patient" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { country: 1 } }
                    ],

                    as: 'patientCheck',

                }
            },
            {
                $addFields: {
                    patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                }
            },
            {
                $match: {
                    "patientCheck.country": {
                        $in: userRole.country
                    },
                }
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            _id: "$_id",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            arrivaldate: "$arrivaldate",
                            ticket: "$ticket",
                            villetter: "$v",
                            approved: "$approved",
                            cabs: "$cabs",
                            flightName: "$flightName",
                            flightNo: "$flightNo",
                            contactPerson: "$contactPerson",
                            contactPerson: "$contactPerson",
                            coordinatorAddress: "$coordinatorAddress",
                            coordinatorTime: "$coordinatorTime",
                            remarks: "$remarks",
                            createdAt: "$createdAt"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },


                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    approved: "$data.approved",


                }
            },
        ]
        data = await Conf.aggregate(pipeline1)

        const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid }, country: { $in: userRole.country } }).populate('hospitalConfirmationAssign')
        filterPat = []
        pat.forEach(element => {
            if (element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                element.hospitalConfirmationAssign.forEach(element1 => {
                    if (element1.hospitalId == req.params.hospitalid) {
                        filterPat.push(element)
                    }
                })
            }
            if (!element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            } else if (element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            }
        });
        result = data.concat(filterPat)
        res.send(result.sort((a, b) => a.createdAt - b.createdAt))
    } else if (decoded.Role == 'Group Refferal Partner') {
        partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
        const pat = await Patient.find({ "refferalpartner._id": partner._id.toString() }).populate('hospitalConfirmationAssign')
        filterPat = []
        pat.forEach(element => {
            if (element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                element.hospitalConfirmationAssign.forEach(element1 => {
                    if (element1.hospitalId == req.params.hospitalid) {
                        filterPat.push(element)
                    }
                })
            }
            if (!element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            } else if (element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            }
        });
        res.send(filterPat)
    } else {
        pipeline1 = [{
                $match: {
                    hospitalid: req.params.hospitalid
                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            _id: "$_id",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            arrivaldate: "$arrivaldate",
                            ticket: "$ticket",
                            villetter: "$v",
                            approved: "$approved",
                            cabs: "$cabs",
                            flightName: "$flightName",
                            flightNo: "$flightNo",
                            contactPerson: "$contactPerson",
                            contactPerson: "$contactPerson",
                            coordinatorAddress: "$coordinatorAddress",
                            coordinatorTime: "$coordinatorTime",
                            remarks: "$remarks",
                            createdAt: "$createdAt"
                        }

                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },


                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    approved: "$data.approved",


                }
            },
        ]
        data = await Conf.aggregate(pipeline1)

        const pat = await Patient.find({ "hospital": { "$in": req.params.hospitalid } }).populate('hospitalConfirmationAssign')
        filterPat = []
        pat.forEach(element => {
            if (element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid != req.params.hospitalid) {
                element.hospitalConfirmationAssign.forEach(element1 => {
                    if (element1.hospitalId == req.params.hospitalid) {
                        filterPat.push(element)
                    }
                })
            }
            if (!element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            } else if (element.hospitalConfirmationAssign.length && element.associatedhospital.hospitalid == req.params.hospitalid) {
                filterPat.push(element)

            }
        });
        result = data.concat(filterPat)
        res.send(result.sort((a, b) => a.createdAt - b.createdAt))
    }


}
exports.getPatientConfByGroup = async(req, res, next) => {
    try {

        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            console.log('decoded', decoded)
            console.log('userRole', userRole)
            const { hospitalgroup } = req.params;
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)

            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                arrivaldate: "$arrivaldate",
                                ticket: "$ticket",
                                villetter: "$v",
                                approved: "$approved",
                                cabs: "$cabs",
                                flightName: "$flightName",
                                flightNo: "$flightNo",
                                contactPerson: "$contactPerson",
                                contactPerson: "$contactPerson",
                                coordinatorAddress: "$coordinatorAddress",
                                coordinatorTime: "$coordinatorTime",
                                remarks: "$remarks",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },


                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        approved: "$data.approved",


                    }
                },
            ]
            data = await Conf.aggregate(pipeline1)

            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                },
                country: { $in: userRole.country }

            }).populate({
                "path": "hospitalConfirmationAssign",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }
            })
            result = data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))
        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            dataPat = await Patient.find({
                "refferalpartner._id": partner._id.toString()
            }).populate('hospitalConfirmationAssign')

            res.send(dataPat)

        } else {

            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            console.log('decoded', decoded)
            console.log('userRole', userRole)
            const { hospitalgroup } = req.params;
            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalid: {
                            $push: {
                                $toString: "$_id",


                            }

                        }
                    }
                },

            ]
            doc = await Group.aggregate(pipeline)
            doc[0].hospitalid.push(hospitalgroup)

            pipeline1 = [{
                    $match: {
                        hospitalid: {
                            $in: doc[0].hospitalid
                        }
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                arrivaldate: "$arrivaldate",
                                ticket: "$ticket",
                                villetter: "$v",
                                approved: "$approved",
                                cabs: "$cabs",
                                flightName: "$flightName",
                                flightNo: "$flightNo",
                                contactPerson: "$contactPerson",
                                contactPerson: "$contactPerson",
                                coordinatorAddress: "$coordinatorAddress",
                                coordinatorTime: "$coordinatorTime",
                                remarks: "$remarks",
                                createdAt: "$createdAt"
                            }

                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },


                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        approved: "$data.approved",


                    }
                },
            ]
            data = await Conf.aggregate(pipeline1)

            dataPat = await Patient.find({
                "associatedhospital.hospitalid": {
                    $in: doc[0].hospitalid
                }
            }).populate('hospitalConfirmationAssign')
            result = data.concat(dataPat)
            res.send(result.sort((a, b) => a.createdAt - b.createdAt))


        }

    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientConf = async(req, res, next) => {
    try {

        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { hospitalid } = req.params;
            pipeline1 = [{
                    $match: {
                        patient: ObjectId(req.params.patientid)
                    },
                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$patient" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { country: 1 } }
                        ],

                        as: 'patientCheck',

                    }
                },
                {
                    $addFields: {
                        patientCheck: { $arrayElemAt: ["$patientCheck", 0] },

                    }
                },
                {
                    $match: {
                        $or: [{
                            "hospitalid": {
                                $in: userRole.hospitalVisiblity
                            },
                        }, {
                            "patientCheck.country": {
                                $in: userRole.country
                            },
                        }]
                    }

                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                arrivaldate: "$arrivaldate",
                                ticket: "$ticket",
                                villetter: "$v",
                                approved: "$approved",
                                cabs: "$cabs",
                                flightName: "$flightName",
                                flightNo: "$flightNo",
                                contactPerson: "$contactPerson",
                                contactPerson: "$contactPerson",
                                coordinatorAddress: "$coordinatorAddress",
                                coordinatorTime: "$coordinatorTime",
                                remarks: "$remarks",
                                createdAt: "$createdAt"
                            }
                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        approved: "$data.approved",

                    }
                },
            ]
            data = await Conf.aggregate(pipeline1)


            res.send(data[0])

        } else {
            const { hospitalid } = req.params;



            pipeline1 = [{
                    $match: {
                        patient: ObjectId(req.params.patientid)
                    },
                },
                {
                    $group: {
                        _id: "$patient",
                        data: {
                            $push: {
                                _id: "$_id",
                                hospitalname: "$hospitalname",
                                hospitalid: "$hospitalid",
                                arrivaldate: "$arrivaldate",
                                ticket: "$ticket",
                                villetter: "$v",
                                approved: "$approved",
                                cabs: "$cabs",
                                flightName: "$flightName",
                                flightNo: "$flightNo",
                                contactPerson: "$contactPerson",
                                contactPerson: "$contactPerson",
                                coordinatorAddress: "$coordinatorAddress",
                                coordinatorTime: "$coordinatorTime",
                                remarks: "$remarks",
                                createdAt: "$createdAt"
                            }
                        },

                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        "let": { "id": "$_id" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                        ],

                        as: 'patient',

                    }
                },

                {
                    "$project": {
                        _id: 1,
                        data: 1,
                        patient: { $arrayElemAt: ["$patient", 0] },

                    }
                },
                {
                    "$addFields": {

                        createdAt: "$patient.createdAt",
                        approved: "$data.approved",

                    }
                },
            ]
            data = await Conf.aggregate(pipeline1)


            res.send(data[0])
        }


    } catch (err) {
        next(err)
    }

}
exports.getSinglePatientConfByUnit = async(req, res, next) => {
    try {
        const { hospitalid } = req.params;

        console.log(req.params.patientid)
        console.log(hospitalid)

        pipeline1 = [{
                $match: {
                    hospitalid: hospitalid,
                    patient: ObjectId(req.params.patientid)

                },
            },
            {
                $group: {
                    _id: "$patient",
                    data: {
                        $push: {
                            _id: "$_id",
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            arrivaldate: "$arrivaldate",
                            ticket: "$ticket",
                            villetter: "$v",
                            approved: "$approved",
                            cabs: "$cabs",
                            flightName: "$flightName",
                            flightNo: "$flightNo",
                            contactPerson: "$contactPerson",
                            contactPerson: "$contactPerson",
                            coordinatorAddress: "$coordinatorAddress",
                            coordinatorTime: "$coordinatorTime",
                            remarks: "$remarks",
                            createdAt: "$createdAt"
                        }
                    },

                }

            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, companyNames: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1, user: 1, comment: 1 } }
                    ],

                    as: 'patient',

                }
            },

            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },

                }
            },
            {
                "$addFields": {

                    createdAt: "$patient.createdAt",
                    approved: "$data.approved",

                }
            },
        ]
        data = await Conf.aggregate(pipeline1)


        res.send(data[0])
    } catch (err) {
        next(err)
    }

}
exports.getPatientConfById = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Conf.findById(req.params.id, projectConf).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        .then(data => {

            if (data) {
                res.send(data);

            } else {

                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}


exports.putConfirmation = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var hospitalid = req.body.hospital

    var confirmation = {
        approved: true,

    };

    doc = await Conf.findByIdAndUpdate(req.params.id, { $set: confirmation })
    res.send({ message: "Success" })
    const patient = await PatientFac.findById(req.body.patientId)
    if (doc.aggregator == 'NIL') {
        userid = patient.user

    } else {
        userid = doc.aggregator

    }
    emailcc = await UserRoleFac.find({ "user": userid })
    companyFac = await CompanyFac.findOne({ "user": userid })
    const facilitator = await Facilitator.findOne({ "_id": userid })
    emailccsend = []
    emailcc.forEach(element => {
        if (element.Role == "Management")
            emailccsend.push(element.email)
    })
    emailccsend.push(facilitator.email)
    sendEmail.approvedPatient(doc, patient, emailccsend, companyFac, hospitalid, req, userid)



}


// hospital Performance

exports.hospitalPerformanceByGroup = async(req, res) => {
    const { hospitalgroup } = req.params;

    var pipeline = [{
            $match: {
                hospitalgroup: ObjectId(hospitalgroup),
            }
        },

        {
            $group: {
                _id: "$hospitalgroup",
                hospitalid: {
                    $push: {
                        $toString: "$_id",


                    }

                }
            }
        },

    ]
    doc = await Group.aggregate(pipeline)
    doc[0].hospitalid.push(hospitalgroup)
    var pipeline1 = [{
            "$redact": {
                "$cond": [{
                        "$in": [
                            "$hospitalid",
                            doc[0].hospitalid
                        ]
                    },
                    "$$KEEP",
                    "$$PRUNE"
                ]
            },
        },
        {
            $match: {

                "history.status": "SUBMITMAGNUS"
            }
        },
        {
            $project: {
                history: 1,
                hospitalname: 1,
                user: 1,
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },
        {
            $match: { "responsetime": { $gt: 0 } }
        },
        {
            $group: {
                _id: "$hospitalname",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },

    ]
    doc1 = await Request.aggregate(pipeline1)
    res.send(doc1)

}

exports.hospitalPerformanceByUnit = async(req, res) => {
    const { hospitalid } = req.params;

    var pipeline1 = [{
            $match: {
                hospitalid: hospitalid,
                "history.status": "SUBMITMAGNUS"
            }
        },
        {
            $project: {
                history: 1,
                hospitalname: 1,
                user: 1,
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },
        {
            $match: { "responsetime": { $gt: 0 } }
        },
        {
            $group: {
                _id: "$hospitalname",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },

    ]
    doc1 = await Request.aggregate(pipeline1)
    res.send(doc1)

}
exports.hospitalPerformanceByPatientGroup = async(req, res) => {

    const { hospitalgroup } = req.params;

    var pipeline = [{
            $match: {
                hospitalgroup: ObjectId(hospitalgroup),
            }
        },

        {
            $group: {
                _id: "$hospitalgroup",
                hospitalid: {
                    $push: {
                        $toString: "$_id",


                    }

                }
            }
        },

    ]
    doc = await Group.aggregate(pipeline)
    doc[0].hospitalid.push(hospitalgroup)
        // res.send(doc)
    var pipeline1 = [{
            "$redact": {
                "$cond": [{
                        "$in": [
                            "$hospitalid",
                            doc[0].hospitalid
                        ]
                    },
                    "$$KEEP",
                    "$$PRUNE"
                ]
            },
        },
        {
            $match: {
                "history.status": "SUBMITMAGNUS"
            }
        },

        {
            $project: {
                history: 1,
                hospitalname: 1,
                patient: "$patient",
                user: 1,
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },

        {
            $match: { "responsetime": { $gt: 0 } }
        },
        {
            $group: {
                _id: "$patient",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },
        {
            $lookup: {
                from: 'patient',
                localField: '_id',
                foreignField: '_id',
                as: 'patientdata'
            }
        },
        {
            $project: {
                opinion: 1,
                avgtime: 1,
                "patientdata.name": 1,

            }
        },

    ]
    doc1 = await Request.aggregate(pipeline1)
    res.send(doc1)
}

exports.hospitalPerformanceByPatientUnit = async(req, res) => {

    const { hospitalid } = req.params;


    var pipeline1 = [{
            $match: {
                hospitalid: hospitalid,
                "history.status": "SUBMITMAGNUS"
            }
        },

        {
            $project: {
                history: 1,
                hospitalname: 1,
                patient: "$patient",
                user: 1,
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },

        {
            $match: { "responsetime": { $gt: 0 } }
        },
        {
            $group: {
                _id: "$patient",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },
        {
            $lookup: {
                from: 'patient',
                localField: '_id',
                foreignField: '_id',
                as: 'patientdata'
            }
        },
        {
            $project: {
                opinion: 1,
                avgtime: 1,
                "patientdata.name": 1,

            }
        },

    ]
    doc1 = await Request.aggregate(pipeline1)
    res.send(doc1)
}

exports.getOpinionRequestByHospital = (req, res) => {
    var hospitalname = req.params.hospitalname;
    zoneQuery = { "hospitalname": hospitalname };
    Request.find(zoneQuery, projectOpinion).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}

exports.getOpinionRequestByPatientid = (req, res) => {
    var patientid = req.params.patientid;
    console.log(patientid)
    zoneQuery = { "patient": patientid };
    Request.find(zoneQuery).populate('patient', 'name gender mhid companyname treatment uhidcode age ageduration patientProfile medicalhistory country')
        .then(data => {

            if (data) {
                console.log(data)
                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}



exports.ownHospitalPerformanceByGroup = async(req, res) => {
    const { hospitalgroup } = req.params;

    var pipeline = [{
            $match: {
                hospitalgroup: ObjectId(hospitalgroup),
            }
        },

        {
            $group: {
                _id: "$hospitalgroup",
                hospitalid: {
                    $push: {
                        $toString: "$_id",


                    }

                }
            }
        },

    ]
    doc = await Group.aggregate(pipeline)
    doc[0].hospitalid.push(hospitalgroup)
    var pipeline1 = [{
            "$redact": {
                "$cond": [{
                        "$in": [
                            "$hospitalId",
                            doc[0].hospitalid
                        ]
                    },
                    "$$KEEP",
                    "$$PRUNE"
                ]
            },
        },
        {
            $match: {

                "history.status": "SUBMIT"
            }
        },
        {
            $project: {
                history: 1,
                hospitalName: 1,
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },
        {
            $match: { "responsetime": { $gt: 0 } }
        },

        {
            $group: {
                _id: "$hospitalName",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },

    ]
    doc1 = await QueryAssign.aggregate(pipeline1)
    res.send(doc1)

}

exports.ownHospitalPerformanceByUnit = async(req, res) => {
    const { hospitalid } = req.params;

    var pipeline1 = [{

            $match: {
                hospitalId: hospitalid,
                "history.status": "SUBMIT"
            }
        },

        {
            $project: {
                history: 1,
                hospitalName: 1,
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },
        {
            $match: { "responsetime": { $gt: 0 } }
        },

        {
            $group: {
                _id: "$hospitalName",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },

    ]
    doc1 = await QueryAssign.aggregate(pipeline1)
    res.send(doc1)
}

exports.ownHospitalPerformanceByPatientGroup = async(req, res) => {

    const { hospitalgroup } = req.params;

    var pipeline = [{
            $match: {
                hospitalgroup: ObjectId(hospitalgroup),
            }
        },

        {
            $group: {
                _id: "$hospitalgroup",
                hospitalid: {
                    $push: {
                        $toString: "$_id",


                    }

                }
            }
        },

    ]
    doc = await Group.aggregate(pipeline)
    doc[0].hospitalid.push(hospitalgroup)
        // res.send(doc)
    var pipeline1 = [{
            "$redact": {
                "$cond": [{
                        "$in": [
                            "$hospitalId",
                            doc[0].hospitalid
                        ]
                    },
                    "$$KEEP",
                    "$$PRUNE"
                ]
            },
        },
        {
            $match: {
                "history.status": "SUBMIT"
            }
        },

        {
            $project: {
                history: 1,
                hospitalName: 1,
                patient: "$patient",
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },

        {
            $match: { "responsetime": { $gt: 0 } }
        },
        {
            $group: {
                _id: "$patient",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },
        {
            $lookup: {
                from: 'hospitalpatient',
                localField: '_id',
                foreignField: '_id',
                as: 'patientdata'
            }
        },
        {
            $project: {
                opinion: 1,
                avgtime: 1,
                "patientdata.name": 1,

            }
        },

    ]
    doc1 = await QueryAssign.aggregate(pipeline1)
    res.send(doc1)
}
exports.ownHospitalPerformanceByPatientUnit = async(req, res) => {

    const { hospitalid } = req.params;

    // res.send(doc)
    var pipeline1 = [{
            $match: {
                "hospitalId": hospitalid,
                "history.status": "SUBMIT"
            }
        },

        {
            $project: {
                history: 1,
                hospitalName: 1,
                patient: "$patient",
                lastDate: {
                    first: { $arrayElemAt: ["$history", -1] },
                },
                fistDate: {
                    first: { $arrayElemAt: ["$history", 0] },
                },

                responsetime: {
                    $let: {
                        vars: {
                            first: { $arrayElemAt: ["$history", 0] },
                            last: { $arrayElemAt: ["$history", -1] }
                        },
                        in: {
                            $ceil: { $divide: [{ $subtract: ["$$last.date", "$$first.date"] }, 3600000] }

                        }
                    }
                }
            }
        },

        {
            $match: { "responsetime": { $gt: 0 } }
        },
        {
            $group: {
                _id: "$patient",
                opinion: {
                    $sum: 1
                },
                avgtime: { $avg: "$responsetime" }

            }
        },
        {
            $lookup: {
                from: 'hospitalpatient',
                localField: '_id',
                foreignField: '_id',
                as: 'patientdata'
            }
        },
        {
            $project: {
                opinion: 1,
                avgtime: 1,
                "patientdata.name": 1,

            }
        },

    ]
    doc1 = await QueryAssign.aggregate(pipeline1)
    res.send(doc1)
}
exports.getOwnOpinionRequestByHospital = (req, res) => {
    var hospitalname = req.params.hospitalname;
    zoneQuery = { "hospitalName": hospitalname };
    QueryAssign.find(zoneQuery).populate('patient')
        .then(data => {

            if (data) {

                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}

exports.getOwnOpinionRequestByPatientid = (req, res) => {
    var patientid = req.params.patientid;
    console.log(patientid)
    zoneQuery = { "patient": patientid };
    QueryAssign.find(zoneQuery).populate('patient')
        .then(data => {

            if (data) {
                console.log(data)
                res.send(data);

            } else {
                return res.status(400).send({ message: 'Data not found' });
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });
        });
}

// Hospital Plan Route

exports.plan = async(req, res, next) => {
    try {
        async function validate(user) {
            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                    patient = await Patient.find({
                        date: {
                            $gte: subscription.data.subscription.last_billing_at,
                            $lt: subscription.data.subscription.next_billing_at
                        },
                        "associatedhospital.id": user._id.toString()
                    })
                    customFields = plan.data.plan.custom_fields
                    let date = new Date(subscription.data.subscription.next_billing_at);
                    let currentDate = new Date();
                    daysleft = Math.ceil((date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24);
                    console.log('daysleft', daysleft)
                    if (daysleft > 0) {
                        if (patient.length < Number(customFields[0].value)) {
                            return next()

                        } else {
                            return res.status(400).send({ message: 'Limit Exceeded' })
                        }

                    } else {
                        return res.status(400).send({ message: 'Renew your plan' })

                    }

                } else {
                    return res.status(400).send({ message: 'Please take subscription' })
                }
            } else {
                return next()


            }
        }

        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        user = await Hospital.findOne({ _id: decoded.id })
        return validate(user)
    } catch (err) {
        next(err)
    }
}
exports.getPatientByLimit = async(req, res, next) => {
    try {
        var id = req.params.id;
        user = await Hospital.findOne({ _id: id })

        if (user.subscription_id) {
            const tokenData = await Zoho.find({})
            const token = tokenData[tokenData.length - 1].data.access_token
            const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
            const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
            patient = await Patient.find({
                date: {
                    $gte: subscription.data.subscription.last_billing_at,
                    $lt: subscription.data.subscription.next_billing_at
                },
                "associatedhospital.id": user._id.toString()
            })
            res.send({
                patient: patient,
                subscription: subscription.data.subscription,
                plan: plan.data.plan
            });

        } else {
            return res.status(400).send({ message: 'Please take subscription' })

        }


    } catch (err) {
        next(err)
    }

}