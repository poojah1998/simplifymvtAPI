const Confirmation = require('./confirmation.model')
const hospitalCms = require('../patient/cms.hospital.model')

const mongoose = require('mongoose');
const Patient = require('../patient/patient.model')
const { ObjectId } = require('mongodb');
var sendemail = require('../send-email/sendemail');
const Company = require('../company-details/company.model')
const Facilitator = require('../facilitator-register/facilitator.model')
const jwt_decode = require('jwt-decode');

const Status = require('../patient/patient.status')
const Emailcc = require('../send-email/emailcc.model')
var multer = require('multer')
var multerS3 = require('multer-s3')
var aws = require('aws-sdk')
var moment = require('moment-timezone');

const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});

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


module.exports.upload = (upload.array('ticket')), (request, response, next) => {
    next();
}
exports.postConfirmation = async(req, res, next) => {
    try {
        var coordinatorTime
        console.log(req.body)
        qry = JSON.parse(req.body.obj)
        console.log(qry)
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        const { patientid } = req.params;
        const confirmation = new Confirmation();
        if (qry.aggregator) {
            confirmation.aggregator = qry.aggregator
        } else {
            confirmation.aggregator = 'NIL'
        }
        confirmation.hospitalname = qry.hospitalname
        confirmation.hospitalid = qry.hospitalid


        confirmation.hospitalemail = qry.hospitalemail
        confirmation.arrivaldate = qry.arrivaldate

        if (req.files !== undefined) {
            for (let i = 0; i < req.files.length; i++) {
                confirmation.ticket[i] = req.files[i];

            }

        }
        confirmation.villetter = qry.villetter
        if (qry.remarks == '') {
            confirmation.remarks = "NIL"

        } else {
            confirmation.remarks = qry.remarks

        }
        if (qry.cabs == '') {
            confirmation.cabs = "NIL"

        } else {
            confirmation.cabs = qry.cabs

        }
        if (qry.flightName == '') {
            confirmation.flightName = "NIL"

        } else {
            confirmation.flightName = qry.flightName

        }
        if (qry.flightNo == '') {
            confirmation.flightNo = "NIL"

        } else {
            confirmation.flightNo = qry.flightNo

        }
        if (qry.contactPerson == '') {
            confirmation.contactPerson = "NIL"

        } else {
            confirmation.contactPerson = qry.contactPerson

        }
        if (qry.contactPersonNo == '') {
            confirmation.contactPersonNo = "NIL"

        } else {
            confirmation.contactPersonNo = qry.contactPersonNo

        }
        if (qry.coordinatorAddress == '') {
            confirmation.coordinatorAddress = "NIL"

        } else {
            confirmation.coordinatorAddress = qry.coordinatorAddress

        }
        if (qry.coordinatorTime == '') {
            confirmation.coordinatorTime = "NIL"
            coordinatorTime = "NIL"
        } else {
            confirmation.coordinatorTime = qry.coordinatorTime
            coordinatorTime = moment(qry.coordinatorTime).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        }

        qry3 = confirmation.hospitalemail.confirmationTo
        const emailsto = []
        qry3.forEach(async element => {
            emailsto.push(element.emailId)
        })
        qry4 = confirmation.hospitalemail.confirmationCc
        const emailscc = []
        qry4.forEach(async element => {
            emailscc.push(element.emailId)
        })
        if (confirmation.hospitalemail.doctorsTo != undefined) {

            qry5 = confirmation.hospitalemail.doctorsTo
            qry5.forEach(async element => {
                emailsto.push(element.emailId)
            })

            qry6 = confirmation.hospitalemail.doctorsCc
            qry6.forEach(async element => {
                emailscc.push(element.emailId)
            })
        }
        const patient = await Patient.findById(patientid)

        confirmation.patient = patient
        await confirmation.save()

        patient.confirmations.push(confirmation)
        patient.currentstatus = Status.confirmationsent
        if (qry.aggregator) {
            patient.aggregator.push(qry.aggregator)
            const company = await Company.findOne({ "user": qry.aggregator });

            if (patient.companyNames.length) {
                patient.companyNames.forEach(element => {
                    if (element != company.name) {
                        patient.companyNames.push(company.name)

                    }
                });
            } else {
                patient.companyNames.push(company.name)

            }
        }
        await patient.save()
        var userid = patient.user
        const emailccsend = await Emailcc.find({ "user": userid });
        let emailccconcat = [];
        emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
        if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
            emailccconcat.push(decoded.email)
        }
        console.log('emailccconcat', emailccconcat)
        arrivaldate = moment(qry.arrivaldate).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        if (qry.aggregator) {
            const emailccSendAgg = await Emailcc.find({ "user": qry.aggregator });
            console.log(emailccSendAgg)
            emailccconcat.push(`${emailccSendAgg[0].email}`);
            console.log(emailccconcat)
            sendemail.patientconfirmationAggegator(confirmation, patient, emailsto, emailccconcat, arrivaldate, coordinatorTime, req, qry.aggregator)

        } else {
            sendemail.patientconfirmation(confirmation, patient, emailsto, emailccconcat, arrivaldate, coordinatorTime, req)

        }
        if (qry.hospitalid == '5dc946c5f9c3ea4af945edac' || qry.hospitalid == '5ce640c366261379f15e8452' || qry.hospitalid == '5f69def75272e96c51dfe971') {
            const hospitalDataSms = await hospitalCms.findOne({ _id: qry.hospitalid })
            const companySms = await Company.findOne({ "user": userid });
            const user = await Facilitator.findOne({ "_id": userid });

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
        res.status(201).send({ message: 'success' })


    } catch (err) {
        next(err);
    }
}

exports.getConfirmation = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        const patient = await Patient.findById(patientid).populate('confirmations')

        res.send(patient.confirmations)
    } catch (err) {
        next(err);
    }


}