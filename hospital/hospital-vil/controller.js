const VilAssign = require('./vil.model')
const Send = require('./send.model')
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
var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
const HospitalPartner = require('../hospital-refferalpartner/refferal.model')

// Add Vil
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
const HospitalUserRole = require('../hospital-auth/userole.model')
const jwt_decode = require('jwt-decode');
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {

        cb(null, 'images')
    } else if (file.mimetype === 'application/pdf') {
        cb(null, 'files')
    } else {
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
module.exports.uploads = (upload.array('passports')), (request, response, next) => {
    next();
}

exports.postAssignVil = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        qry = JSON.parse(req.body.vilData)
        qry.forEach(async element => {
            // console.log("Save ")

            const vilassign = new VilAssign();
            vilassign.hospitalName = element.hospitalName
            vilassign.hospitalId = element.hospitalId
            vilassign.hospitalEmail = element.hospitalEmail
            vilassign.linkStatus = element.linkStatus;

            vilassign.dateOfAppointment = element.dateOfAppointment
            vilassign.embassyAddress = element.embassyAddress

            vilassign.doctorName = element.doctorName
            vilassign.embassy = element.embassy
            vilassign.patientName = element.patientName
            vilassign.passportNumber = element.passportNumber
            if (req.files !== undefined) {
                for (let i = 0; i < req.files.length; i++) {
                    vilassign.passports[i] = req.files[i];
                }
            }
            qry1 = element.attendant
            for (let i = 0; i < qry1.length; i++) {
                vilassign.attendant.push(qry1[i])
            }

            qry2 = element.donor

            for (let i = 0; i < qry2.length; i++) {
                vilassign.donor.push(qry2[i])

            }
            if (vilassign.hospitalEmail != 'NIL') {
                qry1 = vilassign.hospitalEmail.vilTo
                const emailsto = []
                qry1.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry2 = vilassign.hospitalEmail.vilCc
                const emailscc = []
                qry2.forEach(async element => {
                    emailscc.push(element.emailId)
                })

                if (vilassign.hospitalEmail.doctorsTo != undefined) {
                    qry3 = vilassign.hospitalEmail.doctorsTo
                    qry3.forEach(async element => {
                        emailsto.push(element.emailId)
                    })
                    qry4 = vilassign.hospitalEmail.doctorsCc
                    qry4.forEach(async element => {
                        emailscc.push(element.emailId)
                    })
                }
            }
            const patient = await Patient.findById(patientid)

            if (element.role == "Group") {
                patient.hospital.push(element.hospitalId)
            }
            vilassign.patient = patient._id
            await vilassign.save()


            patient.hospitalVilAssigns.push(vilassign)
            await patient.save()
            vilassign.company = element.groupName
            vilassign.country = patient.country

            sendEmail.assignHospitalVil(patient, vilassign, emailsto, emailscc, element.hospital, element.groupName, req)


        });
        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }
}
exports.getAssignVil = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalVilAssigns",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalVilAssigns)
        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalVilAssigns",
                match: {
                    "hospitalId": {
                        $in: partner.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalVilAssigns)
        } else {
            const { patientid } = req.params;

            const patient = await Patient.findById(patientid).populate('hospitalVilAssigns')
            res.send(patient.hospitalVilAssigns)
        }

    } catch (err) {
        next(err);
    }

}
exports.getAssignVilByPatientHospital = async(req, res) => {


    VilAssign.findOne({ "patient": req.params.patientid, "hospitalId": req.params.hospitalid })
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

exports.sendVilToFac = async(req, res, next) => {
    try {
        console.log(req.body)

        var hospitalid = req.body.hospital

        const { patientid } = req.params;

        const send = new Send();
        send.hospitalName = req.body.hospitalName
        send.hospitalId = req.body.hospitalId


        const patient = await Patient.findById(patientid)
        send.patient = patient._id
        await send.save()

        patient.hospitalVilSent.push(send)
        await patient.save()
        embassy = []
        embassyAddress = req.body.embassyAddress
        embassyCms = req.body.embassy
        if (req.body.embassy == undefined) {
            embassyAddress.forEach(element => {
                embassy.push(element.address)
            });
            send.embassy = embassy
            console.log('own', send.embassy)

        } else {
            embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassy = embassy.filter(function(element) {
                return element !== undefined && element !== '';
            });
            send.embassy = embassy
            console.log('cms', send.embassy)
        }


        send.patientName = req.body.patientName
        send.passportNumber = req.body.passportNumber
        send.patientCountry = req.body.patientCountry
        send.attendant = req.body.attendant
        send.donor = req.body.donor
        send.doctorName = req.body.doctorName
        send.date = req.body.date

        send.dateOfAppointment = moment(req.body.dateOfAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
        send.attendant.map((obj, i) => {

            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (send.attendant.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })

        send.donor.map((obj, i) => {
            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (send.donor.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })

        send.hospitalLogo = hospital.logosize1
        send.address = hospital.address
        send.companyEmail = hospital.companyemail
        send.hospitalUsername = hospitalUsername.name['name']
        send.hospitalUserDesignation = hospitalProfile.designation
        send.hospitalUserSignature = hospitalProfile.documentSignature['key']
        ccSend = []
            // emailcc = req.body.emailCc
            // emailcc.forEach(element => {
            //     ccSend.push(element.emailcc)
            // });
        if (send.dateOfAppointment !== 'Invalid date') {
            send.checkAppointment = [send.dateOfAppointment]
        } else {
            send.checkAppointment = []

        }
        if (patient.refferalpartner != "NAN") {
            if (patient.refferalpartner.type == "prefilled Partner") {
                send.emailTo = patient.refferalpartner.emailid
                const companyfac = await CompanyFac.findOne({ "user": patient.refferalpartner._id })
                send.companyName = companyfac.name
                sendEmail.sendHospitalVilToFac(send, hospitalid, patient, ccSend, req)
            } else {
                send.emailTo = patient.emailid
                sendEmail.sendHospitalVilToPatient(send, hospitalid, patient, ccSend, req)
            }
        } else {
            send.emailTo = patient.emailid
            sendEmail.sendHospitalVilToPatient(send, hospitalid, patient, ccSend, req)

        }
        res.send({ messahe: "Success" })
    } catch (err) {
        next(err);
    }
}
exports.sendVilToMail = async(req, res, next) => {
    try {
        console.log(req.body)

        var hospitalid = req.body.hospital

        const { patientid } = req.params;

        const send = new Send();
        send.hospitalName = req.body.hospitalName
        send.hospitalId = req.body.hospitalId


        const patient = await Patient.findById(patientid)
        send.patient = patient._id

        patient.hospitalVilSent.push(send)
        embassy = []
        embassyAddress = req.body.embassyAddress
        embassyCms = req.body.embassy
        if (req.body.embassy == undefined) {
            embassyAddress.forEach(element => {
                embassy.push(element.address)
            });
            send.embassy = embassy
            console.log('own', send.embassy)

        } else {
            embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassy = embassy.filter(function(element) {
                return element !== undefined && element !== '';
            });
            send.embassy = embassy
            console.log('cms', send.embassy)
        }


        send.patientName = req.body.patientName
        send.passportNumber = req.body.passportNumber
        send.patientCountry = req.body.patientCountry
        send.attendant = req.body.attendant
        send.donor = req.body.donor
        send.doctorName = req.body.doctorName
        send.date = req.body.date

        send.dateOfAppointment = moment(req.body.dateOfAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
        send.attendant.map((obj, i) => {

            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (send.attendant.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })

        send.donor.map((obj, i) => {
            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (send.donor.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })

        send.hospitalLogo = hospital.logosize1
        send.address = hospital.address
        send.companyEmail = hospital.companyemail
        send.hospitalUsername = hospitalUsername.name['name']
        send.hospitalUserDesignation = hospitalProfile.designation
        send.hospitalUserSignature = hospitalProfile.documentSignature['key']
        ccSend = []
            // emailcc = req.body.emailCc
            // emailcc.forEach(element => {
            //     ccSend.push(element.emailcc)
            // });
        if (send.dateOfAppointment !== 'Invalid date') {
            send.checkAppointment = [send.dateOfAppointment]
        } else {
            send.checkAppointment = []

        }

        send.emailTo = patient.emailid
        sendEmail.sendHospitalVilToMail(send, hospitalid, patient, ccSend, req.body.email, req)


        res.send({ messahe: "Success" })
    } catch (err) {
        next(err);
    }
}
exports.sendVilToEmb = async(req, res, next) => {
    try {
        console.log(req.body)

        var hospitalid = req.body.hospital

        const { patientid } = req.params;

        const send = new Send();
        send.hospitalName = req.body.hospitalName
        send.hospitalId = req.body.hospitalId


        const patient = await Patient.findById(patientid)
        send.patient = patient._id
        await send.save()

        patient.hospitalVilSent.push(send)
        await patient.save()
        embassy = []
        embassyAddress = req.body.embassyAddress
        embassyCms = req.body.embassy
        if (req.body.embassy == undefined) {
            embassyAddress.forEach(element => {
                embassy.push(element.address)
            });
            send.embassy = embassy
            console.log('own', send.embassy)

        } else {
            embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassy = embassy.filter(function(element) {
                return element !== undefined && element !== '';
            });
            send.embassy = embassy
            console.log('cms', send.embassy)
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

        send.patientName = req.body.patientName
        send.passportNumber = req.body.passportNumber
        send.patientCountry = req.body.patientCountry
        send.attendant = req.body.attendant
        send.donor = req.body.donor
        send.doctorName = req.body.doctorName
        send.date = req.body.date

        send.dateOfAppointment = moment(req.body.dateOfAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
        send.attendant.map((obj, i) => {

            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (send.attendant.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })

        send.donor.map((obj, i) => {
            if (i == 0) {
                obj['first'] = true
                obj['last'] = true

            } else if (send.donor.length - 1 === i) {
                obj['last'] = false
                obj['first'] = true

            } else {
                obj['last'] = true
                obj['first'] = false

            }
            return obj
        })
        const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
        const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })

        send.hospitalLogo = hospital.logosize1
        send.address = hospital.address
        send.companyEmail = hospital.companyemail
        send.hospitalUsername = hospitalUsername.name['name']
        send.hospitalUserDesignation = hospitalProfile.designation
        send.hospitalUserSignature = hospitalProfile.documentSignature['key']
        ccSend = []
            // emailcc = req.body.emailCc
            // emailcc.forEach(element => {
            //     ccSend.push(element.emailcc)
            // });
        if (send.dateOfAppointment !== 'Invalid date') {
            send.checkAppointment = [send.dateOfAppointment]
        } else {
            send.checkAppointment = []

        }
        sendEmail.sendHospitalVilToEmbassy(send, hospitalid, patient, embassyEmailTo, embassyEmailCc, req)

        res.send({ messahe: "Success" })
    } catch (err) {
        next(err);
    }
}

exports.downloadVil = async(req, res, next) => {
        try {
            console.log(req.body)

            var hospitalid = req.body.hospital

            const { patientid } = req.params;

            const send = new Send();
            send.hospitalName = req.body.hospitalName
            send.hospitalId = req.body.hospitalId


            const patient = await Patient.findById(patientid)
            send.patient = patient._id
            await send.save()

            patient.hospitalVilSent.push(send)
            await patient.save()
            embassy = []
            embassyAddress = req.body.embassyAddress
            embassyCms = req.body.embassy
            if (req.body.embassy == undefined) {
                embassyAddress.forEach(element => {
                    embassy.push(element.address)
                });
                send.embassy = embassy
                console.log('own', send.embassy)

            } else {
                embassy.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
                embassy = embassy.filter(function(element) {
                    return element !== undefined && element !== '';
                });
                send.embassy = embassy
                console.log('cms', send.embassy)
            }


            send.patientName = req.body.patientName
            send.passportNumber = req.body.passportNumber
            send.patientCountry = req.body.patientCountry
            send.attendant = req.body.attendant
            send.donor = req.body.donor
            send.doctorName = req.body.doctorName
            send.date = req.body.date

            send.dateOfAppointment = moment(req.body.dateOfAppointment).tz("Asia/Kolkata").format('DD-MM-YYYY');
            send.attendant.map((obj, i) => {

                if (i == 0) {
                    obj['first'] = true
                    obj['last'] = true

                } else if (send.attendant.length - 1 === i) {
                    obj['last'] = false
                    obj['first'] = true

                } else {
                    obj['last'] = true
                    obj['first'] = false

                }
                return obj
            })

            send.donor.map((obj, i) => {
                if (i == 0) {
                    obj['first'] = true
                    obj['last'] = true

                } else if (send.donor.length - 1 === i) {
                    obj['last'] = false
                    obj['first'] = true

                } else {
                    obj['last'] = true
                    obj['first'] = false

                }
                return obj
            })
            const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
            const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
            const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })

            send.hospitalLogo = hospital.logosize1
            send.address = hospital.address
            send.companyEmail = hospital.companyemail
            send.hospitalUsername = hospitalUsername.name['name']
            send.hospitalUserDesignation = hospitalProfile.designation
            send.hospitalUserSignature = hospitalProfile.documentSignature['key']
                // emailcc = req.body.emailCc
                // emailcc.forEach(element => {
                //     ccSend.push(element.emailcc)
                // });
            sendEmail.downloadHospitalVil(send, res, req)

        } catch (err) {
            next(err);
        }
    }
    // assignPatientVil