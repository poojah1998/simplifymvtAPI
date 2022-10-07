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

cron.schedule('30 20 * * *', async() => {
    try {
        var pipeline1 = [{

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

        doc = await Group.aggregate(pipeline1)
        dailyPipe = daily.dailyData(doc);
        monthlyPipe = monthly.monthlyData(doc)
        annualyPipe = annualy.annualData(doc)


        var pipeline2 = [{
                $facet: {
                    "dailyData": dailyPipe,
                    "monthlyData": monthlyPipe,
                    "annualData": annualyPipe
                },
            },
            { $project: { activity: { $setUnion: ['$dailyData', '$monthlyData', '$annualData'] } } },
            { $unwind: '$activity' },
            { $replaceRoot: { newRoot: "$activity" } },
            {
                $group: {
                    _id: "$_id",
                    dailyData: {
                        $push: {
                            $cond: {
                                if: {
                                    $eq: ["$range", "dailyData"]
                                },
                                then: {
                                    countryWise: "$countryWise",
                                    treatmentWise: "$treatmentWise",
                                    hospitalWise: "$hospitalWise",
                                    refferalWise: "$refferalWise",
                                    todayArrivalConfirmed: "$todayArrivalConfirmed",
                                    totalPatient: "$totalPatient",
                                    arrivalConfirmed: "$arrivalConfirmed",
                                    arrivingToday: "$arrivingToday",
                                    arrivingSevenDays: "$arrivingSevenDays",
                                    countryQueryTotal: "$countryQueryTotal",
                                    countryVilTotal: "$countryVilTotal",
                                    countryConfTotal: "$countryConfTotal",

                                    treatmentQueryTotal: "$treatmentQueryTotal",
                                    treatmentVilTotal: "$treatmentVilTotal",
                                    treatmentConfTotal: "$treatmentConfTotal",

                                    hospitalQueryTotal: "$hospitalQueryTotal",
                                    hospitalVilTotal: "$hospitalVilTotal",
                                    hospitalConfTotal: "$hospitalConfTotal",

                                    refferalQueryTotal: "$refferalQueryTotal",
                                    refferalVilTotal: "$refferalVilTotal",
                                    refferalConfTotal: "$refferalConfTotal",

                                },
                                else: "$$REMOVE",

                            }

                        }
                    },
                    monthlyData: {
                        $push: {
                            $cond: {
                                if: {
                                    $eq: ["$range", "monthlyData"]
                                },
                                then: {
                                    countryWise: "$countryWise",
                                    treatmentWise: "$treatmentWise",
                                    hospitalWise: "$hospitalWise",
                                    refferalWise: "$refferalWise",

                                    countryQueryTotal: "$countryQueryTotal",
                                    countryVilTotal: "$countryVilTotal",
                                    countryConfTotal: "$countryConfTotal",

                                    treatmentQueryTotal: "$treatmentQueryTotal",
                                    treatmentVilTotal: "$treatmentVilTotal",
                                    treatmentConfTotal: "$treatmentConfTotal",

                                    hospitalQueryTotal: "$hospitalQueryTotal",
                                    hospitalVilTotal: "$hospitalVilTotal",
                                    hospitalConfTotal: "$hospitalConfTotal",

                                    refferalQueryTotal: "$refferalQueryTotal",
                                    refferalVilTotal: "$refferalVilTotal",
                                    refferalConfTotal: "$refferalConfTotal",

                                },
                                else: "$$REMOVE",

                            }

                        }
                    },
                    annualData: {
                        $push: {
                            $cond: {
                                if: {
                                    $eq: ["$range", "annualData"]
                                },
                                then: {
                                    countryWise: "$countryWise",
                                    treatmentWise: "$treatmentWise",
                                    hospitalWise: "$hospitalWise",
                                    refferalWise: "$refferalWise",

                                    countryQueryTotal: "$countryQueryTotal",
                                    countryVilTotal: "$countryVilTotal",
                                    countryConfTotal: "$countryConfTotal",

                                    treatmentQueryTotal: "$treatmentQueryTotal",
                                    treatmentVilTotal: "$treatmentVilTotal",
                                    treatmentConfTotal: "$treatmentConfTotal",

                                    hospitalQueryTotal: "$hospitalQueryTotal",
                                    hospitalVilTotal: "$hospitalVilTotal",
                                    hospitalConfTotal: "$hospitalConfTotal",

                                    refferalQueryTotal: "$refferalQueryTotal",
                                    refferalVilTotal: "$refferalVilTotal",
                                    refferalConfTotal: "$refferalConfTotal",

                                },
                                else: "$$REMOVE",

                            }

                        }
                    },

                },

            },
            {
                $project: {
                    dailyData: {

                        $cond: {
                            if: {
                                $eq: ["$dailyData", []]
                            },
                            then: {
                                countryWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                treatmentWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                hospitalWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                hospital: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,
                                }],
                                refferalWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,
                                }],
                                "todayArrivalConfirmed": [{
                                    "arrivalDate": "NIL",
                                    "flightName": "NIL",
                                    "flightNo": "NIL",
                                    "patient": [{
                                        "name": "NIL",
                                        "country": "NIL",
                                        "treatment": "NIL"
                                    }]
                                }],
                                "totalPatient": [{
                                    "name": "NIL",
                                    "country": "NIL",
                                    "treatment": "NIL"
                                }],
                                "arrivalConfirmed": 0,
                                "arrivingToday": 0,
                                "arrivingSevenDays": 0,
                                "countryQueryTotal": 0,
                                "countryVilTotal": 0,
                                "countryConfTotal": 0,
                                "treatmentQueryTotal": 0,
                                "treatmentVilTotal": 0,
                                "treatmentConfTotal": 0,
                                "hospitalQueryTotal": 0,
                                "hospitalVilTotal": 0,
                                "hospitalConfTotal": 0,
                                "refferalQueryTotal": 0,
                                "refferalVilTotal": 0,
                                "refferalConfTotal": 0
                            },
                            else: "$dailyData",

                        }


                    },
                    monthlyData: {

                        $cond: {
                            if: {
                                $eq: ["$monthlyData", []]
                            },
                            then: {
                                countryWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                treatmentWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                hospitalWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                hospital: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,
                                }],
                                refferalWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,
                                }],

                                "countryQueryTotal": 0,
                                "countryVilTotal": 0,
                                "countryConfTotal": 0,
                                "treatmentQueryTotal": 0,
                                "treatmentVilTotal": 0,
                                "treatmentConfTotal": 0,
                                "hospitalQueryTotal": 0,
                                "hospitalVilTotal": 0,
                                "hospitalConfTotal": 0,
                                "refferalQueryTotal": 0,
                                "refferalVilTotal": 0,
                                "refferalConfTotal": 0
                            },
                            else: "$monthlyData",

                        }


                    },
                    annualData: {

                        $cond: {
                            if: {
                                $eq: ["$annualData", []]
                            },
                            then: {
                                countryWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                treatmentWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                hospitalWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,

                                }],
                                hospital: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,
                                }],
                                refferalWise: [{
                                    "value": "NIL",
                                    "val": 0,
                                    "vil": 0,
                                    "conf": 0,
                                }],

                                "countryQueryTotal": 0,
                                "countryVilTotal": 0,
                                "countryConfTotal": 0,
                                "treatmentQueryTotal": 0,
                                "treatmentVilTotal": 0,
                                "treatmentConfTotal": 0,
                                "hospitalQueryTotal": 0,
                                "hospitalVilTotal": 0,
                                "hospitalConfTotal": 0,
                                "refferalQueryTotal": 0,
                                "refferalVilTotal": 0,
                                "refferalConfTotal": 0
                            },
                            else: "$annualData",

                        }


                    },
                }
            },
            {
                $addFields: {
                    dailyData: {
                        $cond: {
                            if: {
                                $isArray: ["$dailyData"]
                            },
                            then: { $arrayElemAt: ['$dailyData', 0] },
                            else: "$dailyData"
                        }
                    },
                    monthlyData: {
                        $cond: {
                            if: {
                                $isArray: ["$monthlyData"]
                            },
                            then: { $arrayElemAt: ['$monthlyData', 0] },
                            else: "$monthlyData"
                        }
                    },
                    annualData: {
                        $cond: {
                            if: {
                                $isArray: ["$annualData"]
                            },
                            then: { $arrayElemAt: ['$annualData', 0] },
                            else: "$annualData"
                        }
                    },
                }
            },

        ]
        doc1 = await Hospital.aggregate(pipeline2)
        var today = new Date()
        today.setHours(21, 0, 0, 0)
        var yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(20, 59, 0, 0)

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
        doc1.map((obj) => {
            obj['dailyDate'] = dailydate
            obj['monthlyDate'] = monthlydate
            obj['yearlyDate'] = yearlydate
            obj['yearlyYear'] = yearlyyear

            return obj

        })
        for (let i = 0; i < doc1.length; i++) {

            // let daily = doc1[i].dailyData
            doc1[i].dailyData.treatmentWise.map((obj) => {
                if (obj.value == "") {
                    obj['value'] = "Unknown"
                }

                return obj

            })
            doc1[i].monthlyData.treatmentWise.map((obj) => {
                if (obj.value == "") {
                    obj['value'] = "Unknown"
                }

                return obj

            })
            doc1[i].annualData.treatmentWise.map((obj) => {
                if (obj.value == "") {
                    obj['value'] = "Unknown"
                }

                return obj

            })
            doc1[i].dailyData.totalPatient.map((obj) => {
                if (obj.treatment == "") {
                    obj['treatment'] = "Unknown"
                }

                return obj

            })

            hospitalId = doc1[i]._id.hospitalId
            hospital = await Hospital.findOne({ "name._id": hospitalId });
            userId = hospital._id
            hospitalDetails = await HospitalDetails.findOne({ "hospital": userId })
            doc1[i].company = hospitalDetails
            emailTo = hospital.email

            sendEmail.autoHospitalUnitReportsDaily(doc1[i], emailTo, hospitalDetails)

        }

    } catch (err) {
        next(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})