const Pirequest = require('./pi.model')
const Piresponse = require('./pi.response.model')
const Pisent = require('./sentpi.model')

const mongoose = require('mongoose');
const Patient = require('../patient/patient.model')
    // const Opdresponse = require('./opdresponse.model')
    // const Opdsent = require('./sendopd.model')
const Status = require('../patient/patient.status')
const Company = require('../company-details/company.model')
const hospitalCms = require('../patient/cms.hospital.model')

const { ObjectId } = require('mongodb');
var sendemail = require('../send-email/sendemail');
const Userrole = require('../facilitator-register/userrole.model')
const Facilitator = require('../facilitator-register/facilitator.model')
const Preintimation = require('../pre-intimation/intimation.model')
const Emailcc = require('../send-email/emailcc.model')
var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
const jwt_decode = require('jwt-decode');

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


module.exports.upload = (upload.single('proformainvoice')), (request, response, next) => {
    next();
}
exports.postPiRequest = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);

        qry = req.body;

        qry.forEach(async element => {
            // console.log("Save ")
            if (element.remark == "") {
                element.remark = "NIL"
            }
            const pirequest = new Pirequest(element);
            if (element.aggregator) {
                pirequest.aggregator = element.aggregator
            } else {
                pirequest.aggregator = 'NIL'
            }
            qry1 = pirequest.hospitalemail.executivesto
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = pirequest.hospitalemail.executivescc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (pirequest.hospitalemail.doctorsto != undefined) {
                qry3 = pirequest.hospitalemail.doctorsto
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = pirequest.hospitalemail.doctorscc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const patient = await Patient.findById(patientid)

            pirequest.patient = patient

            await pirequest.save()
            patient.pirequests.push(pirequest)
            patient.currentstatus = Status.pirequested

            await patient.save()
            var userid = patient.user
            const emailccsend = await Emailcc.find({ "user": userid });
            emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
            if (patient.passportNumber == "" || patient.passportNumber == undefined) {
                patient.passportNumber = "NIL"

            }
            if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
                emailccconcat.push(decoded.email)
            }
            console.log('emailccconcat', emailccconcat)
            if (element.hospitalid == '5dc946c5f9c3ea4af945edac' || element.hospitalid == '5ce640c366261379f15e8452' || element.hospitalid == '5f69def75272e96c51dfe971') {
                const hospitalDataSms = await hospitalCms.findOne({ _id: element.hospitalid })
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
            if (element.query == "OPN") {
                if (userid == '631a1788fa2509032eb5d6e0') {
                    sendemail.sendOpinionPiRequestLimited(patient, pirequest, emailsto, emailccconcat, req)

                } else {
                    sendemail.sendOpinionPiRequest(patient, pirequest, emailsto, emailccconcat, req)

                }

            } else {
                if (userid == '631a1788fa2509032eb5d6e0') {
                    sendemail.sendOpdPiRequestLimited(patient, pirequest, emailsto, emailccconcat, req)

                } else {
                    sendemail.sendOpdPiRequest(patient, pirequest, emailsto, emailccconcat, req)

                }


            }


        });
        res.status(201).send({ message: "success" })

    } catch (err) {
        next(err);
    }



}
exports.postPiRequestPreIntimationDirect = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);

        qry = req.body;
        qry.forEach(async element => {


            // console.log("Save ")
            if (element.remark == "") {
                element.remark = "NIL"
            }
            const pirequest = new Pirequest(element);
            if (element.aggregator) {
                pirequest.aggregator = element.aggregator
            } else {
                pirequest.aggregator = 'NIL'
            }
            pirequest.hospitalemail = element.email
            qry1 = pirequest.hospitalemail.executivesto
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = pirequest.hospitalemail.executivescc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (pirequest.hospitalemail.doctorsto != undefined) {
                qry3 = pirequest.hospitalemail.doctorsto
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = pirequest.hospitalemail.doctorscc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const patient = await Patient.findById(patientid)
            pirequest.patient = patient
            if (patient.remarks == "") {
                pirequest.remark = "NIL"

            } else {
                pirequest.remark = patient.remarks
            }
            await pirequest.save()
            patient.pirequests.push(pirequest)

            await patient.save()

            const preintimation = new Preintimation(element);

            preintimation.patientname = patient.name
            preintimation.countryname = patient.country
            console.log(patient.remarks)
            if (patient.remarks == "") {
                preintimation.patientremarks = "NIL"

            } else {
                preintimation.patientremarks = patient.remarks
            }
            if (patient.passportNumber == "" || patient.passportNumber == undefined) {
                patient.passportNumber = "NIL"

            }
            preintimation.patient = patient
            await preintimation.save()
            patient.preintimations.push(preintimation)
            patient.currentstatus = Status.intimationsent
            if (element.aggregator) {
                patient.aggregator.push(element.aggregator)
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
            }
            await patient.save()
            if (patient.treatment == "") {
                patient.treatment = 'NIL'
            }
            if (patient.passportNumber == "" || patient.passportNumber == undefined) {
                patient.passportNumber = "NIL"

            }
            var userid = patient.user
            const emailccsend = await Emailcc.find({ "user": userid });
            let emailccconcat = [];
            emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
            if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
                emailccconcat.push(decoded.email)
            }
            console.log('emailccconcat', emailccconcat)

            if (element.hospitalid == '5dc946c5f9c3ea4af945edac' || element.hospitalid == '5ce640c366261379f15e8452' || element.hospitalid == '5f69def75272e96c51dfe971') {
                const hospitalDataSms = await hospitalCms.findOne({ _id: element.hospitalid })
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
            if (element.aggregator) {
                const emailccSendAgg = await Emailcc.find({ "user": element.aggregator });
                console.log(emailccSendAgg)
                emailccconcat.push(`${emailccSendAgg[0].email}`);
                console.log(emailccconcat)
                sendemail.sendDirectPiAndIntimationAggegator(patient, pirequest, emailsto, emailccconcat, req, element.aggregator)

            } else {
                if (userid == '631a1788fa2509032eb5d6e0') {
                    sendemail.sendDirectPiAndIntimationLimited(patient, pirequest, emailsto, emailccconcat, req)

                } else {
                    sendemail.sendDirectPiAndIntimation(patient, pirequest, emailsto, emailccconcat, req)

                }

            }
        });
        res.status(201).send({ message: "success" })

        if (req.body[0].employee.length) {
            const employeeemails = []
            assigndetails = []
            assigndetails = req.body
            const patientdetails = await Patient.findById(patientid)

            const users = await Userrole.find({ user: patientdetails.user })
            const admin = await Facilitator.findById(patientdetails.user)

            assigndetails.map((obj) => {
                obj['patientname'] = patientdetails.name;
                obj['patientcountry'] = patientdetails.country;
                obj['patientrefferalpartner'] = patientdetails.refferalpartner;
                obj['patienttreatment'] = patientdetails.treatment;
                obj['user'] = patientdetails.user;
                obj['patientname'] = patientdetails.name;

                return obj;
            })
            qry5 = req.body[0].employee
            qry5.forEach(async element => {
                employeeemails.push(element.email)
            })
            users.forEach(async element => {
                if (element.Role == "Management")
                    employeeemails.push(element.email)
            })
            employeeemails.push(admin.email)


            sendemail.opinionemployee(assigndetails, employeeemails, req)
        }

    } catch (err) {
        next(err);
    }



}
exports.postPiRequestDirectHospital = async(req, res, next) => {
    try {
        const { patientid } = req.params;


        qry = req.body;
        qry.forEach(async element => {
            // console.log("Save ")
            if (element.remark == "") {
                element.remark = "NIL"
            }
            const pirequest = new Pirequest(element);
            pirequest.hospitalemail = element.email
            qry1 = pirequest.hospitalemail.executivesto
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = pirequest.hospitalemail.executivescc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (pirequest.hospitalemail.doctorsto != undefined) {
                qry3 = pirequest.hospitalemail.doctorsto
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = pirequest.hospitalemail.doctorscc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const patient = await Patient.findById(patientid)
            pirequest.patient = patient
            if (patient.remarks == "") {
                pirequest.remark = "NIL"

            } else {
                pirequest.remark = patient.remarks
            }
            await pirequest.save()
            patient.pirequests.push(pirequest)

            await patient.save()


        });
        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }



}
exports.getPiRequest = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        const patient = await Patient.findById(patientid).populate('pirequests')
        res.send(patient.pirequests)
    } catch (err) {
        next(err);
    }


}
exports.PutPiStatus = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var pi = {
        linkstatus: 'submit',

    };
    Pirequest.findByIdAndUpdate(req.params.id, { $set: pi }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}
exports.getPiRequestById = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Pirequest.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('patient')

}
exports.postPiResponse = async(req, res, next) => {
    try {

        qry = JSON.parse(req.body.obj);
        console.log(qry)
        const { patientid } = req.params;

        const piresponse = new Piresponse();
        piresponse.hospitalname = qry.hospitalname;
        piresponse.hospitalid = qry.hospitalid;

        piresponse.hospitalemail = qry.hospitalemail;
        piresponse.linkstatus = qry.linkstatus;
        piresponse.piid = qry.piid;
        if (req.file !== undefined) {
            piresponse.proformainvoice = req.file;

        }

        const patient = await Patient.findById(patientid)
        const pirequest = await Pirequest.findOne({ _id: qry.piid });

        if (pirequest.aggregator == 'NIL') {
            userid = patient.user
        } else {
            userid = pirequest.aggregator
        }
        piresponse.patient = patient
        await piresponse.save()
        patient.currentstatus = Status.pireceived

        sendemail.pireceived(patient, piresponse, req, userid)

        patient.piresponses.push(piresponse)
        await patient.save()

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

exports.getPiResponse = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        const patient = await Patient.findById(patientid).populate('piresponses')

        res.send(patient.piresponses)
    } catch (err) {
        next(err);
    }

}
exports.getPibyPiId = (req, res) => {
    var id = req.params.piid;
    zoneQuery = { "piid": id, };
    Piresponse.find(zoneQuery)
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
exports.PutPiResponse = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var pi = {

        proformainvoice: req.file,

    };

    Piresponse.findByIdAndUpdate(req.params.id, { $set: pi }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}
exports.piSent = async(req, res, next) => {
    try {
        const { patientid } = req.params;


        const pisent = new Pisent();
        pisent.hospitalname = req.body.hospitalname
        pisent.proformainvoice = req.body.proformainvoice;

        const patient = await Patient.findById(patientid)

        pisent.patient = patient

        await pisent.save()
        patient.pisents.push(pisent)
        patient.currentstatus = Status.pisent

        await patient.save()

        sendemail.piSent(patient, pisent, req)

        res.status(201).send({ message: "success" })



    } catch (err) {
        next(err);
    }


}