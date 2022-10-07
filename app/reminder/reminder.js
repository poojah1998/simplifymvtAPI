const cron = require('node-cron');
const Patient = require('../patient/patient.model')


var dateFormat = require("dateformat");
var sendemail = require('../send-email/sendemail');
const Company = require('../company-details/company.model')
const Emailcc = require('../send-email/emailcc.model')
const Credential = require('../send-email/credentials.model')
const Userrole = require('../facilitator-register/userrole.model')
const Facilitator = require('../facilitator-register/facilitator.model')
const Refferal = require('../refferal-partner/refferal.model')

const vil = require('../request-vil/responsevil.model')
const RequestVil = require('../request-vil/requestvil.model')
const opinionReceived = require('../opinion-request/received.model')
const Hospital = require('../../hospital/hospital-auth/auth.model')
const HospitalCred = require('../../hospital/sendmail/credentials.model')

cron.schedule('30 10 * * *', async() => {

    try {

        pipeline = [{
            "$group": {
                _id: "$user",
                data: {
                    $push: {
                        hospitalid: "$hospitalid",
                        patient: "$patient",
                        createdAt: "$createdAt"
                    }
                }
            }
        }]
        doc = await vil.aggregate(pipeline)
        doc.forEach(element => {
            element.data.forEach(async element1 => {
                todayDate = new Date()
                const diffTime = Math.abs(element1.createdAt - todayDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log(diffDays);
                if (diffDays == 4) {
                    user = await Facilitator.findOne({ "_id": element._id });
                    emailUser = user.email
                    console.log(emailUser)

                    emailccsend = []

                    emailcc = await Userrole.find({ "user": element._id })
                    emailcc.forEach(element => {
                        if (element.Role == "Management")
                            emailccsend.push(element.email)
                    })
                    console.log(emailccsend)
                    hospital = await Hospital.findOne({ "name._id": element1.hospitalid });
                    hospitalCred = await HospitalCred.findOne({ "hospital": hospital._id })
                    patient = await Patient.findOne({ "_id": element1.patient })

                    requestvil = await RequestVil.findOne({ "patient": patient._id, "hospitalid": element1.hospitalid })
                    sendemail.reminderVil(user, hospital, patient, hospitalCred, requestvil, element1, emailccsend)
                    emailccsend = []

                }
            });

        });

    } catch (err) {
        console.log(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})


cron.schedule('45 10 * * *', async() => {
    try {

        pipeline = [{
                $project: {
                    hospitalid: 1,
                    patient: 1,
                    doctorname: 1,
                    hospitalid: 1,
                    patient: 1,
                    doctorname: 1,
                    stayincountry: 1,
                    countryduration: 1,
                    stayinhospital: 1,
                    hospitalduration: 1,
                    diagnosis: 1,
                    treatmentplan: 1,
                    initialevaluationminimum: 1,
                    initialevaluationmaximum: 1,
                    treatment: 1,
                    remarks: 1,
                    createdAt: 1
                }
            },
            {
                $lookup: {
                    from: 'patient',
                    localField: 'patient',
                    foreignField: '_id',
                    as: 'PatientUser',

                }
            },
            {
                $addFields: {
                    PatientUser: { $arrayElemAt: ["$PatientUser.user", 0] },

                }
            },

            {
                "$group": {
                    _id: "$PatientUser",
                    data: {
                        $push: {
                            hospitalid: "$hospitalid",
                            patient: "$patient",
                            doctorname: "$doctorname",
                            hospitalid: "$hospitalid",
                            patient: "$patient",
                            doctorname: "$doctorname",
                            stayincountry: "$stayincountry",
                            countryduration: "$countryduration",
                            stayinhospital: "$stayinhospital",
                            hospitalduration: "$hospitalduration",
                            diagnosis: "$diagnosis",
                            treatmentplan: "$treatmentplan",
                            initialevaluationminimum: "$initialevaluationminimum",
                            initialevaluationmaximum: "$initialevaluationmaximum",
                            treatment: "$treatment",
                            remarks: "$remarks",
                            createdAt: "$createdAt"
                        }
                    }
                }
            }
        ]

        doc = await opinionReceived.aggregate(pipeline)
        doc.forEach(element => {
            element.data.forEach(async element1 => {
                todayDate = new Date()
                const diffTime = Math.abs(element1.createdAt - todayDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log(diffDays);
                if (diffDays == 7) {
                    user = await Facilitator.findOne({ "_id": element._id });
                    emailUser = user.email
                    console.log(emailUser)

                    emailccsend = []

                    emailcc = await Userrole.find({ "user": element._id })
                    emailcc.forEach(element => {
                        if (element.Role == "Management")
                            emailccsend.push(element.email)
                    })
                    console.log(emailccsend)
                    hospital = await Hospital.findOne({ "name._id": element1.hospitalid });
                    hospitalCred = await HospitalCred.findOne({ "hospital": hospital._id })
                    patient = await Patient.findOne({ "_id": element1.patient })
                    element1.treatment.forEach(element => {
                        if (element.roomType == '') {
                            element.roomType = 'NIL'
                        }
                        if (element.maxCost == null) {
                            element.maxCost = 'NIL'

                        }
                    })
                    sendemail.reminderOpinion(user, hospital, patient, hospitalCred, element1, emailccsend)
                    emailccsend = []
                }
            });

        });

    } catch (err) {
        console.log(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})