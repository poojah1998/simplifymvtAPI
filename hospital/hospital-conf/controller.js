const ConfAssign = require('./conf.model')

const Group = require('../hospital-groups/group.model')
const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
var express = require('express')
const Patient = require('../hospital-patients/patient.model')
const CompanyFac = require('../../app/company-details/company.model')
const HospitalDetails = require('../hospital-details/details.model')
const HospitalProfile = require('../hospital-profile/profile.model')
const HospitalBank = require('../hospital-details/bank.model')
const sendEmail = require('../sendmail/sendmail')
const removeMd = require('remove-markdown');
const Doctorcms = require('../../app/patient/cms.doctor.model')
const Doctorimg = require('../../app/patient/cms.doctorimg.model')
var moment = require('moment-timezone');
var multer = require('multer')
var multerS3 = require('multer-s3')
var aws = require('aws-sdk')
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
const HospitalPartner = require('../hospital-refferalpartner/refferal.model')

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
const HospitalUserRole = require('../hospital-auth/userole.model')
const jwt_decode = require('jwt-decode');
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


// assignPatientConf
module.exports.uploadTicket = (upload.single('ticket')), (request, response, next) => {
    next();
}
exports.postAssignConf = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        qry = JSON.parse(req.body.obj)
        var coordinatorTime

        // console.log("Save ")
        const confassign = new ConfAssign();
        confassign.hospitalName = qry.hospitalName
        confassign.hospitalId = qry.hospitalId
        confassign.hospitalEmail = qry.hospitalEmail
        confassign.linkStatus = qry.linkStatus;
        confassign.arrivalDate = qry.arrivalDate
        if (req.file !== undefined) {
            confassign.ticket = req.file;
        }

        if (qry.cabs == '') {
            confassign.cabs = "NIL"

        } else {
            confassign.cabs = qry.cabs

        }
        if (qry.flightName == '') {
            confassign.flightName = "NIL"

        } else {
            confassign.flightName = qry.flightName

        }
        if (qry.flightNo == '') {
            confassign.flightNo = "NIL"

        } else {
            confassign.flightNo = qry.flightNo

        }
        if (qry.contactPerson == '') {
            confassign.contactPerson = "NIL"

        } else {
            confassign.contactPerson = qry.contactPerson

        }
        if (qry.contactPersonNo == '') {
            confassign.contactPersonNo = "NIL"

        } else {
            confassign.contactPersonNo = qry.contactPersonNo

        }
        if (qry.coordinatorAddress == '') {
            confassign.coordinatorAddress = "NIL"

        } else {
            confassign.coordinatorAddress = qry.coordinatorAddress

        }
        if (qry.coordinatorTime == '') {
            confassign.coordinatorTime = "NIL"
            coordinatorTime = "NIL"

        } else {
            confassign.coordinatorTime = qry.coordinatorTime
            coordinatorTime = moment(qry.coordinatorTime).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        }
        qry1 = confassign.hospitalEmail.confirmationTo
        const emailsto = []
        qry1.forEach(async element => {
            emailsto.push(element.emailId)
        })
        qry2 = confassign.hospitalEmail.confirmationCc
        const emailscc = []
        qry2.forEach(async element => {
            emailscc.push(element.emailId)
        })

        if (confassign.hospitalEmail.doctorsTo != undefined) {
            qry3 = confassign.hospitalEmail.doctorsTo
            qry3.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry4 = confassign.hospitalEmail.doctorsCc
            qry4.forEach(async element => {
                emailscc.push(element.emailId)
            })
        }

        const patient = await Patient.findById(patientid)
        if (qry.role == "Group") {
            console.log('executed')
            patient.hospital.push(qry.hospitalId)
        }
        confassign.patient = patient._id
        await confassign.save()


        patient.hospitalConfirmationAssign.push(confassign)
        await patient.save()
        arrivaldate = moment(qry.arrivaldate).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        sendEmail.assignHospitalConfirmation(patient, confassign, emailsto, emailscc, qry.hospital, qry.groupName, arrivaldate, coordinatorTime, req)


        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }
}
exports.getAssignConf = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);

        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalConfirmationAssign",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalConfirmationAssign)
        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalConfirmationAssign",
                match: {
                    "hospitalId": {
                        $in: partner.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalConfirmationAssign)
        } else {
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate('hospitalConfirmationAssign')
            res.send(patient.hospitalConfirmationAssign)
        }

    } catch (err) {
        next(err);
    }

}
exports.getAssignConfByPatientHospital = async(req, res) => {



    ConfAssign.findOne({ "patient": req.params.patientid, "hospitalId": req.params.hospitalid })
        .then(data => {
            // console.log('2sss34', data)
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
exports.PutAssignConfStatus = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var updateData = {
        linkStatus: 'submit',

    };
    ConfAssign.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}