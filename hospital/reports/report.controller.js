const Report = require('./report.model')
const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
const Group = require('../hospital-groups/group.model')
const Request = require('../../app/opinion-request/request.model')
var aws = require('aws-sdk')
var dateFormat = require("dateformat");
const daily = require('./daily-data-unit');
const monthly = require('./monthly-data-unit');
const annualy = require('./annual-data-unit');
const HospitalDetails = require('../hospital-details/details.model')
const sendEmail = require('../sendmail/sendmail')
const cron = require('node-cron');

const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
exports.getHospitalGroupReports = async(req, res, next) => {
    try {
        if (req.body.startdate == req.body.enddate) {
            return res.status(400).send({ message: "Both the date are same" })
        }
        const { hospitalgroup } = req.params;

        const { userid } = req.params;
        const report = new Report();
        report.role = req.body.role;
        report.startdate = req.body.startdate;
        report.enddate = req.body.enddate;
        report.enddate.setDate(report.enddate.getDate() - 1)
        report.enddate.setHours(23, 59, 0, 0)

        const user = await Hospital.findById(userid)


        if (req.body.role['Role'] != 'Hospital Unit Admin') {

            var pipeline = [{
                    $match: {
                        hospitalgroup: ObjectId(hospitalgroup),
                    }
                },

                {
                    $group: {
                        _id: "$hospitalgroup",
                        hospitalname: {
                            $push: "$name"
                        }
                    }
                }

            ]
            doc = await Group.aggregate(pipeline)
            arr = doc[0].hospitalname
            console.log(arr)
            var pipeline2 = [{

                    $project: {
                        hospitalname: 1,
                        patient: 1
                    },


                },
                {
                    "$redact": {
                        "$cond": [{
                                "$in": [
                                    "$hospitalname",
                                    arr
                                ]
                            },
                            "$$KEEP",
                            "$$PRUNE"
                        ]
                    }

                },
                {
                    $lookup: {
                        from: 'patient',
                        localField: 'patient',
                        foreignField: '_id',
                        as: 'patient',

                    }
                },
                {
                    $addFields: {
                        "patient": {
                            $arrayElemAt: ["$patient", 0]
                        }
                    }
                },
                {
                    $match: {
                        "patient.date": { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    }
                },
                {
                    $project: {
                        "hospitalname": 1,
                        "_id": 0,
                        "Patient Name": "$patient.name",
                        "Date": { $dateToString: { format: "%Y-%m-%d", date: "$patient.date" } },
                        "Gender": {
                            $cond: {
                                if: { $eq: ["$patient.gender", ""] },
                                then: "-",
                                else: "$patient.gender"
                            }
                        },
                        "Age": {
                            $cond: {
                                if: { $eq: ["$patient.age", ""] },
                                then: "-",
                                else: "$patient.age"
                            }
                        },

                        "Country": "$patient.country",
                        "Company UHID": { $concat: ["$patient.uhidcode", "$patient.mhid"] },
                        "Treatment": {
                            $cond: {
                                if: { $eq: ["$patient.treatment", ""] },
                                then: "-",
                                else: "$patient.treatment"
                            }
                        },
                        "Referral Partner": "$patient.companyname",
                    },


                },

            ]
        } else if (req.body.role['Role'] == 'Hospital Unit Admin') {
            var pipeline2 = [{
                    $match: {
                        hospitalid: hospitalgroup,
                        date: { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    }
                },
                {
                    $lookup: {
                        from: 'patient',
                        localField: 'patient',
                        foreignField: '_id',
                        as: 'patient',

                    }
                },
                {
                    $addFields: {
                        "patient": {
                            $arrayElemAt: ["$patient", 0]
                        }
                    }
                },
                {
                    $match: {
                        "patient.date": { $gte: new Date(req.body.startdate), $lte: new Date(req.body.enddate) },
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "Patient Name": "$patient.name",
                        "Date": { $dateToString: { format: "%Y-%m-%d", date: "$patient.date" } },
                        "Gender": {
                            $cond: {
                                if: { $eq: ["$patient.gender", ""] },
                                then: "-",
                                else: "$patient.gender"
                            }
                        },
                        "Age": {
                            $cond: {
                                if: { $eq: ["$patient.age", ""] },
                                then: "-",
                                else: "$patient.age"
                            }
                        },

                        "Country": "$patient.country",
                        "Company UHID": { $concat: ["$patient.uhidcode", "$patient.mhid"] },
                        "Treatment": {
                            $cond: {
                                if: { $eq: ["$patient.treatment", ""] },
                                then: "-",
                                else: "$patient.treatment"
                            }
                        },
                        "Referral Partner": "$patient.companyname",
                    },


                },

            ]
        }
        var json2xls = require('json2xls');

        finaldata = await Request.aggregate(pipeline2)
        var xls = json2xls(finaldata);
        const buffer = Buffer.from(xls, 'binary');
        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `report.xlsx`,
            Body: buffer,
            ACL: 'public-read',
            ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };
        await s3.upload(params, async function(err, data) {
            console.log(err, data);
            report.downloadreport = data.Location
            report.hospital = user
            await report.save()
            user.hospitalreports.push(report)
            await user.save()
            res.xls('data.xlsx', finaldata);

        });

    } catch (err) {
        next(err)
    }

}
exports.getReports = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Hospital.findById(userid).populate('hospitalreports')

        res.send(user.hospitalreports)
    } catch (err) {
        next(err);
    }

}
exports.getReportsByGroup = async(req, res, next) => {
    try {
        const { hospitalgroup } = req.params;
        var pipeline = [{
                $match: {
                    hospitalgroup: ObjectId(hospitalgroup),
                }
            },

            {
                $group: {
                    _id: "$hospitalgroup",
                    hospitalid: {
                        $push: {
                            $toString: "$_id",


                        }

                    }
                }
            },

        ]
        doc = await Group.aggregate(pipeline)
        doc[0].hospitalid.push(hospitalgroup)
        data = await Report.find({
            "role.hospitalid": {
                $in: doc[0].hospitalid
            }
        })
        res.send(data)

    } catch (err) {
        next(err)
    }

}