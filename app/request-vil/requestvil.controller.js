const Requestvil = require('./requestvil.model')
const Responsevil = require('./responsevil.model')
const Sentvil = require('./sentvil.model')
const Company = require('../company-details/company.model')
const mongoose = require('mongoose');
const Patient = require('../patient/patient.model')
const { ObjectId } = require('mongodb');
const { diskStorage } = require('multer');
var sendemail = require('../send-email/sendemail');
const Facilitator = require('../facilitator-register/facilitator.model')
var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const Emailcc = require('../send-email/emailcc.model')
const Status = require('../patient/patient.status')
var moment = require('moment-timezone');
const jwt_decode = require('jwt-decode');

const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
const hospitalCms = require('../patient/cms.hospital.model')


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
exports.postRequestvil = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const { patientid } = req.params;
        qry = JSON.parse(req.body.opinionData)
            // console.log(qry)
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        qry.forEach(async element => {
            const requestvil = new Requestvil();
            requestvil.hospitalname = element.hospitalname
            requestvil.hospitalid = element.hospitalid
            requestvil.dateofAppointment = element.dateofAppointment
            requestvil.embassyAddress = element.embassyAddress
            const patient = await Patient.findById(patientid)

            if (element.aggregator) {
                requestvil.aggregator = element.aggregator
                const company = await Company.findOne({ "user": element.aggregator });

                if (patient.companyNames.length) {
                    patient.companyNames.forEach(element => {
                        if (element != company.name) {
                            patient.companyNames.push(company.name)

                        }
                    });
                } else {
                    patient.companyNames.push(company.name)

                }
            } else {
                requestvil.aggregator = 'NIL'
            }
            requestvil.doctorname = element.doctorname
            requestvil.embassy = element.embassy
            requestvil.hospitalemail = element.hospitalemail
            requestvil.patientname = element.patientname
            requestvil.passportnumber = element.passportnumber
            requestvil.query = element.query
            if (req.files !== undefined) {
                for (let i = 0; i < req.files.length; i++) {
                    requestvil.passports[i] = req.files[i];
                }
            }
            qry1 = element.attendant
            for (let i = 0; i < qry1.length; i++) {
                requestvil.attendant.push(qry1[i])
            }

            qry7 = element.donor

            for (let i = 0; i < qry7.length; i++) {
                requestvil.donor.push(qry7[i])

            }
            qry8 = requestvil.donor

            qry3 = requestvil.hospitalemail.vilTo
            const emailsto = []
            qry3.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry4 = requestvil.hospitalemail.vilCc
            const emailscc = []
            qry4.forEach(async element => {
                emailscc.push(element.emailId)
            })
            if (requestvil.hospitalemail.doctorsTo != undefined) {

                qry5 = requestvil.hospitalemail.doctorsTo
                qry5.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry6 = requestvil.hospitalemail.doctorsCc
                qry6.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }
            const user = await Facilitator.findById(userid)
            requestvil.user = user._id
            await requestvil.save()

            requestvil.patient = patient._id
            await requestvil.save()

            var useridd = patient.user
            const company = await Company.find({ "user": useridd })
            user.requestvils.push(requestvil)
            await user.save()
            patient.requestvils.push(requestvil)
            patient.currentstatus = Status.requestvil
            if (element.aggregator) {
                patient.aggregator.push(element.aggregator)
            }
            patient.name = requestvil.patientname
            await patient.save()
            requestvil.company = company[0].name
            requestvil.country = patient.country
            requestvil.medicalhistory = patient.medicalhistory
            requestvil.patientProfile = patient.patientProfile
            const emailccsend = await Emailcc.find({ "user": userid });
            let emailccconcat = [];
            emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
            if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
                emailccconcat.push(decoded.email)
            }
            console.log('emailccconcat', emailccconcat)
            if (element.dateofAppointment == "") {
                requestvil.dateofAppointment = "NIL"
            } else {
                requestvil.dateofAppointment = moment(element.dateofAppointment).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

            }
            console.log('requestvil.embassy', requestvil.embassy)
            if (!element.embassy) {
                requestvil.embassyName = "NIL"
            } else {
                requestvil.embassyName = requestvil.embassy.name

            }
            embassyAdd = []
            embassyAddress = element.embassyAddress
            embassyCms = requestvil.embassy
            if (!element.embassy) {
                embassyAddress.forEach(element => {
                    embassyAdd.push(element.address)
                });

            } else {
                embassyAdd.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
                embassyAdd = embassyAdd.filter(function(element) {
                    return element !== undefined && element !== '';
                });
            }
            if (!embassyAdd.length) {
                embassyAdd.push('NIL')
            }
            requestvil.embassyAdd = embassyAdd


            if (element.query == 'vilrequest') {
                sendemail.requestvil(requestvil, patient, emailsto, emailccconcat, req)
            } else if (element.query == 'vildirectrequest') {
                if (element.aggregator) {
                    const emailccSendAgg = await Emailcc.find({ "user": element.aggregator });
                    console.log(emailccSendAgg)
                    emailccconcat.push(`${emailccSendAgg[0].email}`);
                    console.log(emailccconcat)
                    sendemail.requestdirectvilAggegator(requestvil, patient, emailsto, emailccconcat, req, element.aggregator)

                } else {
                    sendemail.requestdirectvil(requestvil, patient, emailsto, emailccconcat, req)

                }
            }
            if (element.hospitalid == '5dc946c5f9c3ea4af945edac' || element.hospitalid == '5ce640c366261379f15e8452' || element.hospitalid == '5f69def75272e96c51dfe971') {
                const hospitalDataSms = await hospitalCms.findOne({ _id: element.hospitalid })
                const companySms = await Company.findOne({ "user": userid });
                hospitalData = JSON.parse(JSON.stringify(hospitalDataSms))
                console.log('hospitalData', hospitalData.phone_number)
                var params = {
                    Message: `${hospitalData.hospital_code} ${patient.name}, Referred by ${user.name}/${companySms.name}, For ${patient.treatment}, From ${patient.country}`,
                    PhoneNumber: `${hospitalData.phone_number}`
                };
                var paramsAdmin = {
                    Message: `${hospitalData.hospital_code} ${patient.name}, Referred by ${user.name}/${companySms.name}, For ${patient.treatment}, From ${patient.country}`,
                    PhoneNumber: `${process.env.smsAdminNo}`
                };
                var AWS = require('aws-sdk');
                // Set region
                AWS.config.update({
                    accessKeyId: process.env.smsAccessKey,
                    secretAccessKey: process.env.smsSecretAccessKey,
                    region: process.env.smsRegion
                });
                var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
                var publishTextPromiseAdmin = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(paramsAdmin).promise();

                const message = await publishTextPromise
                const messageAdmin = await publishTextPromiseAdmin

            }

        });
        res.status(201).send({ message: 'success' })



    } catch (err) {
        next(err);
    }
}
exports.postVilRequestResend = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const { patientid } = req.params;
        qry = req.body.item
        const requestvil = new Requestvil(req.body.item);
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);

        qry3 = requestvil.hospitalemail.vilTo
        const emailsto = []
        qry3.forEach(async element => {
            emailsto.push(element.emailId)
        })
        qry4 = requestvil.hospitalemail.vilCc
        const emailscc = []
        qry4.forEach(async element => {
            emailscc.push(element.emailId)
        })
        if (requestvil.hospitalemail.doctorsTo != undefined) {

            qry5 = requestvil.hospitalemail.doctorsTo
            qry5.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry6 = requestvil.hospitalemail.doctorsCc
            qry6.forEach(async element => {
                emailscc.push(element.emailId)
            })
        }
        const user = await Facilitator.findById(userid)
        const patient = await Patient.findById(patientid)

        var useridd = patient.user
        const company = await Company.find({ "user": useridd })
        requestvil.company = company[0].name
        requestvil.remarks = req.body.remarks
        requestvil.country = patient.country
        requestvil.medicalhistory = patient.medicalhistory
        requestvil.patientProfile = patient.patientProfile
        if (requestvil.dateofAppointment == "") {
            requestvil.dateofAppointment = "NIL"
        } else {
            requestvil.dateofAppointment = moment(requestvil.dateofAppointment).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        }
        if (!requestvil.embassy) {
            requestvil.embassyName = "NIL"
        } else {
            requestvil.embassyName = requestvil.embassy.name

        }
        const emailccsend = await Emailcc.find({ "user": userid });
        emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
        if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
            emailccconcat.push(decoded.email)
        }
        console.log('emailccconcat', emailccconcat)
        embassyAdd = []
        embassyAddress = qry.embassyAddress
        embassyCms = qry.embassy
        if (!qry.embassy) {
            embassyAddress.forEach(element => {
                embassyAdd.push(element.address)
            });

        } else {
            embassyAdd.push(embassyCms.addressLetterTo1, embassyCms.addressLetterTo2, embassyCms.addressLine1, embassyCms.addressLine2, embassyCms.addressLine3)
            embassyAdd = embassyAdd.filter(function(element) {
                return element !== undefined && element !== '';
            });
        }
        if (!embassyAdd.length) {
            embassyAdd.push('NIL')
        }
        requestvil.embassyAdd = embassyAdd
        if (qry.query == 'vilrequest') {
            sendemail.requestvilresend(requestvil, patient, emailsto, emailccconcat, req)
        } else if (qry.query == 'vildirectrequest') {
            sendemail.requestdirectvilresend(requestvil, patient, emailsto, emailccconcat, req)
        }
        res.status(201).send({ message: 'success' })




    } catch (err) {
        next(err);
    }
}
exports.getRequestVilByEmail = (req, res) => {
    var email = []
    email = req.params.email;
    var email1 = email.split(',');
    Requestvil.find({ 'hospitalemail.executivesto': { $elemMatch: { emailid: { "$in": email1 } } } }).populate('patient')
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
exports.getRequestvil = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const { patientid } = req.params;
        const user = await Facilitator.findById(userid).populate('requestvils')

        const patient = await Patient.findById(patientid).populate('requestvils')

        res.send(patient.requestvils)
    } catch (err) {
        next(err);
    }

}
exports.Putrequestvil = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var requestvil = {
        linkstatus: 'submit',

    };
    Requestvil.findByIdAndUpdate(req.params.id, { $set: requestvil }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}

module.exports.uploadvil = (upload.single('villetter')), (request, response, next) => {
    next();
}
exports.postResponsevil = async(req, res, next) => {
    try {
        console.log(req.body)

        const { userid } = req.params;

        const { patientid } = req.params;

        const responsevil = new Responsevil();
        responsevil.hospitalname = req.body.hospitalname
        responsevil.hospitalemail = JSON.parse(req.body.hospitalemail)
        responsevil.hospitalid = req.body.hospitalid

        responsevil.linkstatus = req.body.linkstatus
        if (req.file !== undefined) {
            responsevil.villetter = req.file;

        }
        const user = await Facilitator.findById(userid)

        const patient = await Patient.findById(patientid)
        responsevil.user = user
        responsevil.patient = patient
        await responsevil.save()

        user.responsevils.push(responsevil)
        await user.save()
        patient.responsevils.push(responsevil)
        patient.currentstatus = Status.receivedvil

        await patient.save()
        res.status(201).send({ message: 'success' })


    } catch (err) {
        next(err);
    }
}
exports.getResponsevilbyuser = (req, res) => {
    var id = req.params.userid;
    zoneQuery = { "user": id };
    Responsevil.find(zoneQuery)
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
exports.getResponsevil = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const { patientid } = req.params;

        const user = await Facilitator.findById(userid).populate('responsevils')

        const patient = await Patient.findById(patientid).populate('responsevils')

        res.send(patient.responsevils)
    } catch (err) {
        next(err);
    }


}
exports.postSentvil = async(req, res, next) => {
    try {
        // console.log(req.body)
        const { patientid } = req.params;
        qry = req.body[0];
        console.log(qry)
        ccsend = []
        emailcc = qry.emailcc
        emailcc.forEach(element => {
            ccsend.push(element.emailcc)
        });
        const sentvil = new Sentvil();
        sentvil.hospitalname = req.body[0].hospitalname
        sentvil.villetter = req.body[0].villetter
        const patient = await Patient.findById(patientid)

        sentvil.patient = patient
        await sentvil.save()
        patient.sentvils.push(sentvil)
        patient.currentstatus = Status.vilsent
        await patient.save()
        res.status(201).send({ message: 'success' })
        sendemail.sentvil(qry, patient, ccsend, req)


    } catch (err) {
        next(err);
    }
}
exports.getResponseVilByHospital = (req, res) => {
    const { patientid } = req.params;
    var id = req.params.hospitalid;
    zoneQuery = { "hospitalid": id, "patient": patientid };
    Responsevil.find(zoneQuery)
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
exports.putResponsevil = (req, res) => {
    console.log(req.body)
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var vil = {
        villetter: req.file,
    }
    Responsevil.findByIdAndUpdate(req.params.id, { $set: vil }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}