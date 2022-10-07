const Preintimation = require('./intimation.model')
const mongoose = require('mongoose');
const Patient = require('../patient/patient.model')
const { ObjectId } = require('mongodb');
var sendemail = require('../send-email/sendemail');
const Userrole = require('../facilitator-register/userrole.model')
const Facilitator = require('../facilitator-register/facilitator.model')
const Status = require('../patient/patient.status')
const Emailcc = require('../send-email/emailcc.model')
const Company = require('../company-details/company.model')
const hospitalCms = require('../patient/cms.hospital.model')
const jwt_decode = require('jwt-decode');

exports.postPreIntemation = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);

        qry = req.body;
        qry.forEach(async element => {
            // console.log("Save ")

            const preintimation = new Preintimation(element);
            if (element.aggregator) {
                preintimation.aggregator = element.aggregator
            } else {
                preintimation.aggregator = 'NIL'
            }
            qry1 = preintimation.email.executivesto
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = preintimation.email.executivescc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (preintimation.email.doctorsto != undefined) {
                qry3 = preintimation.email.doctorsto
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = preintimation.email.doctorscc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const patient = await Patient.findById(patientid)
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
            var userid = patient.user

            const emailccsend = await Emailcc.find({ "user": userid });
            let emailccconcat = [];
            emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
            if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
                emailccconcat.push(decoded.email)
            }
            console.log('emailccconcat', emailccconcat)
            if (element.aggregator) {
                const emailccSendAgg = await Emailcc.find({ "user": element.aggregator });
                console.log(emailccSendAgg)
                emailccconcat.push(`${emailccSendAgg[0].email}`);
                console.log(emailccconcat)
                sendemail.sendIntimationAggegator(patient, preintimation, emailsto, emailccconcat, req, element.aggregator)


            } else {
                sendemail.sendIntimation(patient, preintimation, emailsto, emailccconcat, req)

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

exports.getPreIntimation = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        const patient = await Patient.findById(patientid).populate('preintimations')
        res.send(patient.preintimations)
    } catch (err) {
        next(err);
    }


}