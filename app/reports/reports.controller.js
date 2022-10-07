const Report = require('./reports.model')
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const Emailcc = require('../send-email/emailcc.model')
const Credential = require('../send-email/credentials.model')
const Userrole = require('../facilitator-register/userrole.model')
const Doctorcms = require('../patient/cms.doctor.model')
const DepartmentCms = require('../patient/cms.department')

const cmsExcel = require('./cms-excel.model')
const vil = require('../request-vil/responsevil.model')
const RequestVil = require('../request-vil/requestvil.model')
const opinionReceived = require('../opinion-request/received.model')

const Treatmentcms = require('../patient/cms.treatment.model')
const Hospitalcms = require('../patient/cms.hospital.model')
const Hospital = require('../../hospital/hospital-auth/auth.model')
const HospitalCred = require('../../hospital/sendmail/credentials.model')
const hospitalPatient = require('../../hospital/hospital-patients/patient.model')
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');
const cron = require('node-cron');
var moment = require('moment-timezone');

var json2xls = require('json2xls');
const Company = require('../company-details/company.model')
const Designation = require('../profile/model')
const HospitalCredential = require('../../hospital/sendmail/credentials.model')
const HospitalDesignation = require('../../hospital/hospital-profile/profile.model')
const HospitalCompany = require('../../hospital/hospital-details/details.model')


const { ObjectId } = require('mongodb');
var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const Patient = require('../patient/patient.model')
var dateFormat = require("dateformat");
var sendemail = require('../send-email/sendemail');
var pipeline = require('./pipiline');
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
const jwt_decode = require('jwt-decode');
const { DirectConnect } = require('aws-sdk');
const { isUndefined } = require('util');

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {

        cb(null, 'images')
    } else if (file.mimetype === 'application/pdf' || file.mimetype === 'application/xlsx') {
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
        key: function (req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
        }
    }),
    fileFilter: fileFilter

})


module.exports.upload = (upload.single('downloadreport')), (request, response, next) => {
    next();
}
exports.postReport = async (req, res, next) => {
    try {
        if (req.body.startdate == req.body.enddate) {
            return res.status(400).send({ message: "Both the date are same" })
        }
        console.log(req.body)
        const { userid } = req.params;
        const report = new Report();

        report.role = req.body.role;
        report.startdate = req.body.startdate;
        report.enddate = req.body.enddate;

        if (req.body.branchoffice == "" || req.body.branchoffice == "undefined") {
            report.branchoffice = 'NAN';

        } else {
            report.branchoffice = req.body.branchoffice;

        }
        if (req.body.refferalpartner == "{}") {
            report.refferalpartner = 'NAN';

        } else {
            report.refferalpartner = req.body.refferalpartner;

        }
        const user = await Facilitator.findById(userid)

        if (req.body.role['Role'] != "Branch Office" && req.body.role['Role'] != "Refferal Partner") {
            var pipeline = [{
                $match: {
                    user: ObjectId(userid),
                    createdAt: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },

                }
            },
            {
                $lookup: {
                    from: 'request',
                    localField: 'requests',
                    foreignField: '_id',
                    as: 'request',

                }
            },
            {
                $lookup: {
                    from: 'received',
                    localField: 'receives',
                    foreignField: '_id',
                    as: 'received'
                }
            },
            {
                $lookup: {
                    from: 'preintimation',
                    localField: 'preintimations',
                    foreignField: '_id',
                    as: 'preintimation'
                }
            },
            {
                $lookup: {
                    from: 'opdrequest',
                    localField: 'opdrequests',
                    foreignField: '_id',
                    as: 'opdrequest'
                }
            },
            {
                $lookup: {
                    from: 'opdresponse',
                    localField: 'opdresponses',
                    foreignField: '_id',
                    as: 'opdresponse'
                }
            },
            {
                $lookup: {
                    from: 'pirequest',
                    localField: 'pirequests',
                    foreignField: '_id',
                    as: 'pirequests'
                }
            },
            {
                $lookup: {
                    from: 'piresponse',
                    localField: 'piresponses',
                    foreignField: '_id',
                    as: 'piresponses'
                }
            },
            {
                $lookup: {
                    from: 'requestvil',
                    localField: 'requestvils',
                    foreignField: '_id',
                    as: 'requestvils'
                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    localField: 'responsevils',
                    foreignField: '_id',
                    as: 'responsevils'
                }
            },
            {
                $lookup: {
                    from: 'confirmation',
                    localField: 'confirmations',
                    foreignField: '_id',
                    as: 'confirmations'
                }
            },
            {
                $lookup: {
                    from: 'sentopinion',
                    localField: 'sentopinions',
                    foreignField: '_id',
                    as: 'sentopinions'
                }
            },
            {
                $lookup: {
                    from: 'sentvils',
                    localField: 'sentvils',
                    foreignField: '_id',
                    as: 'sentvils'
                }
            },
            {
                $project: {
                    "_id": 0,
                    "Company Name": "$companyname",
                    "UHID": "$uhidcode",
                    "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                    "Patient Name": "$name",
                    "Entry Date": { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    "Entry Time": { $dateToString: { format: "%H:%M", date: "$date", timezone: "Asia/Kolkata" } },
                    "Status": "$currentstatus",
                    "Gender": {
                        $cond: {
                            if: { $eq: ["$gender", ""] },
                            then: "-",
                            else: "$gender"
                        }
                    },
                    "Age": {
                        $cond: {
                            if: { $eq: ["$age", ""] },
                            then: "-",
                            else: "$age"
                        }
                    },
                    "Mobile No": {
                        $cond: {
                            if: { $eq: ["$contact", ""] },
                            then: "-",
                            else: "$contact"
                        }
                    },
                    "Email Id": {
                        $cond: {
                            if: { $eq: ["$emailid", ""] },
                            then: "-",
                            else: "$emailid"
                        }
                    },
                    "Country": "$country",
                    "Treatment": {
                        $cond: {
                            if: { $eq: ["$treatment", ""] },
                            then: "-",
                            else: "$treatment"
                        }
                    },
                    "Closed Date": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: {
                                $dateToString:
                                {
                                    format: "%Y-%m-%d", date: "$closedDate"
                                }
                            }
                        }
                    },
                    "Closed Time": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: {
                                $dateToString:
                                {
                                    format: "%H:%M", date: "$closedDate", timezone: "Asia/Kolkata" 
                                }
                            }
                        }
                    },

                    "Closed Reason": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: "$closedReason"
                        }
                    },
                    "Referral Partner": {
                        $cond: {
                            if: { $eq: ["$refferalpartner", "NAN"] },
                            then: "NAN",
                            else: "$refferalpartner.name"
                        }
                    },

                    "preintimation": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "preintimationtime": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                            }
                        }
                    },
                    "opdrequested": {

                        $map: {
                            input: "$opdrequest",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }

                    },
                    "opdresponse": {

                        $map: {
                            input: "$opdresponse",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }

                    },
                    "sentopinions": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.opnionPdf"
                            }
                        }

                    },
                    "opinionDate": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "vilDate": {

                        $map: {
                            input: "$sentvils",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "vilTime": {

                        $map: {
                            input: "$sentvils",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "sentDocPdf": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.doctorPdf"
                            }
                        }

                    },
                    "pirequest": {
                        $map: {
                            input: "$pirequests",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "piresponse": {
                        $map: {
                            input: "$piresponses",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "opinionrequest": {
                        $map: {
                            input: "$request",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "opinionreceived": {
                        $map: {
                            input: "$received",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "vilrequest": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "vilresponse": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "confiramtion": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "vilLetter": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                location: "$$up.villetter.location"
                            }
                        }
                    },

                    "patientProfile": {
                        $map: {
                            input: "$patientProfile",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                    "ticket": {
                        $map: {
                            input: "$confirmations.ticket",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                    "passports": {
                        $map: {
                            input: "$requestvils.passports",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                },


            },
            {
                $addFields: {

                    "opinionDate": { $dateToString: { format: "%Y-%m-%d", date: { $arrayElemAt: ["$opinionDate.location", 0] } } },
                    "opinionTime": { $dateToString: { format: "%H:%M", date: { $arrayElemAt: ["$opinionDate.location", 0] }, timezone: "Asia/Kolkata" } },
                    "vilDate": { $dateToString: { format: "%Y-%m-%d", date: { $arrayElemAt: ["$vilDate.location", 0] } } },
                    "vilTime": { $dateToString: { format: "%H:%M", date: { $arrayElemAt: ["$vilTime.location", 0] }, timezone: "Asia/Kolkata" } },
                    "Ticket Copy": {
                        $cond: {
                            if: {
                                $eq: ["$ticket", []]
                            },
                            then: "",
                            else: '$ticket.location',

                        }
                    },
                    "Passports": {
                        $cond: {
                            if: {
                                $eq: ["$passports", []]
                            },
                            then: "",
                            else: '$passports.location',

                        }
                    },
                    "Sent Opinions": {
                        $cond: {
                            if: {
                                $eq: ["$sentopinions", []]
                            },
                            then: "",
                            else: '$sentopinions.location',

                        }
                    },
                    "Doctor Profile": {
                        $cond: {
                            if: {
                                $eq: ["$sentDocPdf", []]
                            },
                            then: "",
                            else: '$sentDocPdf.location',

                        }
                    },
                }
            },
            {
                $addFields: {
                    // "Pre Intimation Sent Hospital": {
                    //     '$reduce': {
                    //         'input': '$preintimation.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Pre Intimation Time": {
                    //     '$reduce': {
                    //         'input': '$preintimationtime.date',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "OPD Request Hospital": {
                    //     '$reduce': {
                    //         'input': '$opdrequested.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "OPD Response Hospital": {
                    //     '$reduce': {
                    //         'input': '$opdresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Opinion request hospital assigned": {
                    //     '$reduce': {
                    //         'input': '$opinionrequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Opinion received from Hospital": {
                    //     '$reduce': {
                    //         'input': '$opinionreceived.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Proforma Invoice Request": {
                    //     '$reduce': {
                    //         'input': '$pirequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Proforma Invoice Response": {
                    //     '$reduce': {
                    //         'input': '$piresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "VIL Request to Hospital": {
                    //     '$reduce': {
                    //         'input': '$vilrequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "VIL received": {
                    //     '$reduce': {
                    //         'input': '$vilresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Confiramtion": {
                    //     '$reduce': {
                    //         'input': '$confiramtion.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    "Patient Report": {
                        '$reduce': {
                            'input': '$patientProfile.location',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    "Vil Letter": {
                        '$reduce': {
                            'input': '$vilLetter.location',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },

                }
            },
            {
                $project: {
                    opinionrequest: 0,
                    opinionreceived: 0,
                    preintimation: 0,
                    preintimationtime: 0,
                    opdrequested: 0,
                    opdresponse: 0,
                    pirequest: 0,
                    piresponse: 0,
                    vilrequest: 0,
                    vilresponse: 0,
                    vilLetter: 0,
                    patientProfile: 0,
                    confiramtion: 0,
                    ticket: 0,
                    passports: 0,
                    sentopinions: 0,
                    sentDocPdf: 0,

                    user: 0
                }
            },



            ]
            var pipeline2 = [{
                $match: {
                    user: ObjectId(userid),
                    date: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },

                }
            },
            {
                $lookup: {
                    from: 'request',
                    localField: 'requests',
                    foreignField: '_id',
                    as: 'request',

                }
            },
            {
                $lookup: {
                    from: 'received',
                    localField: 'receives',
                    foreignField: '_id',
                    as: 'received'
                }
            },
            {
                $lookup: {
                    from: 'preintimation',
                    localField: 'preintimations',
                    foreignField: '_id',
                    as: 'preintimation'
                }
            },
            {
                $lookup: {
                    from: 'opdrequest',
                    localField: 'opdrequests',
                    foreignField: '_id',
                    as: 'opdrequest'
                }
            },
            {
                $lookup: {
                    from: 'opdresponse',
                    localField: 'opdresponses',
                    foreignField: '_id',
                    as: 'opdresponse'
                }
            },
            {
                $lookup: {
                    from: 'pirequest',
                    localField: 'pirequests',
                    foreignField: '_id',
                    as: 'pirequests'
                }
            },
            {
                $lookup: {
                    from: 'piresponse',
                    localField: 'piresponses',
                    foreignField: '_id',
                    as: 'piresponses'
                }
            },
            {
                $lookup: {
                    from: 'requestvil',
                    localField: 'requestvils',
                    foreignField: '_id',
                    as: 'requestvils'
                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    localField: 'responsevils',
                    foreignField: '_id',
                    as: 'responsevils'
                }
            },
            {
                $lookup: {
                    from: 'confirmation',
                    localField: 'confirmations',
                    foreignField: '_id',
                    as: 'confirmations'
                }
            },
            {
                $lookup: {
                    from: 'sentopinion',
                    localField: 'sentopinions',
                    foreignField: '_id',
                    as: 'sentopinions'
                }
            },
            {
                $project: {
                    "_id": 0,
                    "patientName": "$name",
                    "Gender": {
                        $cond: {
                            if: { $eq: ["$gender", ""] },
                            then: "-",
                            else: "$gender"
                        }
                    },
                    "Age": {
                        $cond: {
                            if: { $eq: ["$age", ""] },
                            then: "-",
                            else: "$age"
                        }
                    },

                    "Treatment": {
                        $cond: {
                            if: { $eq: ["$treatment", ""] },
                            then: "-",
                            else: "$treatment"
                        }
                    },
                    "UHID": "$uhidcode",
                    "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                    "preintimation": 1,
                    "opdrequest": 1,
                    "opdresponse": 1,
                    "pirequests": 1,
                    "piresponses": 1,
                    "request": 1,
                    "received": 1,
                    "requestvils": 1,
                    "responsevils": 1,
                    "confirmations": 1,


                }
            },
            {
                $project: {


                    // "Referral Partner": {
                    //     $cond: {
                    //         if: { $eq: ["$refferalpartner", "NAN"] },
                    //         then: "NAN",
                    //         else: "$refferalpartner.name"
                    //     }
                    // },

                    "preintimation": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                preintimation: "Yes",
                                uhid: "$Company UHID",
                                UHID: "$UHID",

                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                intimationSentDate: "$$up.createdAt",

                            }
                        }
                    },
                    // "preintimationtime": {
                    //     $map: {
                    //         input: "$preintimation",
                    //         as: "up",
                    //         in: {
                    //             date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                    //         }
                    //     }
                    // },
                    "opdrequested": {

                        $map: {
                            input: "$opdrequest",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opdrequested: "Yes",
                                uhid: "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                opdSentDate: "$$up.createdAt",



                            }
                        }

                    },
                    "opdresponse": {

                        $map: {
                            input: "$opdresponse",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opdresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                meetinglink: "$$up.meetinglink",
                                paymentlink: "$$up.paymentlink",
                                opddoctorname: "$$up.doctorname",



                            }
                        }

                    },

                    // "sentDocPdf": {

                    //     $map: {
                    //         input: "$sentopinions",
                    //         as: "up",
                    //         in: {
                    //             location: "$$up.doctorPdf",


                    //         }
                    //     }

                    // },
                    "pirequest": {
                        $map: {
                            input: "$pirequests",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                pirequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                piSentDate: "$$up.createdAt",


                            }
                        }
                    },
                    "piresponse": {
                        $map: {
                            input: "$piresponses",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                piresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },
                    "opinionrequest": {
                        $map: {
                            input: "$request",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                opinionSentDate: "$$up.createdAt",
                                hospitalid: "$$up.hospitalid",
                                opinionrequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",


                            }
                        }
                    },

                    "opinionreceived": {
                        $map: {
                            input: "$received",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opinionreceived: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                diagnosis: "$$up.diagnosis",
                                treatmentplan: "$$up.treatmentplan",
                                stayincountry: "$$up.stayincountry",
                                countryduration: "$$up.countryduration",
                                stayinhospital: "$$up.stayinhospital",
                                hospitalduration: "$$up.hospitalduration",
                                initialevaluationminimum: "$$up.initialevaluationminimum",
                                initialevaluationmaximum: "$$up.initialevaluationmaximum",
                                remarks: "$$up.remarks",
                                treatment: "$$up.treatment",


                            }
                        }
                    },

                    "vilrequest": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                vilrequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                vilSentDate: "$$up.createdAt",



                            }
                        }
                    },
                    "vilresponse": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                vilresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },

                    "confiramtion": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                confiramtion: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                confSentDate: "$$up.createdAt",
                                arrivaldate: "$$up.arrivaldate",
                                confRemarks: "$$up.remarks",
                                cabs: "$$up.cabs",
                                flightName: "$$up.flightName",
                                flightNo: "$$up.flightNo",
                                contactPerson: "$$up.contactPerson",
                                contactPersonNo: "$$up.contactPersonNo",
                                coordinatorAddress: "$$up.coordinatorAddress",


                            }
                        }
                    },
                    "vilLetter": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                vilDoc: "$$up.villetter.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                vilLetter: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",




                            }
                        }
                    },
                    "ticket": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                ticketDoc: "$$up.ticket.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                ticket: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },
                    "passports": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                passportDoc: "$$up.passports.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                passports: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",




                            }
                        }
                    },
                },


            },

            {
                $project: {
                    mergedArray: {
                        $concatArrays: ["$preintimation", "$opdrequested", "$opdresponse", "$pirequest", "$piresponse", "$opinionrequest", "$opinionreceived", "$vilrequest", "$vilresponse", "$confiramtion", "$vilLetter", "$ticket", "$passports"],
                    }
                }
            },
            {
                $unwind: "$mergedArray"
            },


            {
                $group: {
                    _id: {
                        hospitalId: "$mergedArray.hospitalid",
                        hospitalname: "$mergedArray.hospitalname",


                    },
                    data: {
                        $push: {
                            opinionSentDate: "$mergedArray.opinionSentDate",
                            intimationSentDate: "$mergedArray.intimationSentDate",
                            opdSentDate: "$mergedArray.opdSentDate",
                            piSentDate: "$mergedArray.piSentDate",
                            vilSentDate: "$mergedArray.vilSentDate",
                            confSentDate: "$mergedArray.confSentDate",
                            preintimation: "$mergedArray.preintimation",
                            opdrequested: "$mergedArray.opdrequested",
                            opdresponse: "$mergedArray.opdresponse",
                            pirequest: "$mergedArray.pirequest",
                            piresponse: "$mergedArray.piresponse",
                            opinionrequest: "$mergedArray.opinionrequest",

                            meetinglink: "$mergedArray.meetinglink",
                            paymentlink: "$mergedArray.paymentlink",
                            opddoctorname: "$mergedArray.opddoctorname",
                            opinionreceived: "$mergedArray.opinionreceived",
                            vilrequest: "$mergedArray.vilrequest",
                            vilresponse: "$mergedArray.vilresponse",
                            confiramtion: "$mergedArray.confiramtion",
                            vilLetter: "$mergedArray.vilDoc",
                            ticket: "$mergedArray.ticketDoc",
                            passports: "$mergedArray.passportDoc",
                            "uhid": "$mergedArray.uhid",
                            UHID: "$mergedArray.UHID",

                            "patientName": "$mergedArray.patientName",
                            "Age": "$mergedArray.Age",
                            "Gender": "$mergedArray.Gender",
                            "Treatment": "$mergedArray.Treatment",
                            diagnosis: "$mergedArray.diagnosis",
                            treatmentplan: "$mergedArray.treatmentplan",
                            stayincountry: "$mergedArray.stayincountry",
                            countryduration: "$mergedArray.countryduration",
                            stayinhospital: "$mergedArray.stayinhospital",
                            hospitalduration: "$mergedArray.hospitalduration",
                            initialevaluationminimum: "$mergedArray.initialevaluationminimum",
                            initialevaluationmaximum: "$mergedArray.initialevaluationmaximum",
                            remarks: "$mergedArray.remarks",
                            treatmentOpinion: "$mergedArray.treatment",

                            confRemarks: "$mergedArray.confRemarks",
                            cabs: "$mergedArray.cabs",
                            flightName: "$mergedArray.flightName",
                            flightNo: "$mergedArray.flightNo",
                            contactPerson: "$mergedArray.contactPerson",
                            contactPersonNo: "$mergedArray.contactPersonNo",
                            coordinatorAddress: "$mergedArray.coordinatorAddress",
                        }

                    },
                }
            },
            {
                $unwind: "$data"
            },

            {
                $group: {
                    _id: {
                        _id: "$_id",
                        uhid: "$data.uhid"
                    },
                    preintimation: { $first: "$preintimation" },
                    opdrequested: { $first: "$opdrequested" },
                    opdresponse: { $first: "$opdresponse" },
                    pirequest: { $first: "$pirequest" },
                    piresponse: { $first: "$piresponse" },
                    opinionrequest: { $first: "$opinionrequest" },
                    opinionSentDate: { $first: "$opinionSentDate" },
                    opinionSentTime: { $first: "$opinionSentTime" },
                    opinionreceived: { $first: "$opinionreceived" },
                    vilrequest: { $first: "$vilrequest" },
                    vilresponse: { $first: "$vilresponse" },
                    confiramtion: { $first: "$confiramtion" },
                    vilLetter: { $first: "$vilLetter" },
                    ticket: { $first: "$ticket" },
                    passports: { $first: "$passports" },
                    "patient Name": { $first: "$patientName" },
                    Age: { $first: "$Age" },
                    Gender: { $first: "$Gender" },
                    Treatment: { $first: "$Treatment" },
                    data: { $mergeObjects: "$data" }
                }
            },
            {
                $group: {
                    _id: "$_id._id",
                    data: { $push: "$data" }
                }
            },
                // {
                //     $addFields:{
                //         "opinionSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data[0].opinionSentDate" } },
                //         // "data.opinionSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.opinionSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.intimationSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.intimationSentDate" } },
                //         // "data.intimationSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.intimationSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.opdSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.opdSentDate" } },
                //         // "data.opdSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.opdSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.piSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.piSentDate" } },
                //         // "data.piSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.piSentDate", timezone: "Asia/Kolkata" } },
                //         // "data.vilSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.vilSentDate" } },
                //         // "data.vilSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.vilSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.confSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.confSentDate" } },
                //         // "data.confSentTIme":  { $dateToString:{ format: "%H:%M", date: "$data.confSentDate", timezone: "Asia/Kolkata" } },
                //     }
                // },
                //             {
                //                 $addFields: {


                //                     "Ticket Copy": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$ticket", []]
                //                             },
                //                             then: "",
                //                             else: '$ticket.location',

                //                         }
                //                     },
                //                     "Passports": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$passports", []]
                //                             },
                //                             then: "",
                //                             else: '$passports.location',

                //                         }
                //                     },
                //                     "Sent Opinions": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$sentopinions", []]
                //                             },
                //                             then: "",
                //                             else: '$sentopinions.location',

                //                         }
                //                     },
                //                     "Doctor Profile": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$sentDocPdf", []]
                //                             },
                //                             then: "",
                //                             else: '$sentDocPdf.location',

                //                         }
                //                     },
                //                 }
                //             },
                //             {
                //                 $addFields: {
                //                     "Pre Intimation Sent Hospital": {
                //                         '$reduce': {
                //                             'input': '$preintimation.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Pre Intimation Time": {
                //                         '$reduce': {
                //                             'input': '$preintimationtime.date',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "OPD Request Hospital": {
                //                         '$reduce': {
                //                             'input': '$opdrequested.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "OPD Response Hospital": {
                //                         '$reduce': {
                //                             'input': '$opdresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Opinion request hospital assigned": {
                //                         '$reduce': {
                //                             'input': '$opinionrequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Opinion received from Hospital": {
                //                         '$reduce': {
                //                             'input': '$opinionreceived.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Proforma Invoice Request": {
                //                         '$reduce': {
                //                             'input': '$pirequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Proforma Invoice Response": {
                //                         '$reduce': {
                //                             'input': '$piresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "VIL Request to Hospital": {
                //                         '$reduce': {
                //                             'input': '$vilrequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "VIL received": {
                //                         '$reduce': {
                //                             'input': '$vilresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Confiramtion": {
                //                         '$reduce': {
                //                             'input': '$confiramtion.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     // "Patient Report": {
                //                     //     '$reduce': {
                //                     //         'input': '$patientProfile.location',
                //                     //         'initialValue': '',
                //                     //         'in': {
                //                     //             '$concat': [
                //                     //                 '$$value',
                //                     //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                     //                 '$$this'
                //                     //             ]
                //                     //         }
                //                     //     }
                //                     // },
                //                     "Vil Letter": {
                //                         '$reduce': {
                //                             'input': '$vilLetter.location',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },

                //                 }
                //             },
                //             {
                //                 $project: {
                //                     opinionrequest: 0,
                //                     opinionreceived: 0,
                //                     preintimation: 0,
                //                     preintimationtime: 0,
                //                     opdrequested: 0,
                //                     opdresponse: 0,
                //                     pirequest: 0,
                //                     piresponse: 0,
                //                     vilrequest: 0,
                //                     vilresponse: 0,
                //                     vilLetter: 0,
                //                     patientProfile: 0,
                //                     confiramtion: 0,
                //                     ticket: 0,
                //                     passports: 0,
                //                     sentopinions: 0,
                //                     sentDocPdf: 0,

                // user:0                    }
                //             },



            ]

        } else if (req.body.role['Role'] == "Branch Office") {
            var pipeline = [{
                $match: {
                    user: ObjectId(userid),
                    date: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    branchoffice: req.body.branchoffice


                }
            },
            {
                $lookup: {
                    from: 'request',
                    localField: 'requests',
                    foreignField: '_id',
                    as: 'request',

                }
            },
            {
                $lookup: {
                    from: 'received',
                    localField: 'receives',
                    foreignField: '_id',
                    as: 'received'
                }
            },
            {
                $lookup: {
                    from: 'preintimation',
                    localField: 'preintimations',
                    foreignField: '_id',
                    as: 'preintimation'
                }
            },
            {
                $lookup: {
                    from: 'opdrequest',
                    localField: 'opdrequests',
                    foreignField: '_id',
                    as: 'opdrequest'
                }
            },
            {
                $lookup: {
                    from: 'opdresponse',
                    localField: 'opdresponses',
                    foreignField: '_id',
                    as: 'opdresponse'
                }
            },
            {
                $lookup: {
                    from: 'pirequest',
                    localField: 'pirequests',
                    foreignField: '_id',
                    as: 'pirequests'
                }
            },
            {
                $lookup: {
                    from: 'piresponse',
                    localField: 'piresponses',
                    foreignField: '_id',
                    as: 'piresponses'
                }
            },
            {
                $lookup: {
                    from: 'requestvil',
                    localField: 'requestvils',
                    foreignField: '_id',
                    as: 'requestvils'
                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    localField: 'responsevils',
                    foreignField: '_id',
                    as: 'responsevils'
                }
            },
            {
                $lookup: {
                    from: 'confirmation',
                    localField: 'confirmations',
                    foreignField: '_id',
                    as: 'confirmations'
                }
            },
            {
                $lookup: {
                    from: 'sentopinion',
                    localField: 'sentopinions',
                    foreignField: '_id',
                    as: 'sentopinions'
                }
            },
            {
                $lookup: {
                    from: 'sentvils',
                    localField: 'sentvils',
                    foreignField: '_id',
                    as: 'sentvils'
                }
            },
            {
                $project: {
                    "_id": 0,
                    "Company Name": "$companyname",
                    "UHID": "$uhidcode",
                    "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                    "Patient Name": "$name",
                    "Entry Date": { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    "Entry Time": { $dateToString: { format: "%H:%M", date: "$date", timezone: "Asia/Kolkata" } },
                    "Closed Date": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: {
                                $dateToString:
                                {
                                    format: "%Y-%m-%d", date: "$closedDate"
                                }
                            }
                        }
                    },
                    "Closed Time": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: {
                                $dateToString:
                                {
                                    format: "%H:%M", date: "$closedDate", timezone: "Asia/Kolkata" 
                                }
                            }
                        }
                    },

                    "Closed Reason": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: "$closedReason"
                        }
                    },
                    "Status": "$currentstatus",
                    "Gender": {
                        $cond: {
                            if: { $eq: ["$gender", ""] },
                            then: "-",
                            else: "$gender"
                        }
                    },
                    "Age": {
                        $cond: {
                            if: { $eq: ["$age", ""] },
                            then: "-",
                            else: "$age"
                        }
                    },
                    "Mobile No": {
                        $cond: {
                            if: { $eq: ["$contact", ""] },
                            then: "-",
                            else: "$contact"
                        }
                    },
                    "Email Id": {
                        $cond: {
                            if: { $eq: ["$emailid", ""] },
                            then: "-",
                            else: "$emailid"
                        }
                    },
                    "Country": "$country",
                    "Treatment": {
                        $cond: {
                            if: { $eq: ["$treatment", ""] },
                            then: "-",
                            else: "$treatment"
                        }
                    },
                    "Referral Partner": {
                        $cond: {
                            if: { $eq: ["$refferalpartner", "NAN"] },
                            then: "NAN",
                            else: "$refferalpartner.name"
                        }
                    },

                    "preintimation": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "preintimationtime": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                            }
                        }
                    },
                    "opdrequested": {

                        $map: {
                            input: "$opdrequest",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }

                    },
                    "opdresponse": {

                        $map: {
                            input: "$opdresponse",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }

                    },
                    "sentopinions": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.opnionPdf"
                            }
                        }

                    },
                    "opinionDate": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "vilDate": {

                        $map: {
                            input: "$sentvils",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "vilTime": {

                        $map: {
                            input: "$sentvils",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "sentDocPdf": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.doctorPdf"
                            }
                        }

                    },
                    "pirequest": {
                        $map: {
                            input: "$pirequests",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "piresponse": {
                        $map: {
                            input: "$piresponses",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "opinionrequest": {
                        $map: {
                            input: "$request",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "opinionreceived": {
                        $map: {
                            input: "$received",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "vilrequest": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "vilresponse": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "confiramtion": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "vilLetter": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                location: "$$up.villetter.location"
                            }
                        }
                    },

                    "patientProfile": {
                        $map: {
                            input: "$patientProfile",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                    "ticket": {
                        $map: {
                            input: "$confirmations.ticket",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                    "passports": {
                        $map: {
                            input: "$requestvils.passports",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                },


            },
            {
                $addFields: {

                    "opinionDate": { $dateToString: { format: "%Y-%m-%d", date: { $arrayElemAt: ["$opinionDate.location", 0] } } },
                    "opinionTime": { $dateToString: { format: "%H:%M", date: { $arrayElemAt: ["$opinionDate.location", 0] }, timezone: "Asia/Kolkata" } },
                    "vilDate": { $dateToString: { format: "%Y-%m-%d", date: { $arrayElemAt: ["$vilDate.location", 0] } } },
                    "vilTime": { $dateToString: { format: "%H:%M", date: { $arrayElemAt: ["$vilTime.location", 0] }, timezone: "Asia/Kolkata" } },
                    "Ticket Copy": {
                        $cond: {
                            if: {
                                $eq: ["$ticket", []]
                            },
                            then: "",
                            else: '$ticket.location',

                        }
                    },
                    "Passports": {
                        $cond: {
                            if: {
                                $eq: ["$passports", []]
                            },
                            then: "",
                            else: '$passports.location',

                        }
                    },
                    "Sent Opinions": {
                        $cond: {
                            if: {
                                $eq: ["$sentopinions", []]
                            },
                            then: "",
                            else: '$sentopinions.location',

                        }
                    },
                    "Doctor Profile": {
                        $cond: {
                            if: {
                                $eq: ["$sentDocPdf", []]
                            },
                            then: "",
                            else: '$sentDocPdf.location',

                        }
                    },
                }
            },
            {
                $addFields: {
                    // "Pre Intimation Sent Hospital": {
                    //     '$reduce': {
                    //         'input': '$preintimation.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Pre Intimation Time": {
                    //     '$reduce': {
                    //         'input': '$preintimationtime.date',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "OPD Request Hospital": {
                    //     '$reduce': {
                    //         'input': '$opdrequested.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "OPD Response Hospital": {
                    //     '$reduce': {
                    //         'input': '$opdresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Opinion request hospital assigned": {
                    //     '$reduce': {
                    //         'input': '$opinionrequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Opinion received from Hospital": {
                    //     '$reduce': {
                    //         'input': '$opinionreceived.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Proforma Invoice Request": {
                    //     '$reduce': {
                    //         'input': '$pirequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Proforma Invoice Response": {
                    //     '$reduce': {
                    //         'input': '$piresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "VIL Request to Hospital": {
                    //     '$reduce': {
                    //         'input': '$vilrequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "VIL received": {
                    //     '$reduce': {
                    //         'input': '$vilresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Confiramtion": {
                    //     '$reduce': {
                    //         'input': '$confiramtion.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    "Patient Report": {
                        '$reduce': {
                            'input': '$patientProfile.location',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    "Vil Letter": {
                        '$reduce': {
                            'input': '$vilLetter.location',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },

                }
            },
            {
                $project: {
                    opinionrequest: 0,
                    opinionreceived: 0,
                    preintimation: 0,
                    preintimationtime: 0,
                    opdrequested: 0,
                    opdresponse: 0,
                    pirequest: 0,
                    piresponse: 0,
                    vilrequest: 0,
                    vilresponse: 0,
                    vilLetter: 0,
                    patientProfile: 0,
                    confiramtion: 0,
                    ticket: 0,
                    passports: 0,
                    sentopinions: 0,
                    sentDocPdf: 0,

                    user: 0
                }
            },



            ]
            var pipeline2 = [{
                $match: {
                    user: ObjectId(userid),
                    date: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    branchoffice: req.body.branchoffice


                }
            },
            {
                $lookup: {
                    from: 'request',
                    localField: 'requests',
                    foreignField: '_id',
                    as: 'request',

                }
            },
            {
                $lookup: {
                    from: 'received',
                    localField: 'receives',
                    foreignField: '_id',
                    as: 'received'
                }
            },
            {
                $lookup: {
                    from: 'preintimation',
                    localField: 'preintimations',
                    foreignField: '_id',
                    as: 'preintimation'
                }
            },
            {
                $lookup: {
                    from: 'opdrequest',
                    localField: 'opdrequests',
                    foreignField: '_id',
                    as: 'opdrequest'
                }
            },
            {
                $lookup: {
                    from: 'opdresponse',
                    localField: 'opdresponses',
                    foreignField: '_id',
                    as: 'opdresponse'
                }
            },
            {
                $lookup: {
                    from: 'pirequest',
                    localField: 'pirequests',
                    foreignField: '_id',
                    as: 'pirequests'
                }
            },
            {
                $lookup: {
                    from: 'piresponse',
                    localField: 'piresponses',
                    foreignField: '_id',
                    as: 'piresponses'
                }
            },
            {
                $lookup: {
                    from: 'requestvil',
                    localField: 'requestvils',
                    foreignField: '_id',
                    as: 'requestvils'
                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    localField: 'responsevils',
                    foreignField: '_id',
                    as: 'responsevils'
                }
            },
            {
                $lookup: {
                    from: 'confirmation',
                    localField: 'confirmations',
                    foreignField: '_id',
                    as: 'confirmations'
                }
            },
            {
                $lookup: {
                    from: 'sentopinion',
                    localField: 'sentopinions',
                    foreignField: '_id',
                    as: 'sentopinions'
                }
            },
            {
                $project: {
                    "_id": 0,
                    "patientName": "$name",
                    "Gender": {
                        $cond: {
                            if: { $eq: ["$gender", ""] },
                            then: "-",
                            else: "$gender"
                        }
                    },
                    "Age": {
                        $cond: {
                            if: { $eq: ["$age", ""] },
                            then: "-",
                            else: "$age"
                        }
                    },

                    "Treatment": {
                        $cond: {
                            if: { $eq: ["$treatment", ""] },
                            then: "-",
                            else: "$treatment"
                        }
                    },
                    "UHID": "$uhidcode",
                    "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                    "preintimation": 1,
                    "opdrequest": 1,
                    "opdresponse": 1,
                    "pirequests": 1,
                    "piresponses": 1,
                    "request": 1,
                    "received": 1,
                    "requestvils": 1,
                    "responsevils": 1,
                    "confirmations": 1,


                }
            },
            {
                $project: {


                    // "Referral Partner": {
                    //     $cond: {
                    //         if: { $eq: ["$refferalpartner", "NAN"] },
                    //         then: "NAN",
                    //         else: "$refferalpartner.name"
                    //     }
                    // },

                    "preintimation": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                preintimation: "Yes",
                                uhid: "$Company UHID",
                                UHID: "$UHID",

                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                intimationSentDate: "$$up.createdAt",

                            }
                        }
                    },
                    // "preintimationtime": {
                    //     $map: {
                    //         input: "$preintimation",
                    //         as: "up",
                    //         in: {
                    //             date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                    //         }
                    //     }
                    // },
                    "opdrequested": {

                        $map: {
                            input: "$opdrequest",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opdrequested: "Yes",
                                uhid: "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                opdSentDate: "$$up.createdAt",



                            }
                        }

                    },
                    "opdresponse": {

                        $map: {
                            input: "$opdresponse",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opdresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                meetinglink: "$$up.meetinglink",
                                paymentlink: "$$up.paymentlink",
                                opddoctorname: "$$up.doctorname",



                            }
                        }

                    },

                    // "sentDocPdf": {

                    //     $map: {
                    //         input: "$sentopinions",
                    //         as: "up",
                    //         in: {
                    //             location: "$$up.doctorPdf",


                    //         }
                    //     }

                    // },
                    "pirequest": {
                        $map: {
                            input: "$pirequests",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                pirequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                piSentDate: "$$up.createdAt",


                            }
                        }
                    },
                    "piresponse": {
                        $map: {
                            input: "$piresponses",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                piresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },
                    "opinionrequest": {
                        $map: {
                            input: "$request",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                opinionSentDate: "$$up.createdAt",
                                hospitalid: "$$up.hospitalid",
                                opinionrequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",


                            }
                        }
                    },

                    "opinionreceived": {
                        $map: {
                            input: "$received",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opinionreceived: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                diagnosis: "$$up.diagnosis",
                                treatmentplan: "$$up.treatmentplan",
                                stayincountry: "$$up.stayincountry",
                                countryduration: "$$up.countryduration",
                                stayinhospital: "$$up.stayinhospital",
                                hospitalduration: "$$up.hospitalduration",
                                initialevaluationminimum: "$$up.initialevaluationminimum",
                                initialevaluationmaximum: "$$up.initialevaluationmaximum",
                                remarks: "$$up.remarks",
                                treatment: "$$up.treatment",


                            }
                        }
                    },

                    "vilrequest": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                vilrequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                vilSentDate: "$$up.createdAt",



                            }
                        }
                    },
                    "vilresponse": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                vilresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },

                    "confiramtion": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                confiramtion: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                confSentDate: "$$up.createdAt",
                                arrivaldate: "$$up.arrivaldate",
                                confRemarks: "$$up.remarks",
                                cabs: "$$up.cabs",
                                flightName: "$$up.flightName",
                                flightNo: "$$up.flightNo",
                                contactPerson: "$$up.contactPerson",
                                contactPersonNo: "$$up.contactPersonNo",
                                coordinatorAddress: "$$up.coordinatorAddress",


                            }
                        }
                    },
                    "vilLetter": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                vilDoc: "$$up.villetter.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                vilLetter: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",




                            }
                        }
                    },
                    "ticket": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                ticketDoc: "$$up.ticket.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                ticket: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },
                    "passports": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                passportDoc: "$$up.passports.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                passports: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",




                            }
                        }
                    },
                },


            },

            {
                $project: {
                    mergedArray: {
                        $concatArrays: ["$preintimation", "$opdrequested", "$opdresponse", "$pirequest", "$piresponse", "$opinionrequest", "$opinionreceived", "$vilrequest", "$vilresponse", "$confiramtion", "$vilLetter", "$ticket", "$passports"],
                    }
                }
            },
            {
                $unwind: "$mergedArray"
            },


            {
                $group: {
                    _id: {
                        hospitalId: "$mergedArray.hospitalid",
                        hospitalname: "$mergedArray.hospitalname",


                    },
                    data: {
                        $push: {
                            opinionSentDate: "$mergedArray.opinionSentDate",
                            intimationSentDate: "$mergedArray.intimationSentDate",
                            opdSentDate: "$mergedArray.opdSentDate",
                            piSentDate: "$mergedArray.piSentDate",
                            vilSentDate: "$mergedArray.vilSentDate",
                            confSentDate: "$mergedArray.confSentDate",
                            preintimation: "$mergedArray.preintimation",
                            opdrequested: "$mergedArray.opdrequested",
                            opdresponse: "$mergedArray.opdresponse",
                            pirequest: "$mergedArray.pirequest",
                            piresponse: "$mergedArray.piresponse",
                            opinionrequest: "$mergedArray.opinionrequest",

                            meetinglink: "$mergedArray.meetinglink",
                            paymentlink: "$mergedArray.paymentlink",
                            opddoctorname: "$mergedArray.opddoctorname",
                            opinionreceived: "$mergedArray.opinionreceived",
                            vilrequest: "$mergedArray.vilrequest",
                            vilresponse: "$mergedArray.vilresponse",
                            confiramtion: "$mergedArray.confiramtion",
                            vilLetter: "$mergedArray.vilDoc",
                            ticket: "$mergedArray.ticketDoc",
                            passports: "$mergedArray.passportDoc",
                            "uhid": "$mergedArray.uhid",
                            UHID: "$mergedArray.UHID",

                            "patientName": "$mergedArray.patientName",
                            "Age": "$mergedArray.Age",
                            "Gender": "$mergedArray.Gender",
                            "Treatment": "$mergedArray.Treatment",
                            diagnosis: "$mergedArray.diagnosis",
                            treatmentplan: "$mergedArray.treatmentplan",
                            stayincountry: "$mergedArray.stayincountry",
                            countryduration: "$mergedArray.countryduration",
                            stayinhospital: "$mergedArray.stayinhospital",
                            hospitalduration: "$mergedArray.hospitalduration",
                            initialevaluationminimum: "$mergedArray.initialevaluationminimum",
                            initialevaluationmaximum: "$mergedArray.initialevaluationmaximum",
                            remarks: "$mergedArray.remarks",
                            treatmentOpinion: "$mergedArray.treatment",

                            confRemarks: "$mergedArray.confRemarks",
                            cabs: "$mergedArray.cabs",
                            flightName: "$mergedArray.flightName",
                            flightNo: "$mergedArray.flightNo",
                            contactPerson: "$mergedArray.contactPerson",
                            contactPersonNo: "$mergedArray.contactPersonNo",
                            coordinatorAddress: "$mergedArray.coordinatorAddress",
                        }

                    },
                }
            },
            {
                $unwind: "$data"
            },

            {
                $group: {
                    _id: {
                        _id: "$_id",
                        uhid: "$data.uhid"
                    },
                    preintimation: { $first: "$preintimation" },
                    opdrequested: { $first: "$opdrequested" },
                    opdresponse: { $first: "$opdresponse" },
                    pirequest: { $first: "$pirequest" },
                    piresponse: { $first: "$piresponse" },
                    opinionrequest: { $first: "$opinionrequest" },
                    opinionSentDate: { $first: "$opinionSentDate" },
                    opinionSentTime: { $first: "$opinionSentTime" },
                    opinionreceived: { $first: "$opinionreceived" },
                    vilrequest: { $first: "$vilrequest" },
                    vilresponse: { $first: "$vilresponse" },
                    confiramtion: { $first: "$confiramtion" },
                    vilLetter: { $first: "$vilLetter" },
                    ticket: { $first: "$ticket" },
                    passports: { $first: "$passports" },
                    "patient Name": { $first: "$patientName" },
                    Age: { $first: "$Age" },
                    Gender: { $first: "$Gender" },
                    Treatment: { $first: "$Treatment" },
                    data: { $mergeObjects: "$data" }
                }
            },
            {
                $group: {
                    _id: "$_id._id",
                    data: { $push: "$data" }
                }
            },
                // {
                //     $addFields:{
                //         "opinionSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data[0].opinionSentDate" } },
                //         // "data.opinionSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.opinionSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.intimationSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.intimationSentDate" } },
                //         // "data.intimationSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.intimationSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.opdSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.opdSentDate" } },
                //         // "data.opdSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.opdSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.piSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.piSentDate" } },
                //         // "data.piSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.piSentDate", timezone: "Asia/Kolkata" } },
                //         // "data.vilSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.vilSentDate" } },
                //         // "data.vilSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.vilSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.confSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.confSentDate" } },
                //         // "data.confSentTIme":  { $dateToString:{ format: "%H:%M", date: "$data.confSentDate", timezone: "Asia/Kolkata" } },
                //     }
                // },
                //             {
                //                 $addFields: {


                //                     "Ticket Copy": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$ticket", []]
                //                             },
                //                             then: "",
                //                             else: '$ticket.location',

                //                         }
                //                     },
                //                     "Passports": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$passports", []]
                //                             },
                //                             then: "",
                //                             else: '$passports.location',

                //                         }
                //                     },
                //                     "Sent Opinions": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$sentopinions", []]
                //                             },
                //                             then: "",
                //                             else: '$sentopinions.location',

                //                         }
                //                     },
                //                     "Doctor Profile": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$sentDocPdf", []]
                //                             },
                //                             then: "",
                //                             else: '$sentDocPdf.location',

                //                         }
                //                     },
                //                 }
                //             },
                //             {
                //                 $addFields: {
                //                     "Pre Intimation Sent Hospital": {
                //                         '$reduce': {
                //                             'input': '$preintimation.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Pre Intimation Time": {
                //                         '$reduce': {
                //                             'input': '$preintimationtime.date',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "OPD Request Hospital": {
                //                         '$reduce': {
                //                             'input': '$opdrequested.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "OPD Response Hospital": {
                //                         '$reduce': {
                //                             'input': '$opdresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Opinion request hospital assigned": {
                //                         '$reduce': {
                //                             'input': '$opinionrequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Opinion received from Hospital": {
                //                         '$reduce': {
                //                             'input': '$opinionreceived.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Proforma Invoice Request": {
                //                         '$reduce': {
                //                             'input': '$pirequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Proforma Invoice Response": {
                //                         '$reduce': {
                //                             'input': '$piresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "VIL Request to Hospital": {
                //                         '$reduce': {
                //                             'input': '$vilrequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "VIL received": {
                //                         '$reduce': {
                //                             'input': '$vilresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Confiramtion": {
                //                         '$reduce': {
                //                             'input': '$confiramtion.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     // "Patient Report": {
                //                     //     '$reduce': {
                //                     //         'input': '$patientProfile.location',
                //                     //         'initialValue': '',
                //                     //         'in': {
                //                     //             '$concat': [
                //                     //                 '$$value',
                //                     //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                     //                 '$$this'
                //                     //             ]
                //                     //         }
                //                     //     }
                //                     // },
                //                     "Vil Letter": {
                //                         '$reduce': {
                //                             'input': '$vilLetter.location',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },

                //                 }
                //             },
                //             {
                //                 $project: {
                //                     opinionrequest: 0,
                //                     opinionreceived: 0,
                //                     preintimation: 0,
                //                     preintimationtime: 0,
                //                     opdrequested: 0,
                //                     opdresponse: 0,
                //                     pirequest: 0,
                //                     piresponse: 0,
                //                     vilrequest: 0,
                //                     vilresponse: 0,
                //                     vilLetter: 0,
                //                     patientProfile: 0,
                //                     confiramtion: 0,
                //                     ticket: 0,
                //                     passports: 0,
                //                     sentopinions: 0,
                //                     sentDocPdf: 0,

                // user:0                    }
                //             },



            ]
        } else if (req.body.role['Role'] == "Refferal Partner") {
            var pipeline = [{
                $match: {
                    user: ObjectId(userid),
                    date: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    "refferalpartner._id": req.body.refferalpartner._id


                }
            },
            {
                $lookup: {
                    from: 'request',
                    localField: 'requests',
                    foreignField: '_id',
                    as: 'request',

                }
            },
            {
                $lookup: {
                    from: 'received',
                    localField: 'receives',
                    foreignField: '_id',
                    as: 'received'
                }
            },
            {
                $lookup: {
                    from: 'preintimation',
                    localField: 'preintimations',
                    foreignField: '_id',
                    as: 'preintimation'
                }
            },
            {
                $lookup: {
                    from: 'opdrequest',
                    localField: 'opdrequests',
                    foreignField: '_id',
                    as: 'opdrequest'
                }
            },
            {
                $lookup: {
                    from: 'opdresponse',
                    localField: 'opdresponses',
                    foreignField: '_id',
                    as: 'opdresponse'
                }
            },
            {
                $lookup: {
                    from: 'pirequest',
                    localField: 'pirequests',
                    foreignField: '_id',
                    as: 'pirequests'
                }
            },
            {
                $lookup: {
                    from: 'piresponse',
                    localField: 'piresponses',
                    foreignField: '_id',
                    as: 'piresponses'
                }
            },
            {
                $lookup: {
                    from: 'requestvil',
                    localField: 'requestvils',
                    foreignField: '_id',
                    as: 'requestvils'
                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    localField: 'responsevils',
                    foreignField: '_id',
                    as: 'responsevils'
                }
            },
            {
                $lookup: {
                    from: 'confirmation',
                    localField: 'confirmations',
                    foreignField: '_id',
                    as: 'confirmations'
                }
            },
            {
                $lookup: {
                    from: 'sentopinion',
                    localField: 'sentopinions',
                    foreignField: '_id',
                    as: 'sentopinions'
                }
            },
            {
                $lookup: {
                    from: 'sentvils',
                    localField: 'sentvils',
                    foreignField: '_id',
                    as: 'sentvils'
                }
            },
            {
                $project: {
                    "_id": 0,
                    "Company Name": "$companyname",
                    "UHID": "$uhidcode",
                    "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                    "Patient Name": "$name",
                    "Entry Date": { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    "Entry Time": { $dateToString: { format: "%H:%M", date: "$date", timezone: "Asia/Kolkata" } },
                    "Closed Date": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: {
                                $dateToString:
                                {
                                    format: "%Y-%m-%d", date: "$closedDate"
                                }
                            }
                        }
                    },
                    "Closed Time": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: {
                                $dateToString:
                                {
                                    format: "%H:%M", date: "$closedDate", timezone: "Asia/Kolkata" 
                                }
                            }
                        }
                    },

                    "Closed Reason": {
                        $cond: {
                            if: { $eq: ["$queryClosed", false] },
                            then: "-",
                            else: "$closedReason"
                        }
                    },
                    "Status": "$currentstatus",
                    "Gender": {
                        $cond: {
                            if: { $eq: ["$gender", ""] },
                            then: "-",
                            else: "$gender"
                        }
                    },
                    "Age": {
                        $cond: {
                            if: { $eq: ["$age", ""] },
                            then: "-",
                            else: "$age"
                        }
                    },
                    "Mobile No": {
                        $cond: {
                            if: { $eq: ["$contact", ""] },
                            then: "-",
                            else: "$contact"
                        }
                    },
                    "Email Id": {
                        $cond: {
                            if: { $eq: ["$emailid", ""] },
                            then: "-",
                            else: "$emailid"
                        }
                    },
                    "Country": "$country",
                    "Treatment": {
                        $cond: {
                            if: { $eq: ["$treatment", ""] },
                            then: "-",
                            else: "$treatment"
                        }
                    },
                    "Referral Partner": {
                        $cond: {
                            if: { $eq: ["$refferalpartner", "NAN"] },
                            then: "NAN",
                            else: "$refferalpartner.name"
                        }
                    },

                    "preintimation": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "preintimationtime": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                            }
                        }
                    },
                    "opdrequested": {

                        $map: {
                            input: "$opdrequest",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }

                    },
                    "opdresponse": {

                        $map: {
                            input: "$opdresponse",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }

                    },
                    "sentopinions": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.opnionPdf"
                            }
                        }

                    },
                    "opinionDate": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "vilDate": {

                        $map: {
                            input: "$sentvils",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "vilTime": {

                        $map: {
                            input: "$sentvils",
                            as: "up",
                            in: {
                                location: "$$up.createdAt"
                            }
                        }

                    },
                    "sentDocPdf": {

                        $map: {
                            input: "$sentopinions",
                            as: "up",
                            in: {
                                location: "$$up.doctorPdf"
                            }
                        }

                    },
                    "pirequest": {
                        $map: {
                            input: "$pirequests",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "piresponse": {
                        $map: {
                            input: "$piresponses",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "opinionrequest": {
                        $map: {
                            input: "$request",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "opinionreceived": {
                        $map: {
                            input: "$received",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "vilrequest": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "vilresponse": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },

                    "confiramtion": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname"
                            }
                        }
                    },
                    "vilLetter": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                location: "$$up.villetter.location"
                            }
                        }
                    },

                    "patientProfile": {
                        $map: {
                            input: "$patientProfile",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                    "ticket": {
                        $map: {
                            input: "$confirmations.ticket",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                    "passports": {
                        $map: {
                            input: "$requestvils.passports",
                            as: "up",
                            in: {
                                location: "$$up.location"
                            }
                        }
                    },
                },


            },
            {
                $addFields: {

                    "opinionDate": { $dateToString: { format: "%Y-%m-%d", date: { $arrayElemAt: ["$opinionDate.location", 0] } } },
                    "opinionTime": { $dateToString: { format: "%H:%M", date: { $arrayElemAt: ["$opinionDate.location", 0] }, timezone: "Asia/Kolkata" } },
                    "vilDate": { $dateToString: { format: "%Y-%m-%d", date: { $arrayElemAt: ["$vilDate.location", 0] } } },
                    "vilTime": { $dateToString: { format: "%H:%M", date: { $arrayElemAt: ["$vilTime.location", 0] }, timezone: "Asia/Kolkata" } },
                    "Ticket Copy": {
                        $cond: {
                            if: {
                                $eq: ["$ticket", []]
                            },
                            then: "",
                            else: '$ticket.location',

                        }
                    },
                    "Passports": {
                        $cond: {
                            if: {
                                $eq: ["$passports", []]
                            },
                            then: "",
                            else: '$passports.location',

                        }
                    },
                    "Sent Opinions": {
                        $cond: {
                            if: {
                                $eq: ["$sentopinions", []]
                            },
                            then: "",
                            else: '$sentopinions.location',

                        }
                    },
                    "Doctor Profile": {
                        $cond: {
                            if: {
                                $eq: ["$sentDocPdf", []]
                            },
                            then: "",
                            else: '$sentDocPdf.location',

                        }
                    },
                }
            },
            {
                $addFields: {
                    // "Pre Intimation Sent Hospital": {
                    //     '$reduce': {
                    //         'input': '$preintimation.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Pre Intimation Time": {
                    //     '$reduce': {
                    //         'input': '$preintimationtime.date',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "OPD Request Hospital": {
                    //     '$reduce': {
                    //         'input': '$opdrequested.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "OPD Response Hospital": {
                    //     '$reduce': {
                    //         'input': '$opdresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Opinion request hospital assigned": {
                    //     '$reduce': {
                    //         'input': '$opinionrequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Opinion received from Hospital": {
                    //     '$reduce': {
                    //         'input': '$opinionreceived.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Proforma Invoice Request": {
                    //     '$reduce': {
                    //         'input': '$pirequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Proforma Invoice Response": {
                    //     '$reduce': {
                    //         'input': '$piresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "VIL Request to Hospital": {
                    //     '$reduce': {
                    //         'input': '$vilrequest.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "VIL received": {
                    //     '$reduce': {
                    //         'input': '$vilresponse.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    // "Confiramtion": {
                    //     '$reduce': {
                    //         'input': '$confiramtion.hospitalname',
                    //         'initialValue': '',
                    //         'in': {
                    //             '$concat': [
                    //                 '$$value',
                    //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                    //                 '$$this'
                    //             ]
                    //         }
                    //     }
                    // },
                    "Patient Report": {
                        '$reduce': {
                            'input': '$patientProfile.location',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    "Vil Letter": {
                        '$reduce': {
                            'input': '$vilLetter.location',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },

                }
            },
            {
                $project: {
                    opinionrequest: 0,
                    opinionreceived: 0,
                    preintimation: 0,
                    preintimationtime: 0,
                    opdrequested: 0,
                    opdresponse: 0,
                    pirequest: 0,
                    piresponse: 0,
                    vilrequest: 0,
                    vilresponse: 0,
                    vilLetter: 0,
                    patientProfile: 0,
                    confiramtion: 0,
                    ticket: 0,
                    passports: 0,
                    sentopinions: 0,
                    sentDocPdf: 0,

                    user: 0
                }
            },



            ]
            var pipeline2 = [{
                $match: {
                    user: ObjectId(userid),
                    date: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    "refferalpartner._id": req.body.refferalpartner._id


                }
            },
            {
                $lookup: {
                    from: 'request',
                    localField: 'requests',
                    foreignField: '_id',
                    as: 'request',

                }
            },
            {
                $lookup: {
                    from: 'received',
                    localField: 'receives',
                    foreignField: '_id',
                    as: 'received'
                }
            },
            {
                $lookup: {
                    from: 'preintimation',
                    localField: 'preintimations',
                    foreignField: '_id',
                    as: 'preintimation'
                }
            },
            {
                $lookup: {
                    from: 'opdrequest',
                    localField: 'opdrequests',
                    foreignField: '_id',
                    as: 'opdrequest'
                }
            },
            {
                $lookup: {
                    from: 'opdresponse',
                    localField: 'opdresponses',
                    foreignField: '_id',
                    as: 'opdresponse'
                }
            },
            {
                $lookup: {
                    from: 'pirequest',
                    localField: 'pirequests',
                    foreignField: '_id',
                    as: 'pirequests'
                }
            },
            {
                $lookup: {
                    from: 'piresponse',
                    localField: 'piresponses',
                    foreignField: '_id',
                    as: 'piresponses'
                }
            },
            {
                $lookup: {
                    from: 'requestvil',
                    localField: 'requestvils',
                    foreignField: '_id',
                    as: 'requestvils'
                }
            },
            {
                $lookup: {
                    from: 'responsevil',
                    localField: 'responsevils',
                    foreignField: '_id',
                    as: 'responsevils'
                }
            },
            {
                $lookup: {
                    from: 'confirmation',
                    localField: 'confirmations',
                    foreignField: '_id',
                    as: 'confirmations'
                }
            },
            {
                $lookup: {
                    from: 'sentopinion',
                    localField: 'sentopinions',
                    foreignField: '_id',
                    as: 'sentopinions'
                }
            },
            {
                $project: {
                    "_id": 0,
                    "patientName": "$name",
                    "Gender": {
                        $cond: {
                            if: { $eq: ["$gender", ""] },
                            then: "-",
                            else: "$gender"
                        }
                    },
                    "Age": {
                        $cond: {
                            if: { $eq: ["$age", ""] },
                            then: "-",
                            else: "$age"
                        }
                    },

                    "Treatment": {
                        $cond: {
                            if: { $eq: ["$treatment", ""] },
                            then: "-",
                            else: "$treatment"
                        }
                    },
                    "UHID": "$uhidcode",
                    "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                    "preintimation": 1,
                    "opdrequest": 1,
                    "opdresponse": 1,
                    "pirequests": 1,
                    "piresponses": 1,
                    "request": 1,
                    "received": 1,
                    "requestvils": 1,
                    "responsevils": 1,
                    "confirmations": 1,


                }
            },
            {
                $project: {


                    // "Referral Partner": {
                    //     $cond: {
                    //         if: { $eq: ["$refferalpartner", "NAN"] },
                    //         then: "NAN",
                    //         else: "$refferalpartner.name"
                    //     }
                    // },

                    "preintimation": {
                        $map: {
                            input: "$preintimation",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                preintimation: "Yes",
                                uhid: "$Company UHID",
                                UHID: "$UHID",

                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                intimationSentDate: "$$up.createdAt",

                            }
                        }
                    },
                    // "preintimationtime": {
                    //     $map: {
                    //         input: "$preintimation",
                    //         as: "up",
                    //         in: {
                    //             date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                    //         }
                    //     }
                    // },
                    "opdrequested": {

                        $map: {
                            input: "$opdrequest",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opdrequested: "Yes",
                                uhid: "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                opdSentDate: "$$up.createdAt",



                            }
                        }

                    },
                    "opdresponse": {

                        $map: {
                            input: "$opdresponse",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opdresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                meetinglink: "$$up.meetinglink",
                                paymentlink: "$$up.paymentlink",
                                opddoctorname: "$$up.doctorname",



                            }
                        }

                    },

                    // "sentDocPdf": {

                    //     $map: {
                    //         input: "$sentopinions",
                    //         as: "up",
                    //         in: {
                    //             location: "$$up.doctorPdf",


                    //         }
                    //     }

                    // },
                    "pirequest": {
                        $map: {
                            input: "$pirequests",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                pirequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                piSentDate: "$$up.createdAt",


                            }
                        }
                    },
                    "piresponse": {
                        $map: {
                            input: "$piresponses",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                piresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },
                    "opinionrequest": {
                        $map: {
                            input: "$request",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                opinionSentDate: "$$up.createdAt",
                                hospitalid: "$$up.hospitalid",
                                opinionrequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",


                            }
                        }
                    },

                    "opinionreceived": {
                        $map: {
                            input: "$received",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                opinionreceived: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                diagnosis: "$$up.diagnosis",
                                treatmentplan: "$$up.treatmentplan",
                                stayincountry: "$$up.stayincountry",
                                countryduration: "$$up.countryduration",
                                stayinhospital: "$$up.stayinhospital",
                                hospitalduration: "$$up.hospitalduration",
                                initialevaluationminimum: "$$up.initialevaluationminimum",
                                initialevaluationmaximum: "$$up.initialevaluationmaximum",
                                remarks: "$$up.remarks",
                                treatment: "$$up.treatment",


                            }
                        }
                    },

                    "vilrequest": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                vilrequest: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                vilSentDate: "$$up.createdAt",



                            }
                        }
                    },
                    "vilresponse": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                vilresponse: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },

                    "confiramtion": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                hospitalname: "$$up.hospitalname",
                                hospitalid: "$$up.hospitalid",
                                confiramtion: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",
                                confSentDate: "$$up.createdAt",
                                arrivaldate: "$$up.arrivaldate",
                                confRemarks: "$$up.remarks",
                                cabs: "$$up.cabs",
                                flightName: "$$up.flightName",
                                flightNo: "$$up.flightNo",
                                contactPerson: "$$up.contactPerson",
                                contactPersonNo: "$$up.contactPersonNo",
                                coordinatorAddress: "$$up.coordinatorAddress",


                            }
                        }
                    },
                    "vilLetter": {
                        $map: {
                            input: "$responsevils",
                            as: "up",
                            in: {
                                vilDoc: "$$up.villetter.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                vilLetter: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",




                            }
                        }
                    },
                    "ticket": {
                        $map: {
                            input: "$confirmations",
                            as: "up",
                            in: {
                                ticketDoc: "$$up.ticket.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                ticket: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",



                            }
                        }
                    },
                    "passports": {
                        $map: {
                            input: "$requestvils",
                            as: "up",
                            in: {
                                passportDoc: "$$up.passports.location",
                                hospitalid: "$$up.hospitalid",
                                hospitalname: "$$up.hospitalname",
                                passports: "Yes",
                                "uhid": "$Company UHID",
                                UHID: "$UHID",
                                patientName: "$patientName",
                                Gender: "$Gender",
                                Treatment: "$Treatment",
                                Age: "$Age",




                            }
                        }
                    },
                },


            },

            {
                $project: {
                    mergedArray: {
                        $concatArrays: ["$preintimation", "$opdrequested", "$opdresponse", "$pirequest", "$piresponse", "$opinionrequest", "$opinionreceived", "$vilrequest", "$vilresponse", "$confiramtion", "$vilLetter", "$ticket", "$passports"],
                    }
                }
            },
            {
                $unwind: "$mergedArray"
            },


            {
                $group: {
                    _id: {
                        hospitalId: "$mergedArray.hospitalid",
                        hospitalname: "$mergedArray.hospitalname",


                    },
                    data: {
                        $push: {
                            opinionSentDate: "$mergedArray.opinionSentDate",
                            intimationSentDate: "$mergedArray.intimationSentDate",
                            opdSentDate: "$mergedArray.opdSentDate",
                            piSentDate: "$mergedArray.piSentDate",
                            vilSentDate: "$mergedArray.vilSentDate",
                            confSentDate: "$mergedArray.confSentDate",
                            preintimation: "$mergedArray.preintimation",
                            opdrequested: "$mergedArray.opdrequested",
                            opdresponse: "$mergedArray.opdresponse",
                            pirequest: "$mergedArray.pirequest",
                            piresponse: "$mergedArray.piresponse",
                            opinionrequest: "$mergedArray.opinionrequest",

                            meetinglink: "$mergedArray.meetinglink",
                            paymentlink: "$mergedArray.paymentlink",
                            opddoctorname: "$mergedArray.opddoctorname",
                            opinionreceived: "$mergedArray.opinionreceived",
                            vilrequest: "$mergedArray.vilrequest",
                            vilresponse: "$mergedArray.vilresponse",
                            confiramtion: "$mergedArray.confiramtion",
                            vilLetter: "$mergedArray.vilDoc",
                            ticket: "$mergedArray.ticketDoc",
                            passports: "$mergedArray.passportDoc",
                            "uhid": "$mergedArray.uhid",
                            UHID: "$mergedArray.UHID",

                            "patientName": "$mergedArray.patientName",
                            "Age": "$mergedArray.Age",
                            "Gender": "$mergedArray.Gender",
                            "Treatment": "$mergedArray.Treatment",
                            diagnosis: "$mergedArray.diagnosis",
                            treatmentplan: "$mergedArray.treatmentplan",
                            stayincountry: "$mergedArray.stayincountry",
                            countryduration: "$mergedArray.countryduration",
                            stayinhospital: "$mergedArray.stayinhospital",
                            hospitalduration: "$mergedArray.hospitalduration",
                            initialevaluationminimum: "$mergedArray.initialevaluationminimum",
                            initialevaluationmaximum: "$mergedArray.initialevaluationmaximum",
                            remarks: "$mergedArray.remarks",
                            treatmentOpinion: "$mergedArray.treatment",

                            confRemarks: "$mergedArray.confRemarks",
                            cabs: "$mergedArray.cabs",
                            flightName: "$mergedArray.flightName",
                            flightNo: "$mergedArray.flightNo",
                            contactPerson: "$mergedArray.contactPerson",
                            contactPersonNo: "$mergedArray.contactPersonNo",
                            coordinatorAddress: "$mergedArray.coordinatorAddress",
                        }

                    },
                }
            },
            {
                $unwind: "$data"
            },

            {
                $group: {
                    _id: {
                        _id: "$_id",
                        uhid: "$data.uhid"
                    },
                    preintimation: { $first: "$preintimation" },
                    opdrequested: { $first: "$opdrequested" },
                    opdresponse: { $first: "$opdresponse" },
                    pirequest: { $first: "$pirequest" },
                    piresponse: { $first: "$piresponse" },
                    opinionrequest: { $first: "$opinionrequest" },
                    opinionSentDate: { $first: "$opinionSentDate" },
                    opinionSentTime: { $first: "$opinionSentTime" },
                    opinionreceived: { $first: "$opinionreceived" },
                    vilrequest: { $first: "$vilrequest" },
                    vilresponse: { $first: "$vilresponse" },
                    confiramtion: { $first: "$confiramtion" },
                    vilLetter: { $first: "$vilLetter" },
                    ticket: { $first: "$ticket" },
                    passports: { $first: "$passports" },
                    "patient Name": { $first: "$patientName" },
                    Age: { $first: "$Age" },
                    Gender: { $first: "$Gender" },
                    Treatment: { $first: "$Treatment" },
                    data: { $mergeObjects: "$data" }
                }
            },
            {
                $group: {
                    _id: "$_id._id",
                    data: { $push: "$data" }
                }
            },
                // {
                //     $addFields:{
                //         "opinionSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data[0].opinionSentDate" } },
                //         // "data.opinionSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.opinionSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.intimationSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.intimationSentDate" } },
                //         // "data.intimationSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.intimationSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.opdSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.opdSentDate" } },
                //         // "data.opdSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.opdSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.piSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.piSentDate" } },
                //         // "data.piSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.piSentDate", timezone: "Asia/Kolkata" } },
                //         // "data.vilSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.vilSentDate" } },
                //         // "data.vilSentTime":  { $dateToString:{ format: "%H:%M", date: "$data.vilSentDate", timezone: "Asia/Kolkata" } },

                //         // "data.confSentDate": { $dateToString: { format: "%Y-%m-%d", date: "$data.confSentDate" } },
                //         // "data.confSentTIme":  { $dateToString:{ format: "%H:%M", date: "$data.confSentDate", timezone: "Asia/Kolkata" } },
                //     }
                // },
                //             {
                //                 $addFields: {


                //                     "Ticket Copy": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$ticket", []]
                //                             },
                //                             then: "",
                //                             else: '$ticket.location',

                //                         }
                //                     },
                //                     "Passports": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$passports", []]
                //                             },
                //                             then: "",
                //                             else: '$passports.location',

                //                         }
                //                     },
                //                     "Sent Opinions": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$sentopinions", []]
                //                             },
                //                             then: "",
                //                             else: '$sentopinions.location',

                //                         }
                //                     },
                //                     "Doctor Profile": {
                //                         $cond: {
                //                             if: {
                //                                 $eq: ["$sentDocPdf", []]
                //                             },
                //                             then: "",
                //                             else: '$sentDocPdf.location',

                //                         }
                //                     },
                //                 }
                //             },
                //             {
                //                 $addFields: {
                //                     "Pre Intimation Sent Hospital": {
                //                         '$reduce': {
                //                             'input': '$preintimation.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Pre Intimation Time": {
                //                         '$reduce': {
                //                             'input': '$preintimationtime.date',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "OPD Request Hospital": {
                //                         '$reduce': {
                //                             'input': '$opdrequested.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "OPD Response Hospital": {
                //                         '$reduce': {
                //                             'input': '$opdresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Opinion request hospital assigned": {
                //                         '$reduce': {
                //                             'input': '$opinionrequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Opinion received from Hospital": {
                //                         '$reduce': {
                //                             'input': '$opinionreceived.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Proforma Invoice Request": {
                //                         '$reduce': {
                //                             'input': '$pirequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Proforma Invoice Response": {
                //                         '$reduce': {
                //                             'input': '$piresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "VIL Request to Hospital": {
                //                         '$reduce': {
                //                             'input': '$vilrequest.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "VIL received": {
                //                         '$reduce': {
                //                             'input': '$vilresponse.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     "Confiramtion": {
                //                         '$reduce': {
                //                             'input': '$confiramtion.hospitalname',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },
                //                     // "Patient Report": {
                //                     //     '$reduce': {
                //                     //         'input': '$patientProfile.location',
                //                     //         'initialValue': '',
                //                     //         'in': {
                //                     //             '$concat': [
                //                     //                 '$$value',
                //                     //                 { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                     //                 '$$this'
                //                     //             ]
                //                     //         }
                //                     //     }
                //                     // },
                //                     "Vil Letter": {
                //                         '$reduce': {
                //                             'input': '$vilLetter.location',
                //                             'initialValue': '',
                //                             'in': {
                //                                 '$concat': [
                //                                     '$$value',
                //                                     { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                //                                     '$$this'
                //                                 ]
                //                             }
                //                         }
                //                     },

                //                 }
                //             },
                //             {
                //                 $project: {
                //                     opinionrequest: 0,
                //                     opinionreceived: 0,
                //                     preintimation: 0,
                //                     preintimationtime: 0,
                //                     opdrequested: 0,
                //                     opdresponse: 0,
                //                     pirequest: 0,
                //                     piresponse: 0,
                //                     vilrequest: 0,
                //                     vilresponse: 0,
                //                     vilLetter: 0,
                //                     patientProfile: 0,
                //                     confiramtion: 0,
                //                     ticket: 0,
                //                     passports: 0,
                //                     sentopinions: 0,
                //                     sentDocPdf: 0,

                // user:0                    }
                //             },



            ]
        }
        patientReport = await Patient.aggregate(pipeline)
        console.log('patientReport',patientReport)
        hospitalReport = await Patient.aggregate(pipeline2)
        let i = 1100;
        hospitalReport.forEach(element => {
            element._id.hospitalName = element._id.hospitalname;
            element._id.hospitalname = element._id.hospitalname.slice(0, 20) + i;
            i++;

            element.data.map(obj => {
                if (obj.preintimation == undefined) {
                    obj['preintimation'] = 'No'
                }

                if (obj.opdrequested == undefined) {
                    obj['opdrequested'] = "No"
                }
                if (obj.opdresponse == undefined) {
                    obj['opdresponse'] = "No"
                }
                if (obj.pirequest == undefined) {
                    obj['pirequest'] = "No"
                }
                if (obj.piresponse == undefined) {
                    obj['piresponse'] = "No"
                }
                if (obj.opinionrequest == undefined) {
                    obj['opinionrequest'] = "No"
                }
                if (obj.opinionreceived == undefined) {
                    obj['opinionreceived'] = "No"
                }
                if (obj.vilrequest == undefined) {
                    obj['vilrequest'] = "No"
                }
                if (obj.vilresponse == undefined) {
                    obj['vilresponse'] = "No"
                }
                if (obj.confiramtion == undefined) {
                    obj['confiramtion'] = "No"
                }
                if (obj.vilLetter == undefined) {
                    obj['vilLetter'] = "No"
                }
                if (obj.ticket == undefined) {
                    obj['ticket'] = []
                }
                if (obj.passports == undefined) {
                    obj['passports'] = []
                }
                if (obj.opinionSentDate != undefined) {
                    obj['opinionSentDate'] = moment(obj.opinionSentDate).tz("Asia/Kolkata").format('YYYY-MM-DD')
                    obj['opinionSentTime'] = moment(obj.opinionSentDate).tz("Asia/Kolkata").format('hh:mm')

                }
                if (obj.intimationSentDate != undefined) {

                    obj['intimationSentDate'] = moment(obj.intimationSentDate).tz("Asia/Kolkata").format('YYYY-MM-DD')
                    obj['intimationSentTime'] = moment(obj.intimationSentDate).tz("Asia/Kolkata").format('hh:mm')

                }
                if (obj.opdSentDate != undefined) {

                    obj['opdSentDate'] = moment(obj.opdSentDate).tz("Asia/Kolkata").format('YYYY-MM-DD')
                    obj['opdSentTime'] = moment(obj.opdSentDate).tz("Asia/Kolkata").format('hh:mm')

                }
                if (obj.piSentDate != undefined) {
                    obj['piSentDate'] = moment(obj.piSentDate).tz("Asia/Kolkata").format('YYYY-MM-DD')
                    obj['piSentTime'] = moment(obj.piSentDate).tz("Asia/Kolkata").format('hh:mm')

                }
                if (obj.vilSentDate != undefined) {
                    obj['vilSentDate'] = moment(obj.vilSentDate).tz("Asia/Kolkata").format('YYYY-MM-DD')
                    obj['vilSentTime'] = moment(obj.vilSentDate).tz("Asia/Kolkata").format('hh:mm')
                }
                if (obj.confSentDate != undefined) {
                    obj['confSentDate'] = moment(obj.confSentDate).tz("Asia/Kolkata").format('YYYY-MM-DD')
                    obj['confSentTime'] = moment(obj.confSentDate).tz("Asia/Kolkata").format('hh:mm')

                }

                obj.hospitalName = element._id.hospitalName

            })
        });
        console.log('hospitalReport', hospitalReport)
        let xlsx = require("json-as-xlsx")
        let data = [
            {
                sheet: "Patient",
                columns: [
                    { label: "Company Name", value: "Company Name" }, // Top level data
                    { label: "Company UHID", value: "UHID" }, // Top level data
                    { label: "Patient MHID", value: "Company UHID" }, // Top level data
                    { label: "Patient Name", value: "Patient Name" }, // Top level data
                    { label: "Entry Date", value: "Entry Date" }, // Top level data
                    { label: "Entry Time", value: "Entry Time" }, // Top level data
                    { label: "Closed Date", value: "Closed Date" }, // Top level data
                    { label: "Closed Time", value: "Closed Time" }, // Top level data
                    { label: "Closed Reason", value: "Closed Reason" }, // Top level data
                    { label: "Status", value: "Status" }, // Top level data
                    { label: "Gender", value: "Gender" }, // Top level data
                    { label: "Age", value: "Age" }, // Top level data
                    { label: "Mobile No", value: "Mobile No" }, // Top level data
                    { label: "Email Id", value: "Email Id" }, // Top level data
                    { label: "Country", value: "Country" }, // Top level data
                    { label: "Treatment", value: "Treatment" }, // Top level data
                    { label: "Referral Partner", value: "Referral Partner" }, // Top level data
                    { label: "Opinion Sent Date", value: "opinionDate" }, // Top level data
                    { label: "Opinion Sent Time", value: "opinionTime" }, // Top level data
                    { label: "VIL Sent Date", value: "vilDate" }, // Top level data
                    { label: "VIL Sent Time", value: "vilTime" }, // Top level data
                    { label: "Ticket Copy", value: "Ticket Copy" }, // Top level data
                    { label: "Passports", value: "Passports" }, // Top level data
                    { label: "Sent Opinions", value: "Sent Opinions" }, // Top level data
                    { label: "Doctor Profile", value: "Doctor Profile" }, // Top level data
                    { label: "Patient Report", value: "Patient Report" }, // Top level data
                    { label: "Vil Letter", value: "Vil Letter" }, // Top level data


                ],
                content: patientReport,
            },

        ]
        hospitalSeprate = [];
        hospitalReport.forEach(element => {
            element.data.forEach(element1 => {
                hospitalSeprate.push(element1)
            });
        })
        data.push({
            sheet: "Hospital",
            columns: [

                { label: "Hospital Name", value: "hospitalName" }, // Top level data
                { label: "Patient Name", value: "patientName" }, // Top level data
                { label: "Gender", value: "Gender" }, // Top level data
                { label: "Age", value: "Age" }, // Top level data
                { label: "Treatment", value: "Treatment" }, // Top level data
                { label: "Company UHID", value: "UHID" }, // Top level data
                { label: "Patient MHID", value: "uhid" }, // Top level data
                { label: "Opinion Request", value: "opinionrequest" }, // Top level data
                { label: "Opinion Sent Date", value: "opinionSentDate" }, // Top level data
                { label: "Opinion Sent Time", value: "opinionSentTime" }, // Top level data

                { label: "Opinion Received", value: "opinionreceived" }, // Top level data
                { label: "Diagnosis", value: "diagnosis" }, // Top level data
                { label: "Treatment Plan", value: "treatmentplan" }, // Top level data
                { label: "Stay in Country", value: "stayincountry" }, // Top level data
                { label: "Country Duration", value: "countryduration" }, // Top level data
                { label: "Stay in Hospital", value: "stayinhospital" }, // Top level data
                { label: "Hospital Duration", value: "hospitalduration" }, // Top level data
                { label: "Initial Evaluation Minimum", value: "initialevaluationminimum" }, // Top level data
                { label: "Initial Evaluation Maximum", value: "initialevaluationmaximum" }, // Top level data
                { label: "Remarks", value: "remarks" }, // Top level data
                // { label: "Treatment Opinion", value: "treatmentOpinion" }, // Top level data

                { label: "Pre Intimation", value: "preintimation" }, // Top level data
                { label: "Pre Intimation Sent Date", value: "intimationSentDate" }, // Top level data
                { label: "Pre Intimation Sent Time", value: "intimationSentTime" }, // Top level data


                { label: "Opd Requested", value: "opdrequested" }, // Top level data
                { label: "Opd Sent Date", value: "opdSentDate" }, // Top level data
                { label: "Opd Sent Time", value: "opdSentTime" }, // Top level data


                { label: "Opd Response", value: "opdresponse" }, // Top level data
                { label: "Meeting Link", value: "meetinglink" }, // Top level data
                { label: "Payment Link", value: "paymentlink" }, // Top level data
                { label: "Doctor Name", value: "opddoctorname" }, // Top level data
                { label: "PI Request", value: "pirequest" }, // Top level data
                { label: "PI Sent Date", value: "piSentDate" }, // Top level data
                { label: "PI Sent Time", value: "piSentTime" }, // Top level data

                { label: "PI Response", value: "piresponse" }, // Top level data
                { label: "VIL Request", value: "vilrequest" }, // Top level data
                { label: "Passports", value: "passports" }, // Top level data
                { label: "VIL Sent Date", value: "vilSentDate" }, // Top level data
                { label: "VIL Sent Time", value: "vilSentTime" }, // Top level data
                { label: "VIL response", value: "vilresponse" }, // Top level data
                { label: "Vil Letter", value: "vilLetter" }, // Top level data
                { label: "Confiramtion", value: "confiramtion" }, // Top level data
                { label: "Conf Sent Date", value: "confSentDate" }, // Top level data
                { label: "Conf Sent Time", value: "confSentTIme" }, // Top level data
                { label: "Arrival Date", value: "arrivalDate" }, // Top level data
                { label: "Arrival Time", value: "arrivalTime" }, // Top level data
                { label: "Remarks", value: "confRemarks" }, // Top level data
                { label: "Cabs", value: "cabs" }, // Top level data
                { label: "FlightName", value: "flightName" }, // Top level data
                { label: "FlightNo", value: "flightNo" }, // Top level data
                { label: "Contact Person", value: "contactPerson" }, // Top level data
                { label: "Contact Person No", value: "contactPersonNo" }, // Top level data
                { label: "Coordinator Address", value: "coordinatorAddress" }, // Top level data
                { label: "Ticket", value: "ticket" }, // Top level data

            ],
            content: hospitalSeprate,

        })
        hospitalReport.forEach(element => {
            data.push({
                sheet: element._id.hospitalname,
                columns: [

                    { label: "Hospital Name", value: "hospitalName" }, // Top level data
                    { label: "Patient Name", value: "patientName" }, // Top level data
                    { label: "Gender", value: "Gender" }, // Top level data
                    { label: "Age", value: "Age" }, // Top level data
                    { label: "Treatment", value: "Treatment" }, // Top level data
                    { label: "Company UHID", value: "UHID" }, // Top level data
                    { label: "Patient MHID", value: "uhid" }, // Top level data
                    { label: "Opinion Request", value: "opinionrequest" }, // Top level data
                    { label: "Opinion Sent Date", value: "opinionSentDate" }, // Top level data
                    { label: "Opinion Sent Time", value: "opinionSentTime" }, // Top level data

                    { label: "Opinion Received", value: "opinionreceived" }, // Top level data
                    { label: "Diagnosis", value: "diagnosis" }, // Top level data
                    { label: "Treatment Plan", value: "treatmentplan" }, // Top level data
                    { label: "Stay in Country", value: "stayincountry" }, // Top level data
                    { label: "Country Duration", value: "countryduration" }, // Top level data
                    { label: "Stay in Hospital", value: "stayinhospital" }, // Top level data
                    { label: "Hospital Duration", value: "hospitalduration" }, // Top level data
                    { label: "Initial Evaluation Minimum", value: "initialevaluationminimum" }, // Top level data
                    { label: "Initial Evaluation Maximum", value: "initialevaluationmaximum" }, // Top level data
                    { label: "Remarks", value: "remarks" }, // Top level data
                    // { label: "Treatment Opinion", value: "treatmentOpinion" }, // Top level data

                    { label: "Pre Intimation", value: "preintimation" }, // Top level data
                    { label: "Pre Intimation Sent Date", value: "intimationSentDate" }, // Top level data
                    { label: "Pre Intimation Sent Time", value: "intimationSentTime" }, // Top level data


                    { label: "Opd Requested", value: "opdrequested" }, // Top level data
                    { label: "Opd Sent Date", value: "opdSentDate" }, // Top level data
                    { label: "Opd Sent Time", value: "opdSentTime" }, // Top level data


                    { label: "Opd Response", value: "opdresponse" }, // Top level data
                    { label: "Meeting Link", value: "meetinglink" }, // Top level data
                    { label: "Payment Link", value: "paymentlink" }, // Top level data
                    { label: "Doctor Name", value: "opddoctorname" }, // Top level data
                    { label: "PI Request", value: "pirequest" }, // Top level data
                    { label: "PI Sent Date", value: "piSentDate" }, // Top level data
                    { label: "PI Sent Time", value: "piSentTime" }, // Top level data

                    { label: "PI Response", value: "piresponse" }, // Top level data
                    { label: "VIL Request", value: "vilrequest" }, // Top level data
                    { label: "Passports", value: "passports" }, // Top level data
                    { label: "VIL Sent Date", value: "vilSentDate" }, // Top level data
                    { label: "VIL Sent Time", value: "vilSentTime" }, // Top level data
                    { label: "VIL response", value: "vilresponse" }, // Top level data
                    { label: "Vil Letter", value: "vilLetter" }, // Top level data
                    { label: "Confiramtion", value: "confiramtion" }, // Top level data
                    { label: "Conf Sent Date", value: "confSentDate" }, // Top level data
                    { label: "Conf Sent Time", value: "confSentTIme" }, // Top level data
                    { label: "Arrival Date", value: "arrivalDate" }, // Top level data
                    { label: "Arrival Time", value: "arrivalTime" }, // Top level data
                    { label: "Remarks", value: "confRemarks" }, // Top level data
                    { label: "Cabs", value: "cabs" }, // Top level data
                    { label: "FlightName", value: "flightName" }, // Top level data
                    { label: "FlightNo", value: "flightNo" }, // Top level data
                    { label: "Contact Person", value: "contactPerson" }, // Top level data
                    { label: "Contact Person No", value: "contactPersonNo" }, // Top level data
                    { label: "Coordinator Address", value: "coordinatorAddress" }, // Top level data
                    { label: "Ticket", value: "ticket" }, // Top level data

                ],
                content: element.data,

            })
        });

        let settings = {
            fileName: "MySpreadsheet", // Name of the resulting spreadsheet
            extraLength: 3, // A bigger number means that columns will be wider
            writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
        }
        const path = require("path");
        const fs = require('fs');

        let callback = async function (sheet) {
            console.log('path.resolve(__dirname, "../file.xml")', path.resolve(__dirname, "../../MySpreadsheet.xlsx"))

        }

        var check = xlsx(data, settings, callback)
        const fileContent = fs.readFileSync(path.resolve(__dirname, "../../MySpreadsheet.xlsx"));

        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `report.xlsx`,
            Body: fileContent,
            ACL: 'public-read',
            ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        await s3.upload(params, async function (err, data) {
            console.log('data', data)
            report.downloadreport = data.Location
            report.user = user
            await report.save()
            user.reports.push(report)
            await user.save()
            res.send({ message: data.Location })

        });


    } catch (err) {
        next(err);
    }
}

exports.getReport = async (req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('reports')

        res.send(user.reports)
    } catch (err) {
        next(err);
    }

}
exports.getReportByBranch = (req, res) => {
    const id = req.params.userid;
    const branchid = req.params.branchid;

    zoneQuery = {
        "user": id,
        "branchoffice": branchid

    };

    Report.find(zoneQuery)
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
exports.getReportByRefferal = (req, res) => {

    const id = req.params.userid;
    const refferalid = req.params.refferalid;
    zoneQuery = {
        "user": id,
        "refferalpartner._id": refferalid

    };

    Report.find(zoneQuery)
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
exports.postCmsExcel = async (req, res, next) => {
    console.log(req.body)
    try {
        if (req.body.type == 'Doctor') {
            var pipeline = [{
                $project: {
                    name: 1,
                    designation: 1,
                    qualification: 1,
                    expertise: 1,
                    serviceoffered: 1,
                    experience: 1,
                    experience_year: 1,
                    highlights: 1,
                    featured: 1,
                    treatments: 1,
                    hospitals: 1,
                    departments: 1,
                    doctorcategories: 1,
                    city: 1,
                    _id: 0

                }
            },
            {
                $lookup: {
                    from: 'treatment',
                    "let": { "id": "$treatments" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'treatments',

                }
            },
            {
                $lookup: {
                    from: 'hospital',
                    "let": { "id": "$hospitals" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'hospitals',

                }
            },
            {
                $lookup: {
                    from: 'department',
                    "let": { "id": "$departments" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'departments',

                }
            },
            {
                $lookup: {
                    from: 'city',
                    "let": { "id": "$city" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'city',

                }
            },
            {
                $addFields: {
                    treatments: "$treatments.name",
                    hospitals: "$hospitals.name",
                    departments: "$departments.name",
                    city: "$city.name"

                }
            },
            {
                $addFields: {
                    treatments: {
                        '$reduce': {
                            'input': '$treatments',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    hospitals: {
                        '$reduce': {
                            'input': '$hospitals',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    departments: {
                        '$reduce': {
                            'input': '$departments',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    city: {
                        '$reduce': {
                            'input': '$city',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    "treatments": {
                        $cond: {
                            if: {
                                $eq: ["$treatments", ""]
                            },
                            then: "-",
                            else: '$treatments',

                        }
                    },
                    "hospitals": {
                        $cond: {
                            if: {
                                $eq: ["$hospitals", ""]
                            },
                            then: "-",
                            else: '$hospitals',

                        }
                    },
                    "departments": {
                        $cond: {
                            if: {
                                $eq: ["$departments", ""]
                            },
                            then: "-",
                            else: '$departments',

                        }
                    },
                    "city": {
                        $cond: {
                            if: {
                                $eq: ["$city", ""]
                            },
                            then: "-",
                            else: '$city',

                        }
                    },
                }
            },

            {
                $project: {
                    name: "$name",
                    designation: "$name",
                    qualification: "$qualification",
                    expertise: "$expertise",
                    serviceoffered: "$serviceoffered",
                    experience: "$experience",
                    experience_year: "$experience_year",
                    highlights: "$highlights",
                    featured: "$featured",
                    city: "$city",
                    hospitals: "$hospitals",
                    treatments: "$treatments",
                    departments: "$departments"

                }
            }
            ]
            doc = await Doctorcms.aggregate(pipeline)

        }
        // tratment
        if (req.body.type == 'Treatment') {

            var pipeline = [{
                $project: {
                    name: 1,
                    description: 1,
                    about: 1,
                    Cost: 1,
                    stay_in_hostpital: 1,
                    additional_stay_in_india: 1,
                    featured: 1,
                    department: 1,
                    top10doctors: 1,
                    top10hospitals: 1,
                }
            },
            {
                $lookup: {
                    from: 'department',
                    "let": { "id": "$department" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'department',

                }
            },
            {
                $lookup: {
                    from: 'doctor',
                    "let": { "id": "$top10doctors" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'top10doctors',

                }
            },
            {
                $lookup: {
                    from: 'doctor',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$$id", "$treatments"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'doctors',

                }
            },
            {
                $lookup: {
                    from: 'hospital',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$$id", "$treatments"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'hospitals',

                }
            },
            {
                $lookup: {
                    from: 'doctorcategory',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$$id", "$treatments"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'doctorcategory',

                }
            },
            {
                $lookup: {
                    from: 'hospital',
                    "let": { "id": "$top10hospitals" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'top10hospitals',

                }
            },

            {
                $addFields: {
                    department: "$department.name",
                    top10doctors: "$top10doctors.name",
                    top10hospitals: "$top10hospitals.name",
                    doctors: "$doctors.name",
                    hospitals: "$hospitals.name",
                    doctorcategory: "$doctorcategory.name"

                }
            },
            {
                $addFields: {
                    Cost: {
                        $toString: "$Cost"
                    },
                    stay_in_hostpital: {
                        $toString: "$stay_in_hostpital"
                    },
                    additional_stay_in_india: {
                        $toString: "$additional_stay_in_india"
                    },
                    department: {
                        '$reduce': {
                            'input': '$department',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    top10doctors: {
                        '$reduce': {
                            'input': '$top10doctors',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    top10hospitals: {
                        '$reduce': {
                            'input': '$top10hospitals',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    doctors: {
                        '$reduce': {
                            'input': '$doctors',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    hospitals: {
                        '$reduce': {
                            'input': '$hospitals',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    },
                    doctorcategory: {
                        '$reduce': {
                            'input': '$doctorcategory',
                            'initialValue': '',
                            'in': {
                                '$concat': [
                                    '$$value',
                                    { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                    '$$this'
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    "Cost": {
                        $cond: {
                            if: {
                                $eq: ["$Cost", null]
                            },
                            then: "-",
                            else: '$Cost',

                        }
                    },
                    "stay_in_hostpital": {
                        $cond: {
                            if: {
                                $eq: ["$stay_in_hostpital", null]
                            },
                            then: "-",
                            else: '$stay_in_hostpital',

                        }
                    },
                    "additional_stay_in_india": {
                        $cond: {
                            if: {
                                $eq: ["$additional_stay_in_india", null]
                            },
                            then: "-",
                            else: '$additional_stay_in_india',

                        }
                    },
                    "department": {
                        $cond: {
                            if: {
                                $eq: ["$department", ""]
                            },
                            then: "-",
                            else: '$department',

                        }
                    },
                    "doctors": {
                        $cond: {
                            if: {
                                $eq: ["$doctors", ""]
                            },
                            then: "-",
                            else: '$doctors',

                        }
                    },
                    "hospitals": {
                        $cond: {
                            if: {
                                $eq: ["$hospitals", ""]
                            },
                            then: "-",
                            else: '$hospitals',

                        }
                    },
                    "doctorcategory": {
                        $cond: {
                            if: {
                                $eq: ["$doctorcategory", ""]
                            },
                            then: "-",
                            else: '$doctorcategory',

                        }
                    },
                    "top10doctors": {
                        $cond: {
                            if: {
                                $eq: ["$top10doctors", ""]
                            },
                            then: "-",
                            else: '$top10doctors',

                        }
                    },
                    "top10hospitals": {
                        $cond: {
                            if: {
                                $eq: ["$top10hospitals", ""]
                            },
                            then: "-",
                            else: '$top10hospitals',

                        }
                    },

                }
            },
            {
                $project: {
                    name: "$name",
                    description: "$description",
                    about: "$about",
                    Cost: "$Cost",
                    stay_in_hostpital: "$stay_in_hostpital",
                    additional_stay_in_india: "$additional_stay_in_india",
                    featured: "$featured",
                    department: "$department",
                    doctors: "$doctors",
                    hospitals: "$hospitals",
                    doctorcategory: "$doctorcategory",
                    top10doctors: "$top10doctors",
                    top10hospitals: "$top10hospitals",
                    _id: 0,

                }
            }

            ]

            doc = await Treatmentcms.aggregate(pipeline)
        }
        // hospital
        if (req.body.type == 'Department') {

            var pipeline = [{
                $project: {
                    name: 1,
                },
            },
            {
                $lookup: {
                    from: 'treatment',
                    "let": { "id": "$_id" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$department", "$$id"] } } },


                        {
                            $project: {
                                name: 1,
                                _id: 0

                            }
                        },
                    ],

                    as: 'Treatment',

                }

            },
            {
                $addFields: {
                    Treatment: "$Treatment.name",


                }
            },
            {
                $addFields: {
                    "Treatment": {
                        $cond: {
                            if: {
                                $eq: ["$top10hospitals", []]
                            },
                            then: "",
                            else: '$Treatment',

                        }
                    },
                }
            },
            { $unwind: '$Treatment' },

            // {
            //     $addFields:{
            //         "Department Name": {
            //             $toString: "$name"
            //         },
            //         "Treatment Name": {
            //             $toString: "$Treatment"
            //         },
            //     }
            // },
            {
                $project: {
                    _id: 0,

                },
            }
            ]
            doc = await DepartmentCms.aggregate(pipeline)
            //     let xlsx = require("json-as-xlsx")
            // let data = [
            //     {
            //         sheet: "Department",
            //         columns: [
            //             { label: "Department Name", value: "name" }, // Top level data
            //             { label: "Treatment", value: "Treatment" }, // Top level data



            //         ],
            //         content: doc,
            //     },

            // ]
            // let settings = {
            //     fileName: "Department", // Name of the resulting spreadsheet
            //     extraLength: 3, // A bigger number means that columns will be wider
            //     writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
            // }

            // var check = xlsx(data, settings) // Will download the excel file
            // // var xls = json2xls(patientReport);
            console.log(doc)
        }

        // for (let i = 0; i < doc.length; i++) { doc[i].id = i + 1; }
        var xls = json2xls(doc);

        const buffer = Buffer.from(xls, 'binary');
        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `cmsReport.xlsx`,
            Body: buffer,
            ACL: 'public-read',
            ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };
        await s3.upload(params, async function (err, data) {

            cmsexcel = new cmsExcel()
            cmsexcel.downloadReport = data.Location
            cmsexcel.type = req.body.type
            await cmsexcel.save()
            // res.send(doc)
            res.xls('data.xlsx', doc);

        });
    } catch (err) {
        next(err)
    }
}
exports.getCmsExcel = (req, res) => {

    cmsExcel.find()
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
exports.whatsappMessageWebhook = async (req, res, next) => {
    console.log(req.body)
    try {
        res.send({ message: 'working' })
    } catch (err) {
        next(err)
    }
}
exports.whatsappNotificationWebhook = async (req, res, next) => {
    console.log(req.body)
    try {
        res.send({ message: 'working' })
    } catch (err) {
        next(err)
    }
}
exports.check = async (req, res, next) => {

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
        res.send(doc)
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
                }
            });

        });


    } catch (err) {
        next(err)
    }
}

exports.queryCheck = async (req, res, next) => {

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
                costminimum: 1,
                costmaximum: 1,
                roomcategory: 1,
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
                        costminimum: "$costminimum",
                        costmaximum: "$costmaximum",
                        roomcategory: "$roomcategory",
                        remarks: "$remarks",
                        createdAt: "$createdAt"
                    }
                }
            }
        }
        ]

        doc = await opinionReceived.aggregate(pipeline)
        res.send(doc)
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

                    sendemail.reminderOpinion(user, hospital, patient, hospitalCred, element1, emailccsend)
                }
            });

        });


    } catch (err) {
        next(err)
    }
}

// Patient Backup
cron.schedule('0 8 * * MON', async () => {

    try {
        var pipeline = [{
            $lookup: {
                from: 'request',
                localField: 'requests',
                foreignField: '_id',
                as: 'request',

            }
        },
        {
            $lookup: {
                from: 'received',
                localField: 'receives',
                foreignField: '_id',
                as: 'received'
            }
        },
        {
            $lookup: {
                from: 'preintimation',
                localField: 'preintimations',
                foreignField: '_id',
                as: 'preintimation'
            }
        },
        {
            $lookup: {
                from: 'opdrequest',
                localField: 'opdrequests',
                foreignField: '_id',
                as: 'opdrequest'
            }
        },
        {
            $lookup: {
                from: 'opdresponse',
                localField: 'opdresponses',
                foreignField: '_id',
                as: 'opdresponse'
            }
        },
        {
            $lookup: {
                from: 'pirequest',
                localField: 'pirequests',
                foreignField: '_id',
                as: 'pirequests'
            }
        },
        {
            $lookup: {
                from: 'piresponse',
                localField: 'piresponses',
                foreignField: '_id',
                as: 'piresponses'
            }
        },
        {
            $lookup: {
                from: 'requestvil',
                localField: 'requestvils',
                foreignField: '_id',
                as: 'requestvils'
            }
        },
        {
            $lookup: {
                from: 'responsevil',
                localField: 'responsevils',
                foreignField: '_id',
                as: 'responsevils'
            }
        },
        {
            $lookup: {
                from: 'confirmation',
                localField: 'confirmations',
                foreignField: '_id',
                as: 'confirmations'
            }
        },
        {
            $lookup: {
                from: 'sentopinion',
                localField: 'sentopinions',
                foreignField: '_id',
                as: 'sentopinions'
            }
        },

        {
            $project: {
                "_id": 0,
                "user": 1,

                "name": 1,
                Date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                "Status": "$currentstatus",
                "Gender": {
                    $cond: {
                        if: { $eq: ["$gender", ""] },
                        then: "-",
                        else: "$gender"
                    }
                },
                "Age": {
                    $cond: {
                        if: { $eq: ["$age", ""] },
                        then: "-",
                        else: "$age"
                    }
                },
                "Contact": {
                    $cond: {
                        if: { $eq: ["$contact", ""] },
                        then: "-",
                        else: "$contact"
                    }
                },
                "Email Id": {
                    $cond: {
                        if: { $eq: ["$emailid", ""] },
                        then: "-",
                        else: "$emailid"
                    }
                },
                "Country": "$country",
                "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                "Treatment": {
                    $cond: {
                        if: { $eq: ["$treatment", ""] },
                        then: "-",
                        else: "$treatment"
                    }
                },
                "Referral Partner": {
                    $cond: {
                        if: { $eq: ["$refferalpartner", "NAN"] },
                        then: "NAN",
                        else: "$refferalpartner.name"
                    }
                },

                "preintimation": {
                    $map: {
                        input: "$preintimation",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "preintimationtime": {
                    $map: {
                        input: "$preintimation",
                        as: "up",
                        in: {
                            date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                        }
                    }
                },
                "opdrequested": {

                    $map: {
                        input: "$opdrequest",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }

                },
                "opdresponse": {

                    $map: {
                        input: "$opdresponse",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }

                },
                "sentopinions": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.opnionPdf"
                        }
                    }

                },
                "sentDocPdf": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.doctorPdf"
                        }
                    }

                },
                "pirequest": {
                    $map: {
                        input: "$pirequests",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "piresponse": {
                    $map: {
                        input: "$piresponses",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "opinionrequest": {
                    $map: {
                        input: "$request",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "opinionreceived": {
                    $map: {
                        input: "$received",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "vilrequest": {
                    $map: {
                        input: "$requestvils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "vilresponse": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "confiramtion": {
                    $map: {
                        input: "$confirmations",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "vilLetter": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            location: "$$up.villetter.location"
                        }
                    }
                },

                "patientProfile": {
                    $map: {
                        input: "$patientProfile",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "ticket": {
                    $map: {
                        input: "$confirmations.ticket",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "passports": {
                    $map: {
                        input: "$requestvils.passports",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
            },


        },
        {
            $addFields: {


                "Ticket Copy": {
                    $cond: {
                        if: {
                            $eq: ["$ticket", []]
                        },
                        then: "",
                        else: '$ticket.location',

                    }
                },
                "Passports": {
                    $cond: {
                        if: {
                            $eq: ["$passports", []]
                        },
                        then: "",
                        else: '$passports.location',

                    }
                },
                "Sent Opinions": {
                    $cond: {
                        if: {
                            $eq: ["$sentopinions", []]
                        },
                        then: "",
                        else: '$sentopinions.location',

                    }
                },
                "Doctor Profile": {
                    $cond: {
                        if: {
                            $eq: ["$sentDocPdf", []]
                        },
                        then: "",
                        else: '$sentDocPdf.location',

                    }
                },
            }
        },
        {
            $addFields: {
                "Pre Intimation Sent Hospital": {
                    '$reduce': {
                        'input': '$preintimation.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Pre Intimation Time": {
                    '$reduce': {
                        'input': '$preintimationtime.date',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Request Hospital": {
                    '$reduce': {
                        'input': '$opdrequested.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Response Hospital": {
                    '$reduce': {
                        'input': '$opdresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion request hospital assigned": {
                    '$reduce': {
                        'input': '$opinionrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion received from Hospital": {
                    '$reduce': {
                        'input': '$opinionreceived.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Proforma Invoice Request": {
                    '$reduce': {
                        'input': '$pirequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Proforma Invoice Response": {
                    '$reduce': {
                        'input': '$piresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL Request to Hospital": {
                    '$reduce': {
                        'input': '$vilrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL received": {
                    '$reduce': {
                        'input': '$vilresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Confiramtion": {
                    '$reduce': {
                        'input': '$confiramtion.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Patient Report": {
                    '$reduce': {
                        'input': '$patientProfile.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Vil Letter": {
                    '$reduce': {
                        'input': '$vilLetter.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },

            }
        },
        {
            $project: {
                opinionrequest: 0,
                opinionreceived: 0,
                preintimation: 0,
                preintimationtime: 0,
                opdrequested: 0,
                opdresponse: 0,
                pirequest: 0,
                piresponse: 0,
                vilrequest: 0,
                vilresponse: 0,
                vilLetter: 0,
                patientProfile: 0,
                confiramtion: 0,
                ticket: 0,
                passports: 0,
                sentopinions: 0,
                sentDocPdf: 0
            }
        },
        {
            $group: {
                _id: "$user",
                data: {
                    $push: {
                        "name": "$name",
                        "Date": "$Date",
                        "Status": "$Status",
                        "Gender": "$Gender",
                        "Age": "$Age",
                        "Contact": "$Contact",
                        "Email Id": "$Email Id",
                        "Country": "$Country",
                        "Company UHID": "$Company UHID",
                        "Treatment": "$Treatment",
                        "Referral Partner": "$Referral Partner",
                        "Pre Intimation Sent Hospital": "$Pre Intimation Sent Hospital",
                        "Pre Intimation Time": "$Pre Intimation Time",
                        "OPD Request Hospital": "$OPD Request Hospital",
                        "OPD Response Hospital": "$OPD Response Hospital",
                        "Opinion request hospital assigned": "$Opinion request hospital assigned",
                        "Opinion received from Hospital": "$Opinion received from Hospital",
                        "Proforma Invoice Request": "$Proforma Invoice Request",
                        "Proforma Invoice Response": "$Proforma Invoice Response",
                        "VIL Request to Hospital": "$VIL Request to Hospital",
                        "VIL received": "$VIL received",
                        "Confiramtion": "$Confiramtion",
                        "Patient Report": "$Patient Report",
                        "Vil Letter": "$Vil Letter",
                        "Ticket Copy": "$Ticket Copy",
                        "Passport": "$Passports",
                        "Sent Opinions": "$Sent Opinions",
                        "Doctor Profile": "$Doctor Profile"

                    }
                }

            }
        },


        ]
        patient = await Patient.aggregate(pipeline)
        patient.forEach(async element => {

            const user = await Facilitator.findOne({ _id: element._id })
            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const planName = plan.data.plan.name.split(' ')[0]
                    if (planName == "Fac_Enterprise") {
                        var xls = json2xls(element.data);
                        var buffer = Buffer.from(xls, 'binary');
                        date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                        const designation = await Designation.find({ "user": user._id });
                        const company = await Company.find({ "user": user._id });

                        var address = "";
                        company[0].address.forEach(element => {
                            address += `${element.point1} <br/>`;

                        });
                        const credential = await Credential.findOne({ "user": user._id });

                        sendemail.autoMatedBackup(buffer, user.email, user.name, date, designation, company, address, credential)
                    }

                }
            }
            if (user.Role == 'Super') {
                var xls = json2xls(element.data);
                var buffer = Buffer.from(xls, 'binary');
                date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                const designation = await Designation.find({ "user": user._id });
                const company = await Company.find({ "user": user._id });

                var address = "";
                company[0].address.forEach(element => {
                    address += `${element.point1} <br/>`;

                });
                const credential = await Credential.findOne({ "user": user._id });

                sendemail.autoMatedBackup(buffer, user.email, user.name, date, designation, company, address, credential)
            }

        })

        res.send(patient)
    } catch (err) {
        next(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})

cron.schedule('0 8 */15 * *', async () => {

    try {
        var pipeline = [{
            $lookup: {
                from: 'request',
                localField: 'requests',
                foreignField: '_id',
                as: 'request',

            }
        },
        {
            $lookup: {
                from: 'received',
                localField: 'receives',
                foreignField: '_id',
                as: 'received'
            }
        },
        {
            $lookup: {
                from: 'preintimation',
                localField: 'preintimations',
                foreignField: '_id',
                as: 'preintimation'
            }
        },
        {
            $lookup: {
                from: 'opdrequest',
                localField: 'opdrequests',
                foreignField: '_id',
                as: 'opdrequest'
            }
        },
        {
            $lookup: {
                from: 'opdresponse',
                localField: 'opdresponses',
                foreignField: '_id',
                as: 'opdresponse'
            }
        },
        {
            $lookup: {
                from: 'pirequest',
                localField: 'pirequests',
                foreignField: '_id',
                as: 'pirequests'
            }
        },
        {
            $lookup: {
                from: 'piresponse',
                localField: 'piresponses',
                foreignField: '_id',
                as: 'piresponses'
            }
        },
        {
            $lookup: {
                from: 'requestvil',
                localField: 'requestvils',
                foreignField: '_id',
                as: 'requestvils'
            }
        },
        {
            $lookup: {
                from: 'responsevil',
                localField: 'responsevils',
                foreignField: '_id',
                as: 'responsevils'
            }
        },
        {
            $lookup: {
                from: 'confirmation',
                localField: 'confirmations',
                foreignField: '_id',
                as: 'confirmations'
            }
        },
        {
            $lookup: {
                from: 'sentopinion',
                localField: 'sentopinions',
                foreignField: '_id',
                as: 'sentopinions'
            }
        },

        {
            $project: {
                "_id": 0,
                "user": 1,

                "name": 1,
                Date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                "Status": "$currentstatus",
                "Gender": {
                    $cond: {
                        if: { $eq: ["$gender", ""] },
                        then: "-",
                        else: "$gender"
                    }
                },
                "Age": {
                    $cond: {
                        if: { $eq: ["$age", ""] },
                        then: "-",
                        else: "$age"
                    }
                },
                "Contact": {
                    $cond: {
                        if: { $eq: ["$contact", ""] },
                        then: "-",
                        else: "$contact"
                    }
                },
                "Email Id": {
                    $cond: {
                        if: { $eq: ["$emailid", ""] },
                        then: "-",
                        else: "$emailid"
                    }
                },
                "Country": "$country",
                "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                "Treatment": {
                    $cond: {
                        if: { $eq: ["$treatment", ""] },
                        then: "-",
                        else: "$treatment"
                    }
                },
                "Referral Partner": {
                    $cond: {
                        if: { $eq: ["$refferalpartner", "NAN"] },
                        then: "NAN",
                        else: "$refferalpartner.name"
                    }
                },

                "preintimation": {
                    $map: {
                        input: "$preintimation",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "preintimationtime": {
                    $map: {
                        input: "$preintimation",
                        as: "up",
                        in: {
                            date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                        }
                    }
                },
                "opdrequested": {

                    $map: {
                        input: "$opdrequest",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }

                },
                "opdresponse": {

                    $map: {
                        input: "$opdresponse",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }

                },
                "sentopinions": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.opnionPdf"
                        }
                    }

                },
                "sentDocPdf": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.doctorPdf"
                        }
                    }

                },
                "pirequest": {
                    $map: {
                        input: "$pirequests",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "piresponse": {
                    $map: {
                        input: "$piresponses",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "opinionrequest": {
                    $map: {
                        input: "$request",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "opinionreceived": {
                    $map: {
                        input: "$received",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "vilrequest": {
                    $map: {
                        input: "$requestvils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "vilresponse": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "confiramtion": {
                    $map: {
                        input: "$confirmations",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "vilLetter": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            location: "$$up.villetter.location"
                        }
                    }
                },

                "patientProfile": {
                    $map: {
                        input: "$patientProfile",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "ticket": {
                    $map: {
                        input: "$confirmations.ticket",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "passports": {
                    $map: {
                        input: "$requestvils.passports",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
            },


        },
        {
            $addFields: {


                "Ticket Copy": {
                    $cond: {
                        if: {
                            $eq: ["$ticket", []]
                        },
                        then: "",
                        else: '$ticket.location',

                    }
                },
                "Passports": {
                    $cond: {
                        if: {
                            $eq: ["$passports", []]
                        },
                        then: "",
                        else: '$passports.location',

                    }
                },
                "Sent Opinions": {
                    $cond: {
                        if: {
                            $eq: ["$sentopinions", []]
                        },
                        then: "",
                        else: '$sentopinions.location',

                    }
                },
                "Doctor Profile": {
                    $cond: {
                        if: {
                            $eq: ["$sentDocPdf", []]
                        },
                        then: "",
                        else: '$sentDocPdf.location',

                    }
                },
            }
        },
        {
            $addFields: {
                "Pre Intimation Sent Hospital": {
                    '$reduce': {
                        'input': '$preintimation.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Pre Intimation Time": {
                    '$reduce': {
                        'input': '$preintimationtime.date',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Request Hospital": {
                    '$reduce': {
                        'input': '$opdrequested.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Response Hospital": {
                    '$reduce': {
                        'input': '$opdresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion request hospital assigned": {
                    '$reduce': {
                        'input': '$opinionrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion received from Hospital": {
                    '$reduce': {
                        'input': '$opinionreceived.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Proforma Invoice Request": {
                    '$reduce': {
                        'input': '$pirequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Proforma Invoice Response": {
                    '$reduce': {
                        'input': '$piresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL Request to Hospital": {
                    '$reduce': {
                        'input': '$vilrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL received": {
                    '$reduce': {
                        'input': '$vilresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Confiramtion": {
                    '$reduce': {
                        'input': '$confiramtion.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Patient Report": {
                    '$reduce': {
                        'input': '$patientProfile.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Vil Letter": {
                    '$reduce': {
                        'input': '$vilLetter.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },

            }
        },
        {
            $project: {
                opinionrequest: 0,
                opinionreceived: 0,
                preintimation: 0,
                preintimationtime: 0,
                opdrequested: 0,
                opdresponse: 0,
                pirequest: 0,
                piresponse: 0,
                vilrequest: 0,
                vilresponse: 0,
                vilLetter: 0,
                patientProfile: 0,
                confiramtion: 0,
                ticket: 0,
                passports: 0,
                sentopinions: 0,
                sentDocPdf: 0
            }
        },
        {
            $group: {
                _id: "$user",
                data: {
                    $push: {
                        "name": "$name",
                        "Date": "$Date",
                        "Status": "$Status",
                        "Gender": "$Gender",
                        "Age": "$Age",
                        "Contact": "$Contact",
                        "Email Id": "$Email Id",
                        "Country": "$Country",
                        "Company UHID": "$Company UHID",
                        "Treatment": "$Treatment",
                        "Referral Partner": "$Referral Partner",
                        "Pre Intimation Sent Hospital": "$Pre Intimation Sent Hospital",
                        "Pre Intimation Time": "$Pre Intimation Time",
                        "OPD Request Hospital": "$OPD Request Hospital",
                        "OPD Response Hospital": "$OPD Response Hospital",
                        "Opinion request hospital assigned": "$Opinion request hospital assigned",
                        "Opinion received from Hospital": "$Opinion received from Hospital",
                        "Proforma Invoice Request": "$Proforma Invoice Request",
                        "Proforma Invoice Response": "$Proforma Invoice Response",
                        "VIL Request to Hospital": "$VIL Request to Hospital",
                        "VIL received": "$VIL received",
                        "Confiramtion": "$Confiramtion",
                        "Patient Report": "$Patient Report",
                        "Vil Letter": "$Vil Letter",
                        "Ticket Copy": "$Ticket Copy",
                        "Passport": "$Passports",
                        "Sent Opinions": "$Sent Opinions",
                        "Doctor Profile": "$Doctor Profile"

                    }
                }

            }
        },


        ]
        patient = await Patient.aggregate(pipeline)
        patient.forEach(async element => {

            const user = await Facilitator.findOne({ _id: element._id })
            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const planName = plan.data.plan.name.split(' ')[0]
                    if (planName == "Fac_Pro") {
                        var xls = json2xls(element.data);
                        var buffer = Buffer.from(xls, 'binary');
                        date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                        const designation = await Designation.find({ "user": user._id });
                        const company = await Company.find({ "user": user._id });

                        var address = "";
                        company[0].address.forEach(element => {
                            address += `${element.point1} <br/>`;

                        });
                        const credential = await Credential.findOne({ "user": user._id });

                        sendemail.autoMatedBackup(buffer, user.email, user.name, date, designation, company, address, credential)
                    }

                }
            }
            if (user.Role == 'Super') {
                var xls = json2xls(element.data);
                var buffer = Buffer.from(xls, 'binary');
                date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                const designation = await Designation.find({ "user": user._id });
                const company = await Company.find({ "user": user._id });

                var address = "";
                company[0].address.forEach(element => {
                    address += `${element.point1} <br/>`;

                });
                const credential = await Credential.findOne({ "user": user._id });

                sendemail.autoMatedBackup(buffer, user.email, user.name, date, designation, company, address, credential)
            }

        })

        res.send(patient)
    } catch (err) {
        next(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})
cron.schedule('0 8 1 * *', async () => {

    try {
        var pipeline = [{
            $lookup: {
                from: 'request',
                localField: 'requests',
                foreignField: '_id',
                as: 'request',

            }
        },
        {
            $lookup: {
                from: 'received',
                localField: 'receives',
                foreignField: '_id',
                as: 'received'
            }
        },
        {
            $lookup: {
                from: 'preintimation',
                localField: 'preintimations',
                foreignField: '_id',
                as: 'preintimation'
            }
        },
        {
            $lookup: {
                from: 'opdrequest',
                localField: 'opdrequests',
                foreignField: '_id',
                as: 'opdrequest'
            }
        },
        {
            $lookup: {
                from: 'opdresponse',
                localField: 'opdresponses',
                foreignField: '_id',
                as: 'opdresponse'
            }
        },
        {
            $lookup: {
                from: 'pirequest',
                localField: 'pirequests',
                foreignField: '_id',
                as: 'pirequests'
            }
        },
        {
            $lookup: {
                from: 'piresponse',
                localField: 'piresponses',
                foreignField: '_id',
                as: 'piresponses'
            }
        },
        {
            $lookup: {
                from: 'requestvil',
                localField: 'requestvils',
                foreignField: '_id',
                as: 'requestvils'
            }
        },
        {
            $lookup: {
                from: 'responsevil',
                localField: 'responsevils',
                foreignField: '_id',
                as: 'responsevils'
            }
        },
        {
            $lookup: {
                from: 'confirmation',
                localField: 'confirmations',
                foreignField: '_id',
                as: 'confirmations'
            }
        },
        {
            $lookup: {
                from: 'sentopinion',
                localField: 'sentopinions',
                foreignField: '_id',
                as: 'sentopinions'
            }
        },

        {
            $project: {
                "_id": 0,
                "user": 1,

                "name": 1,
                Date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                "Status": "$currentstatus",
                "Gender": {
                    $cond: {
                        if: { $eq: ["$gender", ""] },
                        then: "-",
                        else: "$gender"
                    }
                },
                "Age": {
                    $cond: {
                        if: { $eq: ["$age", ""] },
                        then: "-",
                        else: "$age"
                    }
                },
                "Contact": {
                    $cond: {
                        if: { $eq: ["$contact", ""] },
                        then: "-",
                        else: "$contact"
                    }
                },
                "Email Id": {
                    $cond: {
                        if: { $eq: ["$emailid", ""] },
                        then: "-",
                        else: "$emailid"
                    }
                },
                "Country": "$country",
                "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                "Treatment": {
                    $cond: {
                        if: { $eq: ["$treatment", ""] },
                        then: "-",
                        else: "$treatment"
                    }
                },
                "Referral Partner": {
                    $cond: {
                        if: { $eq: ["$refferalpartner", "NAN"] },
                        then: "NAN",
                        else: "$refferalpartner.name"
                    }
                },

                "preintimation": {
                    $map: {
                        input: "$preintimation",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "preintimationtime": {
                    $map: {
                        input: "$preintimation",
                        as: "up",
                        in: {
                            date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
                        }
                    }
                },
                "opdrequested": {

                    $map: {
                        input: "$opdrequest",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }

                },
                "opdresponse": {

                    $map: {
                        input: "$opdresponse",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }

                },
                "sentopinions": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.opnionPdf"
                        }
                    }

                },
                "sentDocPdf": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.doctorPdf"
                        }
                    }

                },
                "pirequest": {
                    $map: {
                        input: "$pirequests",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "piresponse": {
                    $map: {
                        input: "$piresponses",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "opinionrequest": {
                    $map: {
                        input: "$request",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "opinionreceived": {
                    $map: {
                        input: "$received",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "vilrequest": {
                    $map: {
                        input: "$requestvils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "vilresponse": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },

                "confiramtion": {
                    $map: {
                        input: "$confirmations",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalname"
                        }
                    }
                },
                "vilLetter": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            location: "$$up.villetter.location"
                        }
                    }
                },

                "patientProfile": {
                    $map: {
                        input: "$patientProfile",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "ticket": {
                    $map: {
                        input: "$confirmations.ticket",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "passports": {
                    $map: {
                        input: "$requestvils.passports",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "Sent Opinions": {
                    $cond: {
                        if: {
                            $eq: ["$sentopinions", []]
                        },
                        then: "",
                        else: '$sentopinions.location',

                    }
                },
                "Doctor Profile": {
                    $cond: {
                        if: {
                            $eq: ["$sentDocPdf", []]
                        },
                        then: "",
                        else: '$sentDocPdf.location',

                    }
                },
            },


        },
        {
            $addFields: {


                "Ticket Copy": {
                    $cond: {
                        if: {
                            $eq: ["$ticket", []]
                        },
                        then: "",
                        else: '$ticket.location',

                    }
                },
                "Passports": {
                    $cond: {
                        if: {
                            $eq: ["$passports", []]
                        },
                        then: "",
                        else: '$passports.location',

                    }
                },
            }
        },
        {
            $addFields: {
                "Pre Intimation Sent Hospital": {
                    '$reduce': {
                        'input': '$preintimation.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Pre Intimation Time": {
                    '$reduce': {
                        'input': '$preintimationtime.date',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Request Hospital": {
                    '$reduce': {
                        'input': '$opdrequested.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Response Hospital": {
                    '$reduce': {
                        'input': '$opdresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion request hospital assigned": {
                    '$reduce': {
                        'input': '$opinionrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion received from Hospital": {
                    '$reduce': {
                        'input': '$opinionreceived.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Proforma Invoice Request": {
                    '$reduce': {
                        'input': '$pirequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Proforma Invoice Response": {
                    '$reduce': {
                        'input': '$piresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL Request to Hospital": {
                    '$reduce': {
                        'input': '$vilrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL received": {
                    '$reduce': {
                        'input': '$vilresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Confiramtion": {
                    '$reduce': {
                        'input': '$confiramtion.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Patient Report": {
                    '$reduce': {
                        'input': '$patientProfile.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Vil Letter": {
                    '$reduce': {
                        'input': '$vilLetter.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },

            }
        },
        {
            $project: {
                opinionrequest: 0,
                opinionreceived: 0,
                preintimation: 0,
                preintimationtime: 0,
                opdrequested: 0,
                opdresponse: 0,
                pirequest: 0,
                piresponse: 0,
                vilrequest: 0,
                vilresponse: 0,
                vilLetter: 0,
                patientProfile: 0,
                confiramtion: 0,
                ticket: 0,
                passports: 0,
                sentopinions: 0,
                sentDocPdf: 0
            }
        },
        {
            $group: {
                _id: "$user",
                data: {
                    $push: {
                        "name": "$name",
                        "Date": "$Date",
                        "Status": "$Status",
                        "Gender": "$Gender",
                        "Age": "$Age",
                        "Contact": "$Contact",
                        "Email Id": "$Email Id",
                        "Country": "$Country",
                        "Company UHID": "$Company UHID",
                        "Treatment": "$Treatment",
                        "Referral Partner": "$Referral Partner",
                        "Pre Intimation Sent Hospital": "$Pre Intimation Sent Hospital",
                        "Pre Intimation Time": "$Pre Intimation Time",
                        "OPD Request Hospital": "$OPD Request Hospital",
                        "OPD Response Hospital": "$OPD Response Hospital",
                        "Opinion request hospital assigned": "$Opinion request hospital assigned",
                        "Opinion received from Hospital": "$Opinion received from Hospital",
                        "Proforma Invoice Request": "$Proforma Invoice Request",
                        "Proforma Invoice Response": "$Proforma Invoice Response",
                        "VIL Request to Hospital": "$VIL Request to Hospital",
                        "VIL received": "$VIL received",
                        "Confiramtion": "$Confiramtion",
                        "Patient Report": "$Patient Report",
                        "Vil Letter": "$Vil Letter",
                        "Ticket Copy": "$Ticket Copy",
                        "Passport": "$Passports",
                        "Sent Opinions": "$Sent Opinions",
                        "Doctor Profile": "$Doctor Profile"

                    }
                }

            }
        },


        ]
        patient = await Patient.aggregate(pipeline)
        patient.forEach(async element => {

            const user = await Facilitator.findOne({ _id: element._id })
            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const planName = plan.data.plan.name.split(' ')[0]
                    if (planName == "Fac_Basic") {
                        var xls = json2xls(element.data);
                        var buffer = Buffer.from(xls, 'binary');
                        date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                        const designation = await Designation.find({ "user": user._id });
                        const company = await Company.find({ "user": user._id });

                        var address = "";
                        company[0].address.forEach(element => {
                            address += `${element.point1} <br/>`;

                        });
                        const credential = await Credential.findOne({ "user": user._id });

                        sendemail.autoMatedBackup(buffer, user.email, user.name, date, designation, company, address, credential)
                    }

                }
            }
            if (user.Role == 'Super') {
                var xls = json2xls(element.data);
                var buffer = Buffer.from(xls, 'binary');
                date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                const designation = await Designation.find({ "user": user._id });
                const company = await Company.find({ "user": user._id });

                var address = "";
                company[0].address.forEach(element => {
                    address += `${element.point1} <br/>`;

                });
                const credential = await Credential.findOne({ "user": user._id });

                sendemail.autoMatedBackup(buffer, user.email, user.name, date, designation, company, address, credential)
            }

        })

        res.send(patient)
    } catch (err) {
        next(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})
cron.schedule('0 9 * * MON', async () => {

    try {
        var pipeline = [{
            $lookup: {
                from: 'hospitalQueryAssign',
                localField: 'hospitalQueryAssigns',
                foreignField: '_id',
                as: 'request',

            }
        },
        {
            $lookup: {
                from: 'hospitalOpinionAdded',
                localField: 'hospitalOpinionsAdded',
                foreignField: '_id',
                as: 'received'
            }
        },

        {
            $lookup: {
                from: 'hospitalOpdAssign',
                localField: 'hospitalOpdAssigns',
                foreignField: '_id',
                as: 'opdrequest'
            }
        },
        {
            $lookup: {
                from: 'hospitalOpdAdded',
                localField: 'hospitalOpdAdded',
                foreignField: '_id',
                as: 'opdresponse'
            }
        },

        {
            $lookup: {
                from: 'hospitalVilAssign',
                localField: 'hospitalVilAssigns',
                foreignField: '_id',
                as: 'requestvils'
            }
        },
        {
            $lookup: {
                from: 'hospitalVilSent',
                localField: 'hospitalVilSent',
                foreignField: '_id',
                as: 'responsevils'
            }
        },
        {
            $lookup: {
                from: 'hospitalConfirmationAssign',
                localField: 'hospitalConfirmationAssign',
                foreignField: '_id',
                as: 'confirmations'
            }
        },
        {
            $lookup: {
                from: 'hospitalOpinionSent',
                localField: 'hospitalOpinionsSent',
                foreignField: '_id',
                as: 'sentopinions'
            }
        },

        {
            $project: {
                "_id": 0,
                "associatedhospital": 1,

                "name": 1,
                Date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                "Gender": {
                    $cond: {
                        if: { $eq: ["$gender", ""] },
                        then: "-",
                        else: "$gender"
                    }
                },
                "Age": {
                    $cond: {
                        if: { $eq: ["$age", ""] },
                        then: "-",
                        else: "$age"
                    }
                },
                "Contact": {
                    $cond: {
                        if: { $eq: ["$contact", ""] },
                        then: "-",
                        else: "$contact"
                    }
                },
                "Email Id": {
                    $cond: {
                        if: { $eq: ["$emailid", ""] },
                        then: "-",
                        else: "$emailid"
                    }
                },
                "Country": "$country",
                "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                "Treatment": {
                    $cond: {
                        if: { $eq: ["$treatment", ""] },
                        then: "-",
                        else: "$treatment"
                    }
                },
                "Referral Partner": {
                    $cond: {
                        if: { $eq: ["$refferalpartner", "NAN"] },
                        then: "NAN",
                        else: "$refferalpartner.name"
                    }
                },

                "opdrequested": {

                    $map: {
                        input: "$opdrequest",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }

                },
                "opdresponse": {

                    $map: {
                        input: "$opdresponse",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }

                },
                "sentopinions": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.opnionPdf"
                        }
                    }

                },
                "sentDocPdf": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.doctorPdf"
                        }
                    }

                },

                "opinionrequest": {
                    $map: {
                        input: "$request",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "opinionreceived": {
                    $map: {
                        input: "$received",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "vilrequest": {
                    $map: {
                        input: "$requestvils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },
                "vilresponse": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "confiramtion": {
                    $map: {
                        input: "$confirmations",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },
                "vilLetter": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            location: "$$up.vilLetter"
                        }
                    }
                },

                "patientProfile": {
                    $map: {
                        input: "$patientProfile",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "ticket": {
                    $map: {
                        input: "$confirmations.ticket",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "passports": {
                    $map: {
                        input: "$requestvils.passports",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
            },


        }, {
            $addFields: {


                "Ticket Copy": {
                    $cond: {
                        if: {
                            $eq: ["$ticket", []]
                        },
                        then: "",
                        else: '$ticket.location',

                    }
                },
                "Passports": {
                    $cond: {
                        if: {
                            $eq: ["$passports", []]
                        },
                        then: "",
                        else: '$passports.location',

                    }
                },
                "Sent Opinions": {
                    $cond: {
                        if: {
                            $eq: ["$sentopinions", []]
                        },
                        then: "",
                        else: '$sentopinions.location',

                    }
                },
                "Doctor Profile": {
                    $cond: {
                        if: {
                            $eq: ["$sentDocPdf", []]
                        },
                        then: "",
                        else: '$sentDocPdf.location',

                    }
                },
                "Vil Letter": {
                    $cond: {
                        if: {
                            $eq: ["$vilLetter", []]
                        },
                        then: "",
                        else: '$vilLetter.location',

                    }
                },
            }
        },
        {
            $addFields: {

                "OPD Request Hospital": {
                    '$reduce': {
                        'input': '$opdrequested.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Response Hospital": {
                    '$reduce': {
                        'input': '$opdresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion request hospital assigned": {
                    '$reduce': {
                        'input': '$opinionrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion received from Hospital": {
                    '$reduce': {
                        'input': '$opinionreceived.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },

                "VIL Request to Hospital": {
                    '$reduce': {
                        'input': '$vilrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL received": {
                    '$reduce': {
                        'input': '$vilresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Confiramtion": {
                    '$reduce': {
                        'input': '$confiramtion.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Patient Report": {
                    '$reduce': {
                        'input': '$patientProfile.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },



            }
        }, {
            $project: {
                opinionrequest: 0,
                opinionreceived: 0,
                opdrequested: 0,
                opdresponse: 0,
                vilrequest: 0,
                vilresponse: 0,
                vilLetter: 0,
                patientProfile: 0,
                confiramtion: 0,
                ticket: 0,
                passports: 0,
                sentopinions: 0,
                sentDocPdf: 0
            }
        },
        {
            $group: {
                _id: "$associatedhospital.id",
                data: {
                    $push: {
                        "name": "$name",
                        "Date": "$Date",
                        "Gender": "$Gender",
                        "Age": "$Age",
                        "Contact": "$Contact",
                        "Email Id": "$Email Id",
                        "Country": "$Country",
                        "Treatment": "$Treatment",
                        "Referral Partner": "$Referral Partner",
                        "OPD Assign": "$OPD Request Hospital",
                        "OPD Added": "$OPD Response Hospital",
                        "Opinion Assign": "$Opinion request hospital assigned",
                        "Opinion Added": "$Opinion received from Hospital",
                        "VIL Assign": "$VIL Request to Hospital",
                        "VIL Added": "$VIL received",
                        "Confiramtion Assign": "$Confiramtion",
                        "Patient Report": "$Patient Report",
                        "Vil Letter": "$Vil Letter",
                        "Ticket Copy": "$Ticket Copy",
                        "Passport": "$Passports",
                        "Sent Opinions": "$Sent Opinions",
                        "Doctor Profile": "$Doctor Profile"

                    }
                }

            }
        },


        ]
        patient = await hospitalPatient.aggregate(pipeline)
        patient.forEach(async element => {

            const user = await Hospital.findOne({ _id: element._id })
            console.log(user)
            if (user.subscription_id) {
                const tokenData = await Zoho.find({})
                const token = tokenData[tokenData.length - 1].data.access_token
                const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                const planName = plan.data.plan.name.split(' ')[0]
                if (planName == "Hos_Enterprise") {

                    var xls = json2xls(element.data);
                    var buffer = Buffer.from(xls, 'binary');
                    date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                    const designation = await HospitalDesignation.find({ "hospital": user._id });
                    const company = await HospitalCompany.find({ "hospital": user._id });

                    var address = "";
                    company[0].address.forEach(element => {
                        address += `${element.point1} <br/>`;

                    });
                    console.log(designation)
                    const credential = await HospitalCredential.findOne({ "hospital": user._id });

                    sendemail.autoMatedBackup(buffer, user.email, user.name.name, date, designation, company, address, credential)
                }
            }
        })

        res.send(patient)
    } catch (err) {
        next(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})
cron.schedule('0 9 */15 * *', async () => {

    try {
        var pipeline = [{
            $lookup: {
                from: 'hospitalQueryAssign',
                localField: 'hospitalQueryAssigns',
                foreignField: '_id',
                as: 'request',

            }
        },
        {
            $lookup: {
                from: 'hospitalOpinionAdded',
                localField: 'hospitalOpinionsAdded',
                foreignField: '_id',
                as: 'received'
            }
        },

        {
            $lookup: {
                from: 'hospitalOpdAssign',
                localField: 'hospitalOpdAssigns',
                foreignField: '_id',
                as: 'opdrequest'
            }
        },
        {
            $lookup: {
                from: 'hospitalOpdAdded',
                localField: 'hospitalOpdAdded',
                foreignField: '_id',
                as: 'opdresponse'
            }
        },

        {
            $lookup: {
                from: 'hospitalVilAssign',
                localField: 'hospitalVilAssigns',
                foreignField: '_id',
                as: 'requestvils'
            }
        },
        {
            $lookup: {
                from: 'hospitalVilSent',
                localField: 'hospitalVilSent',
                foreignField: '_id',
                as: 'responsevils'
            }
        },
        {
            $lookup: {
                from: 'hospitalConfirmationAssign',
                localField: 'hospitalConfirmationAssign',
                foreignField: '_id',
                as: 'confirmations'
            }
        },
        {
            $lookup: {
                from: 'hospitalOpinionSent',
                localField: 'hospitalOpinionsSent',
                foreignField: '_id',
                as: 'sentopinions'
            }
        },

        {
            $project: {
                "_id": 0,
                "associatedhospital": 1,

                "name": 1,
                Date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                "Gender": {
                    $cond: {
                        if: { $eq: ["$gender", ""] },
                        then: "-",
                        else: "$gender"
                    }
                },
                "Age": {
                    $cond: {
                        if: { $eq: ["$age", ""] },
                        then: "-",
                        else: "$age"
                    }
                },
                "Contact": {
                    $cond: {
                        if: { $eq: ["$contact", ""] },
                        then: "-",
                        else: "$contact"
                    }
                },
                "Email Id": {
                    $cond: {
                        if: { $eq: ["$emailid", ""] },
                        then: "-",
                        else: "$emailid"
                    }
                },
                "Country": "$country",
                "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                "Treatment": {
                    $cond: {
                        if: { $eq: ["$treatment", ""] },
                        then: "-",
                        else: "$treatment"
                    }
                },
                "Referral Partner": {
                    $cond: {
                        if: { $eq: ["$refferalpartner", "NAN"] },
                        then: "NAN",
                        else: "$refferalpartner.name"
                    }
                },

                "opdrequested": {

                    $map: {
                        input: "$opdrequest",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }

                },
                "opdresponse": {

                    $map: {
                        input: "$opdresponse",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }

                },
                "sentopinions": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.opnionPdf"
                        }
                    }

                },
                "sentDocPdf": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.doctorPdf"
                        }
                    }

                },

                "opinionrequest": {
                    $map: {
                        input: "$request",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "opinionreceived": {
                    $map: {
                        input: "$received",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "vilrequest": {
                    $map: {
                        input: "$requestvils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },
                "vilresponse": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "confiramtion": {
                    $map: {
                        input: "$confirmations",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },
                "vilLetter": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            location: "$$up.vilLetter"
                        }
                    }
                },

                "patientProfile": {
                    $map: {
                        input: "$patientProfile",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "ticket": {
                    $map: {
                        input: "$confirmations.ticket",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "passports": {
                    $map: {
                        input: "$requestvils.passports",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
            },


        }, {
            $addFields: {


                "Ticket Copy": {
                    $cond: {
                        if: {
                            $eq: ["$ticket", []]
                        },
                        then: "",
                        else: '$ticket.location',

                    }
                },
                "Passports": {
                    $cond: {
                        if: {
                            $eq: ["$passports", []]
                        },
                        then: "",
                        else: '$passports.location',

                    }
                },
                "Sent Opinions": {
                    $cond: {
                        if: {
                            $eq: ["$sentopinions", []]
                        },
                        then: "",
                        else: '$sentopinions.location',

                    }
                },
                "Doctor Profile": {
                    $cond: {
                        if: {
                            $eq: ["$sentDocPdf", []]
                        },
                        then: "",
                        else: '$sentDocPdf.location',

                    }
                },
                "Vil Letter": {
                    $cond: {
                        if: {
                            $eq: ["$vilLetter", []]
                        },
                        then: "",
                        else: '$vilLetter.location',

                    }
                },
            }
        },
        {
            $addFields: {

                "OPD Request Hospital": {
                    '$reduce': {
                        'input': '$opdrequested.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Response Hospital": {
                    '$reduce': {
                        'input': '$opdresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion request hospital assigned": {
                    '$reduce': {
                        'input': '$opinionrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion received from Hospital": {
                    '$reduce': {
                        'input': '$opinionreceived.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },

                "VIL Request to Hospital": {
                    '$reduce': {
                        'input': '$vilrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL received": {
                    '$reduce': {
                        'input': '$vilresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Confiramtion": {
                    '$reduce': {
                        'input': '$confiramtion.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Patient Report": {
                    '$reduce': {
                        'input': '$patientProfile.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },



            }
        }, {
            $project: {
                opinionrequest: 0,
                opinionreceived: 0,
                opdrequested: 0,
                opdresponse: 0,
                vilrequest: 0,
                vilresponse: 0,
                vilLetter: 0,
                patientProfile: 0,
                confiramtion: 0,
                ticket: 0,
                passports: 0,
                sentopinions: 0,
                sentDocPdf: 0
            }
        },
        {
            $group: {
                _id: "$associatedhospital.id",
                data: {
                    $push: {
                        "name": "$name",
                        "Date": "$Date",
                        "Gender": "$Gender",
                        "Age": "$Age",
                        "Contact": "$Contact",
                        "Email Id": "$Email Id",
                        "Country": "$Country",
                        "Treatment": "$Treatment",
                        "Referral Partner": "$Referral Partner",
                        "OPD Assign": "$OPD Request Hospital",
                        "OPD Added": "$OPD Response Hospital",
                        "Opinion Assign": "$Opinion request hospital assigned",
                        "Opinion Added": "$Opinion received from Hospital",
                        "VIL Assign": "$VIL Request to Hospital",
                        "VIL Added": "$VIL received",
                        "Confiramtion Assign": "$Confiramtion",
                        "Patient Report": "$Patient Report",
                        "Vil Letter": "$Vil Letter",
                        "Ticket Copy": "$Ticket Copy",
                        "Passport": "$Passports",
                        "Sent Opinions": "$Sent Opinions",
                        "Doctor Profile": "$Doctor Profile"

                    }
                }

            }
        },


        ]
        patient = await hospitalPatient.aggregate(pipeline)
        patient.forEach(async element => {

            const user = await Hospital.findOne({ _id: element._id })
            console.log(user)
            if (user.subscription_id) {
                const tokenData = await Zoho.find({})
                const token = tokenData[tokenData.length - 1].data.access_token
                const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                const planName = plan.data.plan.name.split(' ')[0]
                if (planName == "Hos_Pro") {

                    var xls = json2xls(element.data);
                    var buffer = Buffer.from(xls, 'binary');
                    date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                    const designation = await HospitalDesignation.find({ "hospital": user._id });
                    const company = await HospitalCompany.find({ "hospital": user._id });

                    var address = "";
                    company[0].address.forEach(element => {
                        address += `${element.point1} <br/>`;

                    });
                    console.log(designation)
                    const credential = await HospitalCredential.findOne({ "hospital": user._id });

                    sendemail.autoMatedBackup(buffer, user.email, user.name.name, date, designation, company, address, credential)
                }
            }
        })

        res.send(patient)
    } catch (err) {
        next(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})
cron.schedule('0 9 1 * *', async () => {

    try {
        var pipeline = [{
            $lookup: {
                from: 'hospitalQueryAssign',
                localField: 'hospitalQueryAssigns',
                foreignField: '_id',
                as: 'request',

            }
        },
        {
            $lookup: {
                from: 'hospitalOpinionAdded',
                localField: 'hospitalOpinionsAdded',
                foreignField: '_id',
                as: 'received'
            }
        },

        {
            $lookup: {
                from: 'hospitalOpdAssign',
                localField: 'hospitalOpdAssigns',
                foreignField: '_id',
                as: 'opdrequest'
            }
        },
        {
            $lookup: {
                from: 'hospitalOpdAdded',
                localField: 'hospitalOpdAdded',
                foreignField: '_id',
                as: 'opdresponse'
            }
        },

        {
            $lookup: {
                from: 'hospitalVilAssign',
                localField: 'hospitalVilAssigns',
                foreignField: '_id',
                as: 'requestvils'
            }
        },
        {
            $lookup: {
                from: 'hospitalVilSent',
                localField: 'hospitalVilSent',
                foreignField: '_id',
                as: 'responsevils'
            }
        },
        {
            $lookup: {
                from: 'hospitalConfirmationAssign',
                localField: 'hospitalConfirmationAssign',
                foreignField: '_id',
                as: 'confirmations'
            }
        },
        {
            $lookup: {
                from: 'hospitalOpinionSent',
                localField: 'hospitalOpinionsSent',
                foreignField: '_id',
                as: 'sentopinions'
            }
        },

        {
            $project: {
                "_id": 0,
                "associatedhospital": 1,

                "name": 1,
                Date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                "Gender": {
                    $cond: {
                        if: { $eq: ["$gender", ""] },
                        then: "-",
                        else: "$gender"
                    }
                },
                "Age": {
                    $cond: {
                        if: { $eq: ["$age", ""] },
                        then: "-",
                        else: "$age"
                    }
                },
                "Contact": {
                    $cond: {
                        if: { $eq: ["$contact", ""] },
                        then: "-",
                        else: "$contact"
                    }
                },
                "Email Id": {
                    $cond: {
                        if: { $eq: ["$emailid", ""] },
                        then: "-",
                        else: "$emailid"
                    }
                },
                "Country": "$country",
                "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
                "Treatment": {
                    $cond: {
                        if: { $eq: ["$treatment", ""] },
                        then: "-",
                        else: "$treatment"
                    }
                },
                "Referral Partner": {
                    $cond: {
                        if: { $eq: ["$refferalpartner", "NAN"] },
                        then: "NAN",
                        else: "$refferalpartner.name"
                    }
                },

                "opdrequested": {

                    $map: {
                        input: "$opdrequest",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }

                },
                "opdresponse": {

                    $map: {
                        input: "$opdresponse",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }

                },
                "sentopinions": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.opnionPdf"
                        }
                    }

                },
                "sentDocPdf": {

                    $map: {
                        input: "$sentopinions",
                        as: "up",
                        in: {
                            location: "$$up.doctorPdf"
                        }
                    }

                },

                "opinionrequest": {
                    $map: {
                        input: "$request",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "opinionreceived": {
                    $map: {
                        input: "$received",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "vilrequest": {
                    $map: {
                        input: "$requestvils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },
                "vilresponse": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },

                "confiramtion": {
                    $map: {
                        input: "$confirmations",
                        as: "up",
                        in: {
                            hospitalname: "$$up.hospitalName"
                        }
                    }
                },
                "vilLetter": {
                    $map: {
                        input: "$responsevils",
                        as: "up",
                        in: {
                            location: "$$up.vilLetter"
                        }
                    }
                },

                "patientProfile": {
                    $map: {
                        input: "$patientProfile",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "ticket": {
                    $map: {
                        input: "$confirmations.ticket",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
                "passports": {
                    $map: {
                        input: "$requestvils.passports",
                        as: "up",
                        in: {
                            location: "$$up.location"
                        }
                    }
                },
            },


        }, {
            $addFields: {


                "Ticket Copy": {
                    $cond: {
                        if: {
                            $eq: ["$ticket", []]
                        },
                        then: "",
                        else: '$ticket.location',

                    }
                },
                "Passports": {
                    $cond: {
                        if: {
                            $eq: ["$passports", []]
                        },
                        then: "",
                        else: '$passports.location',

                    }
                },
                "Sent Opinions": {
                    $cond: {
                        if: {
                            $eq: ["$sentopinions", []]
                        },
                        then: "",
                        else: '$sentopinions.location',

                    }
                },
                "Doctor Profile": {
                    $cond: {
                        if: {
                            $eq: ["$sentDocPdf", []]
                        },
                        then: "",
                        else: '$sentDocPdf.location',

                    }
                },
                "Vil Letter": {
                    $cond: {
                        if: {
                            $eq: ["$vilLetter", []]
                        },
                        then: "",
                        else: '$vilLetter.location',

                    }
                },
            }
        },
        {
            $addFields: {

                "OPD Request Hospital": {
                    '$reduce': {
                        'input': '$opdrequested.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "OPD Response Hospital": {
                    '$reduce': {
                        'input': '$opdresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion request hospital assigned": {
                    '$reduce': {
                        'input': '$opinionrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Opinion received from Hospital": {
                    '$reduce': {
                        'input': '$opinionreceived.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },

                "VIL Request to Hospital": {
                    '$reduce': {
                        'input': '$vilrequest.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "VIL received": {
                    '$reduce': {
                        'input': '$vilresponse.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Confiramtion": {
                    '$reduce': {
                        'input': '$confiramtion.hospitalname',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },
                "Patient Report": {
                    '$reduce': {
                        'input': '$patientProfile.location',
                        'initialValue': '',
                        'in': {
                            '$concat': [
                                '$$value',
                                { '$cond': [{ '$eq': ['$$value', ''] }, '', ', '] },
                                '$$this'
                            ]
                        }
                    }
                },



            }
        }, {
            $project: {
                opinionrequest: 0,
                opinionreceived: 0,
                opdrequested: 0,
                opdresponse: 0,
                vilrequest: 0,
                vilresponse: 0,
                vilLetter: 0,
                patientProfile: 0,
                confiramtion: 0,
                ticket: 0,
                passports: 0,
                sentopinions: 0,
                sentDocPdf: 0
            }
        },
        {
            $group: {
                _id: "$associatedhospital.id",
                data: {
                    $push: {
                        "name": "$name",
                        "Date": "$Date",
                        "Gender": "$Gender",
                        "Age": "$Age",
                        "Contact": "$Contact",
                        "Email Id": "$Email Id",
                        "Country": "$Country",
                        "Treatment": "$Treatment",
                        "Referral Partner": "$Referral Partner",
                        "OPD Assign": "$OPD Request Hospital",
                        "OPD Added": "$OPD Response Hospital",
                        "Opinion Assign": "$Opinion request hospital assigned",
                        "Opinion Added": "$Opinion received from Hospital",
                        "VIL Assign": "$VIL Request to Hospital",
                        "VIL Added": "$VIL received",
                        "Confiramtion Assign": "$Confiramtion",
                        "Patient Report": "$Patient Report",
                        "Vil Letter": "$Vil Letter",
                        "Ticket Copy": "$Ticket Copy",
                        "Passport": "$Passports",
                        "Sent Opinions": "$Sent Opinions",
                        "Doctor Profile": "$Doctor Profile"

                    }
                }

            }
        },


        ]
        patient = await hospitalPatient.aggregate(pipeline)
        patient.forEach(async element => {

            const user = await Hospital.findOne({ _id: element._id })
            console.log(user)
            if (user.subscription_id) {
                const tokenData = await Zoho.find({})
                const token = tokenData[tokenData.length - 1].data.access_token
                const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                const planName = plan.data.plan.name.split(' ')[0]
                if (planName == "Hos_Basic") {

                    var xls = json2xls(element.data);
                    var buffer = Buffer.from(xls, 'binary');
                    date = moment(new Date()).tz("Asia/Kolkata").format('YYYY-MM-DD');
                    const designation = await HospitalDesignation.find({ "hospital": user._id });
                    const company = await HospitalCompany.find({ "hospital": user._id });

                    var address = "";
                    company[0].address.forEach(element => {
                        address += `${element.point1} <br/>`;

                    });
                    console.log(designation)
                    const credential = await HospitalCredential.findOne({ "hospital": user._id });

                    sendemail.autoMatedBackup(buffer, user.email, user.name.name, date, designation, company, address, credential)
                }
            }
        })

        res.send(patient)
    } catch (err) {
        next(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})

exports.patientFacBackupHospital = async (req, res, next) => {

    try {
        var pipeline = [{
            $lookup: {
                from: 'request',
                localField: 'requests',
                foreignField: '_id',
                as: 'request',

            }
        },
        {
            $lookup: {
                from: 'received',
                localField: 'receives',
                foreignField: '_id',
                as: 'received'
            }
        },
        {
            $lookup: {
                from: 'preintimation',
                localField: 'preintimations',
                foreignField: '_id',
                as: 'preintimation'
            }
        },
        {
            $lookup: {
                from: 'opdrequest',
                localField: 'opdrequests',
                foreignField: '_id',
                as: 'opdrequest'
            }
        },
        {
            $lookup: {
                from: 'opdresponse',
                localField: 'opdresponses',
                foreignField: '_id',
                as: 'opdresponse'
            }
        },
        {
            $lookup: {
                from: 'pirequest',
                localField: 'pirequests',
                foreignField: '_id',
                as: 'pirequests'
            }
        },
        {
            $lookup: {
                from: 'piresponse',
                localField: 'piresponses',
                foreignField: '_id',
                as: 'piresponses'
            }
        },
        {
            $lookup: {
                from: 'requestvil',
                localField: 'requestvils',
                foreignField: '_id',
                as: 'requestvils'
            }
        },
        {
            $lookup: {
                from: 'responsevil',
                localField: 'responsevils',
                foreignField: '_id',
                as: 'responsevils'
            }
        },
        {
            $lookup: {
                from: 'confirmation',
                localField: 'confirmations',
                foreignField: '_id',
                as: 'confirmations'
            }
        },
        {
            $lookup: {
                from: 'sentopinion',
                localField: 'sentopinions',
                foreignField: '_id',
                as: 'sentopinions'
            }
        },
        { $unwind: "$request" },
        {
            $group: {
                _id: "$request.hospitalid",
                opinionData: {
                    $push: {
                        patient: "$request.patient",
                        hospitalName: "$request.hospitalname"
                    }
                }
            }
        },
        { $unwind: "$opinionData" },
        {
            $group: {
                _id: {
                    hospitalId: "$_id",
                    patientId: "$opinionData.patient",

                },
                data: {
                    $push: {
                        hospitalName: "$opinionData.hospitalName"
                    }
                }
            }
        },
            // { $unwind: "$received" },
            // {
            //     $group: {
            //         _id: "$received.hospitalid",
            //         data: {
            //             $push: {
            //                 patient: "$received.patient"
            //             }
            //         }
            //     }
            // },
            // {
            //     $project: {
            //         "_id": 0,
            //         "user": 1,

            //         "name": 1,
            //         Date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            //         "Status": "$currentstatus",
            //         "Gender": {
            //             $cond: {
            //                 if: { $eq: ["$gender", ""] },
            //                 then: "-",
            //                 else: "$gender"
            //             }
            //         },
            //         "Age": {
            //             $cond: {
            //                 if: { $eq: ["$age", ""] },
            //                 then: "-",
            //                 else: "$age"
            //             }
            //         },
            //         "Contact": {
            //             $cond: {
            //                 if: { $eq: ["$contact", ""] },
            //                 then: "-",
            //                 else: "$contact"
            //             }
            //         },
            //         "Email Id": {
            //             $cond: {
            //                 if: { $eq: ["$emailid", ""] },
            //                 then: "-",
            //                 else: "$emailid"
            //             }
            //         },
            //         "Country": "$country",
            //         "Company UHID": { $concat: ["$uhidcode", "$mhid"] },
            //         "Treatment": {
            //             $cond: {
            //                 if: { $eq: ["$treatment", ""] },
            //                 then: "-",
            //                 else: "$treatment"
            //             }
            //         },
            //         "Referral Partner": {
            //             $cond: {
            //                 if: { $eq: ["$refferalpartner", "NAN"] },
            //                 then: "NAN",
            //                 else: "$refferalpartner.name"
            //             }
            //         },

            //         "preintimation": {
            //             $map: {
            //                 input: "$preintimation",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },
            //         "preintimationtime": {
            //             $map: {
            //                 input: "$preintimation",
            //                 as: "up",
            //                 in: {
            //                     date: { $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$$up.date", timezone: "+05:30" } },
            //                 }
            //             }
            //         },
            //         "opdrequested": {

            //             $map: {
            //                 input: "$opdrequest",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }

            //         },
            //         "opdresponse": {

            //             $map: {
            //                 input: "$opdresponse",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }

            //         },
            //         "sentopinions": {

            //             $map: {
            //                 input: "$sentopinions",
            //                 as: "up",
            //                 in: {
            //                     location: "$$up.opnionPdf"
            //                 }
            //             }

            //         },
            //         "sentDocPdf": {

            //             $map: {
            //                 input: "$sentopinions",
            //                 as: "up",
            //                 in: {
            //                     location: "$$up.doctorPdf"
            //                 }
            //             }

            //         },
            //         "pirequest": {
            //             $map: {
            //                 input: "$pirequests",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },
            //         "piresponse": {
            //             $map: {
            //                 input: "$piresponses",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },
            //         "opinionrequest": {
            //             $map: {
            //                 input: "$request",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },

            //         "opinionreceived": {
            //             $map: {
            //                 input: "$received",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },

            //         "vilrequest": {
            //             $map: {
            //                 input: "$requestvils",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },
            //         "vilresponse": {
            //             $map: {
            //                 input: "$responsevils",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },

            //         "confiramtion": {
            //             $map: {
            //                 input: "$confirmations",
            //                 as: "up",
            //                 in: {
            //                     hospitalname: "$$up.hospitalname"
            //                 }
            //             }
            //         },
            //         "vilLetter": {
            //             $map: {
            //                 input: "$responsevils",
            //                 as: "up",
            //                 in: {
            //                     location: "$$up.villetter.location"
            //                 }
            //             }
            //         },

            //         "patientProfile": {
            //             $map: {
            //                 input: "$patientProfile",
            //                 as: "up",
            //                 in: {
            //                     location: "$$up.location"
            //                 }
            //             }
            //         },
            //         "ticket": {
            //             $map: {
            //                 input: "$confirmations.ticket",
            //                 as: "up",
            //                 in: {
            //                     location: "$$up.location"
            //                 }
            //             }
            //         },
            //         "passports": {
            //             $map: {
            //                 input: "$requestvils.passports",
            //                 as: "up",
            //                 in: {
            //                     location: "$$up.location"
            //                 }
            //             }
            //         },
            //     },


            // }, {
            //     $addFields: {
            //         "Pre Intimation Sent Hospital": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$preintimation", []]
            //                 },
            //                 then: "-",
            //                 else: '$preintimation.hospitalname',

            //             }
            //         },
            //         "Pre Intimation Time": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$preintimationtime", []]
            //                 },
            //                 then: "-",
            //                 else: '$preintimationtime.date',

            //             }
            //         },
            //         "OPD Request Hospital": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$opdrequested", []]
            //                 },
            //                 then: "-",
            //                 else: '$opdrequested.hospitalname',

            //             }
            //         },
            //         "OPD Response Hospital": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$opdresponse", []]
            //                 },
            //                 then: "-",
            //                 else: '$opdresponse.hospitalname',

            //             }
            //         },
            //         "Opinion request hospital assigned": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$opinionrequest", []]
            //                 },
            //                 then: "-",
            //                 else: '$opinionrequest.hospitalname',

            //             }
            //         },
            //         "Opinion received from Hospital": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$opinionreceived", []]
            //                 },
            //                 then: "-",
            //                 else: '$opinionreceived.hospitalname',

            //             }
            //         },
            //         "Sent Opinions": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$sentopinions", []]
            //                 },
            //                 then: "-",
            //                 else: '$sentopinions.location',

            //             }
            //         },
            //         "Doctor Profile": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$sentDocPdf", []]
            //                 },
            //                 then: "-",
            //                 else: '$sentDocPdf.location',

            //             }
            //         },

            //         "Proforma Invoice Request": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$pirequest", []]
            //                 },
            //                 then: "-",
            //                 else: '$pirequest.hospitalname',

            //             }
            //         },
            //         "Proforma Invoice Response": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$piresponse", []]
            //                 },
            //                 then: "-",
            //                 else: '$piresponse.hospitalname',

            //             }
            //         },
            //         "VIL Request to Hospital": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$vilrequest", []]
            //                 },
            //                 then: "-",
            //                 else: '$vilrequest.hospitalname',

            //             }
            //         },
            //         "VIL received": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$vilresponse", []]
            //                 },
            //                 then: "-",
            //                 else: '$vilresponse.hospitalname',

            //             }
            //         },
            //         "Confiramtion": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$confiramtion", []]
            //                 },
            //                 then: "-",
            //                 else: '$confiramtion.hospitalname',

            //             }
            //         },

            //         "Patient Report": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$patientProfile", []]
            //                 },
            //                 then: "-",
            //                 else: '$patientProfile.location',

            //             }
            //         },
            //         "Vil Letter": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$vilLetter", []]
            //                 },
            //                 then: "-",
            //                 else: '$vilLetter.location',

            //             }
            //         },
            //         "Ticket Copy": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$ticket", []]
            //                 },
            //                 then: "-",
            //                 else: '$ticket.location',

            //             }
            //         },
            //         "Passports": {
            //             $cond: {
            //                 if: {
            //                     $eq: ["$passports", []]
            //                 },
            //                 then: "-",
            //                 else: '$passports.location',

            //             }
            //         },

            //     }
            // }, {
            //     $project: {
            //         opinionrequest: 0,
            //         opinionreceived: 0,
            //         preintimation: 0,
            //         preintimationtime: 0,
            //         opdrequested: 0,
            //         opdresponse: 0,
            //         pirequest: 0,
            //         piresponse: 0,
            //         vilrequest: 0,
            //         vilresponse: 0,
            //         vilLetter: 0,
            //         patientProfile: 0,
            //         confiramtion: 0,
            //         ticket: 0,
            //         passports: 0,
            //         sentopinions: 0,
            //         sentDocPdf: 0
            //     }
            // },
            // {
            //     $group: {
            //         _id: "$user",
            //         data: {
            //             $push: {
            //                 "name": "$name",
            //                 "Date": "$Date",
            //                 "Status": "$Status",
            //                 "Gender": "$Gender",
            //                 "Age": "$Age",
            //                 "Contact": "$Contact",
            //                 "Email Id": "$Email Id",
            //                 "Country": "$Country",
            //                 "Company UHID": "$Company UHID",
            //                 "Treatment": "$Treatment",
            //                 "Referral Partner": "$Referral Partner",
            //                 "Pre Intimation Sent Hospital": "$Pre Intimation Sent Hospital",
            //                 "Pre Intimation Time": "$Pre Intimation Time",
            //                 "OPD Request Hospital": "$OPD Request Hospital",
            //                 "OPD Response Hospital": "$OPD Response Hospital",
            //                 "Opinion request hospital assigned": "$Opinion request hospital assigned",
            //                 "Opinion received from Hospital": "$Opinion received from Hospital",
            //                 "Proforma Invoice Request": "$Proforma Invoice Request",
            //                 "Proforma Invoice Response": "$Proforma Invoice Response",
            //                 "VIL Request to Hospital": "$VIL Request to Hospital",
            //                 "VIL received": "$VIL received",
            //                 "Confiramtion": "$Confiramtion",
            //                 "Patient Report": "$Patient Report",
            //                 "Vil Letter": "$Vil Letter",
            //                 "Ticket Copy": "$Ticket Copy",
            //                 "Passport": "$Passports",
            //                 "Sent Opinions": "$Sent Opinions",
            //                 "Doctor Profile": "$Doctor Profile"

            //             }
            //         }

            //     }
            // },


        ]
        patient = await Patient.aggregate(pipeline)
        patient.forEach(element => {
            var xls = json2xls(element.data);
            const buffer = Buffer.from(xls, 'binary');
            sendemail.autoMatedBackup(buffer)
        })

        res.send(patient)
    } catch (err) {
        next(err)
    }
}

exports.checkReports = async (req, res, next) => {
    try {
        var today = new Date()
        console.log('on')
        today.setHours(21, 0, 0, 0)
        var yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(21, 01, 0, 0)
        console.log('today', today);
        console.log('yesterday', yesterday)
        dailydate = dateFormat(today, "mmmm dS, yyyy");

        let date = new Date();

        var firstDay =
            new Date(date.getFullYear(), date.getMonth(), 1);

        var lastDay =
            new Date(date.getFullYear(), date.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 0, 0)

        monthlydate = dateFormat(firstDay, "mmmm dS, yyyy");


        var firstyear = new Date()
        firstyear.setMonth(3);
        firstyear.setDate(1);
        firstyear.setHours(0, 0, 0, 0)
        var nextyear = new Date()
        nextyear.setMonth(2);
        nextyear.setDate(31);
        nextyear.setFullYear(firstyear.getFullYear() + 1);
        nextyear.setHours(23, 59, 0, 0)
        yearlydate = dateFormat(firstyear, "mmmm dS, yyyy");
        yearlyyear = firstyear.getFullYear() + "-" + (firstyear.getFullYear() + 1)

        doc = await Patient.aggregate(pipeline.pipeline).allowDiskUse(true)
        doc.map((obj) => {
            obj['dailydate'] = dailydate
            // obj['monthlydate'] = monthlydate
            // obj['yearlydate'] = yearlydate
            // obj['yearlyyear'] = yearlyyear

            return obj

        })

        for (let i = 0; i < doc.length; i++) {
            // month = doc[i].monthlydata.hospital
            // month.map((obj) => {
            //     if (obj.hospitalvil == undefined) {
            //         obj['hospitalvil'] = 0

            //     }
            //     if (obj.hospitalconfirmation == undefined) {
            //         obj['hospitalconfirmation'] = 0
            //     }
            //     return obj

            // })
            daily = doc[i].dailydata.hospital

            // daily.map((obj) => {
            //     if (obj.hospitalvil == undefined) {
            //         obj['hospitalvil'] = 0

            //     }
            //     if (obj.hospitalconfirmation == undefined) {
            //         obj['hospitalconfirmation'] = 0
            //     }
            //     return obj




            // })
            // annual = doc[i].annualdata.hospital

            // annual.map((obj) => {
            //     if (obj.hospitalvil == undefined) {
            //         obj['hospitalvil'] = 0

            //     }
            //     if (obj.hospitalconfirmation == undefined) {
            //         obj['hospitalconfirmation'] = 0
            //     }
            //     return obj

            // })
            userid = doc[i]._id
            console.log(userid)
            company = await Company.find({ "user": userid });
            doc[i].company = company[0]

            emailccsend = []

            user = await Facilitator.findOne({ "_id": userid });

            emailcc = await Userrole.find({ "user": userid })
            emailcc.forEach(element => {
                if (element.Role == "Management")
                    emailccsend.push(element.email)
            })
            console.log(emailccsend)
            getemail = await Credential.findOne({ "user": userid });
            if (i == 1) {
                res.send(doc[i])

            }
            // sendemail.autoReportsDaily(doc[i], company, emailccsend, getemail, user)

        }
    } catch (err) {
        console.log(err)
    }
}