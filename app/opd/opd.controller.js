const Opdrequest = require('./opd.model')
const mongoose = require('mongoose');
const Patient = require('../patient/patient.model')
const Opdresponse = require('./opdresponse.model')
const Opdsent = require('./sendopd.model')
const Status = require('../patient/patient.status')
const Company = require('../company-details/company.model')
const jwt_decode = require('jwt-decode');

const { ObjectId } = require('mongodb');
var sendemail = require('../send-email/sendemail');
const Userrole = require('../facilitator-register/userrole.model')
const Facilitator = require('../facilitator-register/facilitator.model')
var dateFormat = require("dateformat");
const Emailcc = require('../send-email/emailcc.model')
var moment = require('moment-timezone');
const logger = require('../logs/logger');
const hospitalCms = require('../patient/cms.hospital.model')

exports.postOpdRequest = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        qry = req.body;
        qry.forEach(async element => {
            // console.log("Save ")
            if (element.doctorname == "") {
                element.doctorname = "NIL"
            }
            const opdrequest = new Opdrequest(element);
            if (element.aggregator) {
                opdrequest.aggregator = element.aggregator
            } else {
                opdrequest.aggregator = 'NIL'
            }
            qry1 = opdrequest.email.executivesto
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = opdrequest.email.executivescc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (opdrequest.email.doctorsto != undefined) {
                qry3 = opdrequest.email.doctorsto
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = opdrequest.email.doctorscc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const patient = await Patient.findById(patientid)
            opdrequest.patientname = patient.name
            opdrequest.countryname = patient.country
            opdrequest.medicalhistory = patient.medicalhistory

            opdrequest.patient = patient
            await opdrequest.save()
            patient.opdrequests.push(opdrequest)
            patient.currentstatus = Status.opdrequested
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
            logger.info(`OPD Consultation Request to ${element.hospitalname} for patient ${patient.uhidcode} ${patient.mhid}`, { id: patient.user, action: "OPD Requested", userName: patient.role.Role })

            var userid = patient.user
            const emailccsend = await Emailcc.find({ "user": userid });
            let emailccconcat = [];
            emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
            if (patient.passportNumber == "" || patient.passportNumber == undefined) {
                patient.passportNumber = "NIL"

            }
            if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
                emailccconcat.push(decoded.email)
            }
            console.log('emailccconcat', emailccconcat)
            if (element.aggregator) {
                const emailccSendAgg = await Emailcc.find({ "user": element.aggregator });
                console.log(emailccSendAgg)
                emailccconcat.push(`${emailccSendAgg[0].email}`);
                console.log(emailccconcat)
                sendemail.sendOPDRequestAggegator(patient, opdrequest, emailsto, emailccconcat, req, element.aggregator)

            } else {
                if (userid == '631a1788fa2509032eb5d6e0') {
                    sendemail.sendOPDRequestLimited(patient, opdrequest, emailsto, emailccconcat, req)

                } else {
                    sendemail.sendOPDRequest(patient, opdrequest, emailsto, emailccconcat, req)

                }

            }
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

exports.getOpdRequest = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        const patient = await Patient.findById(patientid).populate('opdrequests')
        res.send(patient.opdrequests)
    } catch (err) {
        next(err);
    }


}
exports.getOpdRequestById = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Opdrequest.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('patient')

}

exports.PutRequestStatus = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var opd = {
        linkstatus: 'submit',

    };
    Opdrequest.findByIdAndUpdate(req.params.id, { $set: opd }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}

exports.postOpdResponse = async(req, res, next) => {
    try {
        console.log(req.body)
        const { patientid } = req.params;

        const opdresponse = new Opdresponse();
        opdresponse.hospitalname = req.body.hospitalname;
        opdresponse.hospitalemail = req.body.hospitalemail;
        opdresponse.linkstatus = req.body.linkstatus;
        opdresponse.hospitalid = req.body.hospitalid;
        opdresponse.opdid = req.body.opdid;
        opdresponse.date = req.body.date;
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


        const patient = await Patient.findById(patientid)
        const opdrequest = await Opdrequest.findOne({ _id: req.body.opdid });

        if (opdrequest.aggregator == 'NIL') {
            userid = patient.user
        } else {
            userid = opdrequest.aggregator
        }
        opdresponse.patient = patient
        await opdresponse.save()
        date = moment(req.body.date).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        sendemail.opdreceived(patient, opdresponse, date, req, userid)

        patient.opdresponses.push(opdresponse)
        patient.currentstatus = Status.opdreceived
        logger.info(`OPD confirmation received for ${patient.uhidcode} ${patient.mhid}`, { id: patient.user, action: "OPD confirmation ", userName: patient.role.Role })
        await patient.save()

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

exports.getOpdResponse = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        const patient = await Patient.findById(patientid).populate('opdresponses')

        res.send(patient.opdresponses)
    } catch (err) {
        next(err);
    }

}
exports.getOpdbyOpdId = (req, res) => {
    var id = req.params.opdid;
    zoneQuery = { "opdid": id, };
    Opdresponse.find(zoneQuery)
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
exports.PutOpdResponse = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    console.log(req.body)
    var opd = {
        date: req.body.date,
        meetinglink: req.body.meetinglink,
        paymentlink: req.body.paymentlink,

    };
    if (opd.meetinglink == "") {
        opd.meetinglink = "NIL";

    }
    if (opd.paymentlink == "") {
        opd.paymentlink = "NIL";

    }
    Opdresponse.findByIdAndUpdate(req.params.id, { $set: opd }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}
exports.opdSent = async(req, res, next) => {
    try {
        const { patientid } = req.params;


        const opdsent = new Opdsent();
        opdsent.hospitalname = req.body.hospitalname
        opdsent.date = req.body.date
        opdsent.meetinglink = req.body.meetinglink
        opdsent.paymentlink = req.body.paymentlink
        opdsent.doctorname = req.body.doctorname
        const patient = await Patient.findById(patientid)

        opdsent.patient = patient

        await opdsent.save()
        patient.opdsents.push(opdsent)
        patient.currentstatus = Status.opdsent

        await patient.save()
        date = moment(req.body.date).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        sendemail.opdSent(patient, opdsent, date, req)

        res.status(201).send({ message: "success" })



    } catch (err) {
        next(err);
    }


}