const Request = require('./request.model')
const Received = require('./received.model')
const Receivededit = require('./receivededited.model')
const Userrole = require('../facilitator-register/userrole.model')
const Status = require('../patient/patient.status')
const Hospitalopinion = require('./hospital-opinion.model')
const Doctoropinion = require('./doctoropinion.model')
const https = require('https');
const jwt_decode = require('jwt-decode');
const Company = require('../company-details/company.model')
const hospitalCms = require('../patient/cms.hospital.model')

var AWS = require('aws-sdk');
// Set region
AWS.config.update({
    accessKeyId: process.env.smsAccessKey,
    secretAccessKey: process.env.smsSecretAccessKey,
    region: process.env.smsRegion
});
var sendemail = require('../send-email/sendemail');

const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const { ObjectId } = require('mongodb');
const Patient = require('../patient/patient.model')
const Emailcc = require('../send-email/emailcc.model')

exports.postOpinionrequest = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const { patientid } = req.params;
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        console.log('decoded', decoded)
        qry = req.body;
        qry.forEach(async element => {
            // console.log("Save ")
            element.history = [{
                'status': 'RCVD',
                'info': 'Opinion Request Received',
                'date': new Date()
            }]
            const request = new Request(element);
            if (element.aggregator) {
                request.aggregator = element.aggregator
            } else {
                request.aggregator = 'NIL'
            }
            qry1 = request.email.executivesto
            const emailsto = []
            qry1.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry2 = request.email.executivescc
            const emailscc = []
            qry2.forEach(async element => {
                emailscc.push(element.emailId)
            })

            if (request.email.doctorsto != undefined) {
                qry3 = request.email.doctorsto
                qry3.forEach(async element => {
                    emailsto.push(element.emailId)
                })
                qry4 = request.email.doctorscc
                qry4.forEach(async element => {
                    emailscc.push(element.emailId)
                })
            }

            const user = await Facilitator.findById(userid)
            const patient = await Patient.findById(patientid)


            request.user = user
            await request.save()


            request.patient = patient
            await request.save()


            user.requests.push(request)
            await user.save()

            patient.requests.push(request)
            patient.currentstatus = Status.opinionawaited
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
            if (patient.remarks == "") {
                patient.remarks = "NIL"

            }
            if (patient.passportNumber == "" || patient.passportNumber == undefined) {
                patient.passportNumber = "NIL"

            }
            const emailccsend = await Emailcc.find({ "user": userid });
            let emailccconcat = []
            emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
            if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
                emailccconcat.push(decoded.email)
            }
            if (element.aggregator) {
                const emailccSendAgg = await Emailcc.find({ "user": element.aggregator });

                console.log(emailccSendAgg)
                emailccconcat.push(`${emailccSendAgg[0].email}`);
                console.log(emailccconcat)
                sendemail.aggregatorHospitalOpinion(patient, request, element.aggregator, emailsto, emailccconcat, req)

            } else {
                if (userid == '631a1788fa2509032eb5d6e0') {
                    sendemail.hospitalopinionlimited(patient, request, user, emailsto, emailccconcat, req)

                } else {
                    sendemail.hospitalopinion(patient, request, user, emailsto, emailccconcat, req)

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
exports.postOpinionRequestResend = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const { patientid } = req.params;
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        // console.log("Save ")
        const request = new Request(req.body.item);

        qry1 = request.email.executivesto
        const emailsto = []
        qry1.forEach(async element => {
            emailsto.push(element.emailId)
        })
        qry2 = request.email.executivescc
        const emailscc = []
        qry2.forEach(async element => {
            emailscc.push(element.emailId)
        })

        if (request.email.doctorsto != undefined) {
            qry3 = request.email.doctorsto
            qry3.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry4 = request.email.doctorscc
            qry4.forEach(async element => {
                emailscc.push(element.emailId)
            })
        }

        const user = await Facilitator.findById(userid)
        const patient = await Patient.findById(patientid)
        const emailccsend = await Emailcc.find({ "user": userid });
        emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
        if (patient.passportNumber == "" || patient.passportNumber == undefined) {
            patient.passportNumber = "NIL"

        }
        if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
            emailccconcat.push(decoded.email)
        }
        if (userid == '631a1788fa2509032eb5d6e0') {
            sendemail.resendHospitalOpinionLimited(patient, request, user, emailsto, emailccconcat, req.body.remarks, req)

        } else {
            sendemail.resendHospitalOpinion(patient, request, user, emailsto, emailccconcat, req.body.remarks, req)

        }
        res.status(201).send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getOpinionrequest = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const { patientid } = req.params;



        const patient = await Patient.findById(patientid).populate('requests')

        res.send(patient)
    } catch (err) {
        next(err);
    }

}
exports.hospitalPerformance = (req, res) => {

    const { userid } = req.params;
    console.log(userid)
    var pipeline = [{
            $match: {
                user: ObjectId(userid),
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
    Request.aggregate(pipeline, (err, doc) => {
        if (!err) {
            res.send(doc)

        } else {
            res.send(err)

        }

    })

}
exports.hospitalPerformanceByPatient = (req, res) => {

    const { userid } = req.params;
    console.log(userid)
    var pipeline = [{
            $match: {
                user: ObjectId(userid),
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
    Request.aggregate(pipeline, (err, doc) => {
        if (!err) {
            res.send(doc)

        } else {
            res.send(err)

        }

    })

}

exports.getOpinionrequestid = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Request.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('patient')

}
exports.putOpinionrequestread = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var request = {
        read: true,

    };
    Request.findByIdAndUpdate(req.params.id, { $set: request }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}
exports.PutOpinionrequest = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var request = {
        linkstatus: 'submit',

    };
    Request.findByIdAndUpdate(req.params.id, { $set: request }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}
exports.PutOpinionHistoryReviewed = async(req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
        var data = []
        const request = await Request.findById(req.params.id)
        request.history.push({
            'status': 'OPENED',
            'info': 'Opinion Request Reviewed',
            'date': new Date()
        })
        data = request.history
        var requestdata = {
            history: data,
            hospitalreviewed: true
        };
        await Request.findByIdAndUpdate(req.params.id, { $set: requestdata }, { new: true });
    } catch (err) {
        next(err);
    }
}

// Opinion Received
exports.getRequestByEmailDate = (req, res) => {
    var email = []
    email = req.params.email;
    var email1 = email.split(',');

    // emailarray = []
    // email.forEach(async element => {
    //     emailarray.push(element)
    // })
    // emailarray.push(email)
    // console.log("email", emailarray)

    // zoneQuery = { "opinionid": id, };
    Request.find({ 'email.executivesto': { $elemMatch: { emailid: { "$in": email1 } } }, "date": { $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000))) } }).populate('patient')
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
exports.postOpinionreceived = async(req, res, next) => {
    try {
        console.log(req.body)
        const { requestid } = req.params;
        const { patientid } = req.params;

        const received = new Received();
        received.hospitalname = req.body.hospitalname;
        received.hospitalcity = req.body.hospitalcity;
        received.accreditations = req.body.accreditations;
        received.diagnosis = req.body.diagnosis;

        received.hospitalemail = req.body.hospitalemail;
        received.hospitalid = req.body.hospitalid;
        received.linkstatus = req.body.linkstatus;
        received.opinionid = req.body.opinionid;
        received.doctorid = req.body.doctorid;
        received.doctorname = req.body.doctorname;
        received.doctorprofile = req.body.doctorprofile;
        received.stayincountry = req.body.stayincountry;
        received.countryduration = req.body.countryduration;
        received.hospitalduration = req.body.hospitalduration;
        received.stayinhospital = req.body.stayinhospital;
        received.treatmentplan = req.body.treatmentplan;
        received.initialevaluationminimum = req.body.initialevaluationminimum;
        received.initialevaluationmaximum = req.body.initialevaluationmaximum;
        received.treatment = req.body.treatment;

        received.remarks = req.body.remarks;

        const request = await Request.findById(requestid)
        const patient = await Patient.findById(patientid)

        received.request = request
        received.patient = patient
        await received.save()
        received.treatment.forEach(element => {
            if (element.roomType == '') {
                element.roomType = 'NIL'
            }
            if (element.maxCost == null) {
                element.maxCost = 'NIL'

            }
        });

        if (request.aggregator == 'NIL') {
            userid = patient.user
        } else {
            userid = request.aggregator
        }
        sendemail.opinionreceived(patient, received, userid)

        request.receives.push(received)
        await request.save()

        patient.receives.push(received)
        patient.currentstatus = Status.opinionreceived

        await patient.save()

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
        await Request.findByIdAndUpdate(req.body.opinionid, { $set: requestdata }, { new: true });
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

exports.getOpinionreceived = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        const patient = await Patient.findById(patientid).populate('receives')

        res.send(patient)
    } catch (err) {
        next(err);
    }

}
exports.getOpinionRequestByHospital = (req, res) => {
    var id = req.params.userid;
    var hospitalname = req.params.hospitalname;

    zoneQuery = { "user": id, "hospitalname": hospitalname };
    Request.find(zoneQuery).populate('patient')
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

exports.getOpinionreceivedid = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Received.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('patient')

}

exports.putOpinionResponseReadByRole = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var received = {
        approved: true,

    };
    Received.findByIdAndUpdate(req.params.id, { $set: received }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
            doc.treatment.forEach(element => {
                if (element.roomType == '') {
                    element.roomType = 'NIL'
                }
                if (element.maxCost == null) {
                    element.maxCost = 'NIL'

                }
            });
            sendemail.opinionApproved(doc, req)
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}
exports.putOpinionResponseEditReadByRole = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var received = {
        approved: true,

    };
    Receivededit.findByIdAndUpdate(req.params.id, { $set: received }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
            doc.treatment.forEach(element => {
                if (element.roomType == '') {
                    element.roomType = 'NIL'
                }
                if (element.maxCost == null) {
                    element.maxCost = 'NIL'

                }
            })
            sendemail.opinionApproved(doc)
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}
exports.getOpinionreceivedByopinionid = (req, res) => {
    var id = req.params.opinionid;
    zoneQuery = { "opinionid": id, };
    Received.find(zoneQuery)
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

// opinion receivededit

exports.postOpinionreceivededit = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const { patientid } = req.params;
        const receivededit = new Receivededit();
        receivededit.hospitalname = req.body.hospitalname;
        receivededit.hospitalcity = req.body.hospitalcity;
        receivededit.accreditations = req.body.accreditations;
        receivededit.diagnosis = req.body.diagnosis;

        receivededit.hospitalemail = req.body.hospitalemail;
        receivededit.hospitalid = req.body.hospitalid;
        receivededit.linkstatus = req.body.linkstatus;
        receivededit.opinionid = req.body.opinionid;
        receivededit.doctorid = req.body.doctorid;
        receivededit.doctorname = req.body.doctorname;
        receivededit.doctorprofile = req.body.doctorprofile;
        receivededit.stayincountry = req.body.stayincountry;
        receivededit.stayinhospital = req.body.stayinhospital;
        receivededit.countryduration = req.body.countryduration;
        receivededit.hospitalduration = req.body.hospitalduration;
        receivededit.treatmentplan = req.body.treatmentplan;
        receivededit.initialevaluationminimum = req.body.initialevaluationminimum;
        receivededit.initialevaluationmaximum = req.body.initialevaluationmaximum;
        receivededit.treatment = req.body.treatment;
        receivededit.remarks = req.body.remarks;

        const user = await Facilitator.findById(userid)
        const patient = await Patient.findById(patientid)

        receivededit.user = user
        await receivededit.save()


        receivededit.patient = patient
        await receivededit.save()

        user.receivesedit.push(receivededit)
        await user.save()

        patient.receivesedit.push(receivededit)
        await patient.save()

        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getOpinionreceivededit = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const { patientid } = req.params;

        const user = await Facilitator.findById(userid).populate('receivesedit')


        const patient = await Patient.findById(patientid).populate('receivesedit')

        res.send(patient)
    } catch (err) {
        next(err);
    }

}

// Hospital opnion
exports.postHospitalOpinion = async(req, res, next) => {
    try {
        const { requestid } = req.params;
        const { patientid } = req.params;

        const hospitalopinion = new Hospitalopinion();
        hospitalopinion.opinionid = req.body.opinionid;
        hospitalopinion.doctorname = req.body.doctorname;
        hospitalopinion.emailid = req.body.emailid;

        const request = await Request.findById(requestid)
        const patient = await Patient.findById(patientid)
        if (request.aggregator == 'NIL') {
            userid = patient.user
        } else {
            userid = request.aggregator
        }

        hospitalopinion.request = request
        await hospitalopinion.save()


        hospitalopinion.patient = patient
        await hospitalopinion.save()

        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token)

        if (decoded.Role != 'Super' && decoded.Role != 'Admin' && decoded.Role != 'Query Manager' && decoded.Role != 'Management' && decoded.Role != 'Branch Office' && decoded.Role != 'Operation Executive' && decoded.Role != 'Refferal Partner') {
            sendemail.hospitalOpinionDoctorHospitalSide(patient, hospitalopinion, decoded.id)

        } else {
            sendemail.hospitalopiniondoctor(patient, hospitalopinion, userid)

        }

        request.hospitalopinions.push(hospitalopinion)
        await request.save()

        patient.hospitalopinions.push(hospitalopinion)
        await patient.save()
        var data = []
        request.history.push({
            'status': 'TODOC',
            'info': `Sent to ${req.body.doctorname}`,
            'date': new Date()
        })
        data = request.history

        var requestdata = {
            history: data,
            hospitalreviewed: true
        };
        await Request.findByIdAndUpdate(req.body.opinionid, { $set: requestdata }, { new: true });
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getHospitalOpinion = async(req, res, next) => {
    try {
        const { requestid } = req.params;
        const { patientid } = req.params;

        const request = await Request.findById(requestid).populate('hospitalopinions')
        const patient = await Patient.findById(patientid).populate('hospitalopinions')

        res.send(patient.hospitalopinions)

    } catch (err) {
        next(err);
    }
}

exports.getHospitalOpinionPopulate = async(req, res, next) => {
    try {
        var id = req.params.opinionid;
        zoneQuery = { "opinionid": id };
        const hospitalpoulate = await Hospitalopinion.find(zoneQuery).populate('doctoropinions')
        res.send(hospitalpoulate)
    } catch (err) {
        next(err);
    }

}
exports.getHospitalOpinionid = (req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        Hospitalopinion.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        }).populate('patient')

    }
    // Doctor opinion

exports.postDoctorOpinion = async(req, res, next) => {
    try {
        const { requestid } = req.params;
        const { patientid } = req.params;
        const { hospitalopinionid } = req.params;

        const doctoropinion = new Doctoropinion();
        doctoropinion.doctorname = req.body.doctorname;
        doctoropinion.emailid = req.body.emailid;
        doctoropinion.linkstatus = req.body.linkstatus;
        doctoropinion.diagnosis = req.body.diagnosis;
        doctoropinion.stayincountry = req.body.stayincountry;
        doctoropinion.stayinhospital = req.body.stayinhospital;
        doctoropinion.countryduration = req.body.countryduration;
        doctoropinion.hospitalduration = req.body.hospitalduration;
        doctoropinion.treatmentplan = req.body.treatmentplan;
        doctoropinion.initialevaluationminimum = req.body.initialevaluationminimum;
        doctoropinion.initialevaluationmaximum = req.body.initialevaluationmaximum;
        doctoropinion.treatment = req.body.treatment;
        doctoropinion.remarks = req.body.remarks;
        doctoropinion.hospitalname = req.body.hospitalname;
        doctoropinion.email = req.body.email;
        qry1 = doctoropinion.email.executivesto
        const emailsto = []
        qry1.forEach(async element => {
            emailsto.push(element.emailId)
        })
        qry2 = doctoropinion.email.executivescc
        const emailscc = []
        qry2.forEach(async element => {
            emailscc.push(element.emailId)
        })

        if (doctoropinion.email.doctorsto != undefined) {
            qry3 = doctoropinion.email.doctorsto
            qry3.forEach(async element => {
                emailsto.push(element.emailId)
            })
            qry4 = doctoropinion.email.doctorscc
            qry4.forEach(async element => {
                emailscc.push(element.emailId)
            })
        }

        const request = await Request.findById(requestid)
        const patient = await Patient.findById(patientid)
        const hospitalopinion = await Hospitalopinion.findById(hospitalopinionid)

        doctoropinion.request = request
        await doctoropinion.save()


        doctoropinion.patient = patient
        await doctoropinion.save()

        doctoropinion.hospitalopinion = hospitalopinion
        await doctoropinion.save()

        doctoropinion.treatment.forEach(element => {
            if (element.roomType == '') {
                element.roomType = 'NIL'
            }
            if (element.maxCost == null) {
                element.maxCost = 'NIL'

            }
        });
        if (request.aggregator == 'NIL') {
            userid = patient.user
        } else {
            userid = request.aggregator
        }
        sendemail.opiniondoctor(patient, doctoropinion, userid)
        const emailccsend = await Emailcc.find({ "user": userid });
        emailccconcat = emailscc.concat(`${emailccsend[0].email}`);
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token)
        if (decoded.Role != 'Branch Office' && decoded.Role != 'Refferal Partner') {
            emailccconcat.push(decoded.email)
        }

        if (decoded.Role != 'Super' && decoded.Role != 'Admin' && decoded.Role != 'Query Manager' && decoded.Role != 'Management' && decoded.Role != 'Branch Office' && decoded.Role != 'Operation Executive' && decoded.Role != 'Refferal Partner') {
            sendemail.doctorToHospitalOwn(patient, request, doctoropinion, emailsto, emailccconcat, decoded.id)

        } else {
            sendemail.doctortohospital(patient, request, doctoropinion, emailsto, emailccconcat, userid)

        }


        request.doctoropinions.push(doctoropinion)
        await request.save()

        patient.doctoropinions.push(doctoropinion)
        await patient.save()

        hospitalopinion.doctoropinions.push(doctoropinion)
        await hospitalopinion.save()

        request.history.push({
            'status': 'FROMDOC',
            'info': `Received From ${req.body.doctorname}`,
            'date': new Date()
        })
        data = request.history

        var requestdata = {
            history: data,
            hospitalreviewed: true
        };
        await Request.findByIdAndUpdate(requestid, { $set: requestdata }, { new: true });
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

exports.getDoctorOpinion = async(req, res, next) => {
    try {
        const { requestid } = req.params;
        const { patientid } = req.params;
        const { hospitalopinionid } = req.params;

        const request = await Request.findById(requestid).populate('doctoropinions')


        const patient = await Patient.findById(patientid).populate('doctoropinions')
        const hospitalopinion = await Hospitalopinion.findById(hospitalopinionid).populate('doctoropinions')

        res.send(hospitalopinion)
    } catch (err) {
        next(err);
    }


}
exports.putDoctorOpinion = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var doctoropinion = {
        stayinindia: req.body.stayinindia,
        stayinhospital: req.body.stayinhospital,
        treatmentplan: req.body.treatmentplan,
        initialevaluationminimum: req.body.initialevaluationminimum,
        initialevaluationmaximum: req.body.initialevaluationmaximum,
        costminimum: req.body.costminimum,
        costmaximum: req.body.costmaximum,
        roomcategory: req.body.roomcategory,
        remarks: req.body.remarks,

    };

    Doctoropinion.findByIdAndUpdate(req.params.id, { $set: doctoropinion }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getDoctorByIdOpinion = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Doctoropinion.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('patient')

}
exports.putDoctorrequestread = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var doctoropinion = {
        read: true,

    };
    Doctoropinion.findByIdAndUpdate(req.params.id, { $set: doctoropinion }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    });
}
exports.getHospitalOpinionbyhospital = (req, res) => {
    const { patientid } = req.params;
    var id = req.params.hospitalname;
    zoneQuery = { "hospitalname": id, "patient": patientid };
    Received.find(zoneQuery)
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