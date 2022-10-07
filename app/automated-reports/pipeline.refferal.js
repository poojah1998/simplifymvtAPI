var dateFormat = require("dateformat");


var today = new Date()
today.setHours(21, 0, 0, 0)
var yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
yesterday.setHours(21, 01, 0, 0)

let date = new Date();

var firstDay =
    new Date(date.getFullYear(), date.getMonth(), 1);

var lastDay =
    new Date(date.getFullYear(), date.getMonth() + 1, 0);
lastDay.setHours(23, 59, 0, 0)


var firstyear = new Date()
firstyear.setMonth(3);
firstyear.setDate(1);
firstyear.setHours(0, 0, 0, 0)
var nextyear = new Date()
nextyear.setMonth(2);
nextyear.setDate(31);
nextyear.setFullYear(firstyear.getFullYear() + 1);
nextyear.setHours(23, 59, 0, 0)


todayStartDate = new Date();
todayStartDate.setHours(0, 0, 0, 0);

todayEndDate = new Date();
todayEndDate.setHours(23, 59, 59, 999);

sevenStartDate = new Date();
sevenStartDate.setHours(0, 0, 0, 0);
sevenEndDate = new Date(sevenStartDate);
sevenEndDate.setDate(sevenStartDate.getDate() + 7);
sevenEndDate.setHours(23, 59, 59, 999);

today = new Date(today)
yesterday = new Date(yesterday)
firstDay = new Date(firstDay)
lastDay = new Date(lastDay)
firstyear = new Date(firstyear)
nextyear = new Date(nextyear)
todayStartDate = new Date(todayStartDate)
todayEndDate = new Date(todayEndDate)
sevenStartDate = new Date(sevenStartDate)
sevenEndDate = new Date(sevenEndDate)
var pipeline = [{
        $lookup: {
            from: 'adminSchema',
            localField: 'user',
            foreignField: '_id',
            as: 'email'
        }
    },
    {
        $lookup: {
            from: 'request',
            localField: 'requests',
            foreignField: '_id',
            as: 'hospitalrequest'
        }
    },
    {
        $lookup: {
            from: 'requestvil',
            localField: 'requestvils',
            foreignField: '_id',
            as: 'hospitalvil'
        }
    },
    {
        $lookup: {
            from: 'confirmation',
            localField: 'confirmations',
            foreignField: '_id',
            as: 'hospitalconfirmation'
        }
    },

    {
        $lookup: {
            from: 'confirmation',
            "let": { "id": "$confirmations" },

            "pipeline": [
                { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                {
                    $match: {
                        createdAt: { $gte: yesterday, $lt: today },

                    }
                },
                {
                    $project: {

                        _id: 1,
                        arrivaldate: 1,
                        flightName: 1,
                        flightNo: 1,
                        patient: 1
                    }
                },
                {
                    $addFields: {
                        arrivalDate: { $dateToString: { format: "%Y-%m-%d %H:%M", date: "$arrivaldate", timezone: "+05:30" } }
                    }
                },
                {
                    "$lookup": {
                        "from": "patient",
                        "let": { "patient": "$patient" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$patient"] } } },
                            {
                                $project: {
                                    _id: 1,
                                    country: 1,
                                    treatment: 1,
                                    name: 1,

                                }
                            },
                        ],
                        "as": "patient"
                    }
                }
            ],

            as: 'hospitalConfirmationArrival',

        }
    },
    {
        $lookup: {
            from: 'confirmation',
            "let": { "id": "$confirmations" },

            "pipeline": [
                { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                {
                    $match: {
                        arrivaldate: { $gte: todayStartDate, $lt: todayEndDate },

                    }
                },
                {
                    $project: {
                        _id: 1,
                        arrivaldate: 1

                    }
                },
            ],

            as: 'hospitalConfirmationArrivalToday',

        }
    },
    {
        $lookup: {
            from: 'confirmation',
            "let": { "id": "$confirmations" },

            "pipeline": [
                { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },


                {
                    $match: {
                        arrivaldate: { $gte: todayStartDate, $lt: todayEndDate },

                    }
                },
                {
                    $project: {
                        _id: 1,
                        arrivaldate: 1

                    }
                },
            ],

            as: 'hospitalConfirmationArrivalToday',

        }
    },
    {
        $lookup: {
            from: 'confirmation',
            "let": { "id": "$confirmations" },

            "pipeline": [
                { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                {
                    $match: {
                        createdAt: { $gte: yesterday, $lt: today },

                    }
                },

                {
                    $match: {
                        arrivaldate: { $gte: sevenStartDate, $lt: sevenEndDate },

                    }
                },
                {
                    $project: {
                        _id: 1,
                        arrivaldate: 1

                    }
                },
            ],

            as: 'hospitalConfirmationArrivalSevenDays',

        }
    },
    {
        $lookup: {
            from: 'opdrequest',
            localField: 'opdrequests',
            foreignField: '_id',
            as: 'hospitalopd'
        }
    },
    {
        $lookup: {
            from: 'pirequest',
            localField: 'pirequests',
            foreignField: '_id',
            as: 'hospitalpi'
        }
    },
    {
        $lookup: {
            from: 'preintimation',
            localField: 'preintimations',
            foreignField: '_id',
            as: 'hospitalintimation'
        }
    },
    {
        $project: {
            "hospitalrequest.hospitalname": 1,
            "hospitalrequest.patient": 1,
            "hospitalConfirmationArrival": 1,
            "hospitalvil.hospitalname": 1,
            "hospitalvil.patient": 1,
            "hospitalconfirmation.hospitalname": 1,
            "hospitalconfirmation.patient": 1,

            "hospitalopd.hospitalname": 1,
            "hospitalopd.patient": 1,
            "hospitalpi.hospitalname": 1,
            "hospitalpi.patient": 1,
            "hospitalintimation.hospitalname": 1,
            "hospitalintimation.patient": 1,
            email: "$email.email",
            hospitalConfirmationArrivalToday: 1,
            hospitalConfirmationArrivalSevenDays: 1,
            treatment: 1,
            country: 1,
            requestvils: 1,
            confirmations: 1,
            refferalpartner: 1,
            requests: 1,
            user: 1,
            date: 1,
            name: 1,
            currentstatus: 1,
            mhid: 1,
            uhidcode: 1,
            branchoffice: 1,
            refferalpartner: 1
        }
    },

    {
        $facet: {
            "dailydata": [{
                    $match: {
                        date: { $gte: yesterday, $lt: today },
                        refferalpartner: { $not: { $eq: 'NAN' } },

                    }
                },
                {

                    $group: {
                        _id: "$refferalpartner",
                        total: {
                            $sum: 1
                        },
                        hospitalrequest: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalrequest", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalrequest.hospitalname",

                                }
                            }

                        },
                        hospitalvil: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalvil", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalvil.hospitalname",

                                }
                            }

                        },
                        hospitalconfirmation: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalconfirmation", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalconfirmation.hospitalname",

                                }
                            }
                        },

                        hospitalquery: {
                            $push: {
                                opdrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalopd", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalopd",

                                    }

                                },
                                pirequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalpi", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalpi",

                                    }

                                },
                                preintimations: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalintimation", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalintimation",

                                    }

                                },
                                opinionrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalrequest", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalrequest",

                                    }

                                },
                                vilrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalvil", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalvil",

                                    }

                                },
                                confrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalconfirmation", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalconfirmation",

                                    }

                                },
                            }
                        },
                        patientdata: {
                            $push: {
                                name: "$name",
                                treatment: {
                                    $cond: {
                                        if: {
                                            $eq: ["$treatment", ""]
                                        },
                                        then: 'Unknown',

                                        else: "$treatment",

                                    }
                                },
                                country: "$country",
                                status: "$currentstatus",
                                mhid: "$mhid",
                                uhidcode: "$uhidcode",

                            }
                        },
                        treatment: {
                            $push: {
                                treatment: {
                                    $cond: {
                                        if: {
                                            $eq: ["$treatment", ""]
                                        },
                                        then: 'Unknown',

                                        else: "$treatment",

                                    }
                                },
                                vil: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$requestvils" }, 0]
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                request: { $size: "$requests" },
                                confirmation: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$confirmations" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                refferalpartner: "$refferalpartner"
                            }
                        },
                        country: {
                            $push: {
                                country: "$country",
                                vil: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$requestvils" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                confirmation: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$confirmations" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },

                                request: { $size: "$requests" },
                                refferalpartner: "$refferalpartner",
                            }
                        },
                        email: {
                            $first: { $arrayElemAt: ["$email", 0] }


                        },

                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }

                },
                {
                    $addFields: {
                        hospitalaquery: {
                            $concatArrays: [
                                "$hospitalquery.opdrequests",
                                "$hospitalquery.preintimations",
                                "$hospitalquery.pirequests",
                                "$hospitalquery.opinionrequests",
                                "$hospitalquery.vilrequests",
                                "$hospitalquery.confrequests"

                            ]
                        }
                    }
                },

                {

                    $unwind: "$country"

                },

                {
                    $group: {
                        _id: {
                            name: "$_id",
                            country: "$country.country",

                        },

                        vil: { $sum: "$country.vil" },
                        confirmation: { $sum: "$country.confirmation" },
                        request: { $sum: "$country.request" },

                        refferalpartner: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$country.refferalpartner", "NAN"]
                                    },
                                    then: "$$REMOVE",
                                    else: '$country.refferalpartner',

                                }
                            }
                        },

                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },

                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                        count: {
                            $sum: 1
                        },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        country: {
                            $addToSet: {
                                value: "$_id.country",
                                vil: "$vil",
                                confirmation: "$confirmation",
                                request: "$request",
                                refferalpartner: { $size: "$refferalpartner" },
                                count: "$count"
                            }
                        },

                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },


                {

                    $unwind: "$treatment"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            treatment: "$treatment.treatment",

                        },
                        vil: { $sum: "$treatment.vil" },
                        confirmation: { $sum: "$treatment.confirmation" },
                        request: { $sum: "$treatment.request" },
                        refferalpartner: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$treatment.refferalpartner", "NAN"]
                                    },
                                    then: "$$REMOVE",
                                    else: '$treatment.refferalpartner',

                                }
                            }
                        },
                        count: {
                            $sum: 1
                        },
                        country: { $first: "$country" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },

                {
                    $group: {
                        _id: "$_id.name",
                        treatment: {
                            $addToSet: {
                                value: "$_id.treatment",
                                vil: "$vil",
                                confirmation: "$confirmation",
                                request: "$request",
                                refferalpartner: { $size: "$refferalpartner" },
                                count: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },

                    }
                },
                {
                    $project: {
                        hospitalrequest: {
                            $reduce: {
                                input: "$hospitalrequest",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospitalvil: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },
                {

                    $unwind: "$hospitalrequest"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalrequest: "$hospitalrequest",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalrequest", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalrequest: {
                            $addToSet: {
                                value: "$_id.hospitalrequest",

                                hospitalrequest: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },

                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {
                    $project: {
                        hospitalvil: {
                            $reduce: {
                                input: "$hospitalvil",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospitalrequest: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },
                {

                    $unwind: "$hospitalvil"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalvil: "$hospitalvil",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalvil", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalvil: {
                            $addToSet: {
                                value: "$_id.hospitalvil",

                                hospitalvil: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },

                    }
                },
                {
                    $project: {
                        hospital: {
                            $map: {
                                input: "$hospitalrequest",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalvil",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        country: 1,
                        treatment: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },
                {
                    $project: {
                        hospitalconfirmation: {
                            $reduce: {
                                input: "$hospitalconfirmation",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospital: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    },

                },
                {

                    $unwind: "$hospitalconfirmation"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalconfirmation: "$hospitalconfirmation",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalconfirmation", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalconfirmation: {
                            $addToSet: {
                                value: "$_id.hospitalconfirmation",

                                hospitalconfirmation: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {
                    $project: {
                        hospital: {
                            $map: {
                                input: "$hospital",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalconfirmation",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        country: 1,
                        treatment: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },

                {
                    $project: {

                        hospital: {
                            $filter: {
                                input: "$hospital",
                                as: "item",
                                cond: {
                                    $ne: ["$$item.value", "NAN"]
                                }
                            }
                        },
                        opdrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.opdrequests"
                            }
                        },
                        pirequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.pirequests"
                            }
                        },
                        preintimations: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.preintimations"
                            }
                        },
                        opinionrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.opinionrequests"
                            }
                        },
                        vilrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.vilrequests"
                            }
                        },
                        confrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.confrequests"
                            }
                        },
                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },

                {
                    $addFields: {
                        hospitalquery: {
                            $concatArrays: [
                                "$opdrequests",
                                "$pirequests",
                                "$preintimations",
                                "$opinionrequests",
                                "$vilrequests",
                                "$confrequests",

                            ]
                        },
                        hospital: {
                            $cond: {
                                if: { $eq: ["$hospital", []] },
                                then: [{
                                    "value": "NIL",
                                    "hospitalrequest": 0,
                                    "hospitalconfirmation": 0,
                                    "hospitalvil": 0,
                                }],
                                else: "$hospital"
                            }

                        }
                    }
                },
                {
                    $addFields: {
                        hospitalquery: {
                            $reduce: {
                                input: "$hospitalquery",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },

                    }
                },
                {
                    $project: {

                        hospitalquery: {
                            $filter: {
                                input: "$hospitalquery",
                                as: "item",
                                cond: {
                                    $ne: ["$$item", "NAN"]
                                }
                            }
                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospital: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },
                {
                    $project: {
                        hospitalquery: {
                            $cond: {
                                if: { $eq: ["$hospitalquery", []] },
                                then: [{
                                    "hospitalname": "NIL",
                                    "patient": "NIL",

                                }],
                                else: "$hospitalquery"
                            }

                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospital: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },
                {

                    $unwind: "$hospitalquery"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalquery: "$hospitalquery",

                        },
                        count: { $sum: 1 },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalquery: {
                            $addToSet: {
                                value: "$_id.hospitalquery",

                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {

                    $unwind: "$hospitalquery"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalquery: "$hospitalquery.value.hospitalname",

                        },
                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalquery.value.hospitalname", "NIL"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalquery: {
                            $addToSet: {
                                value: "$_id.hospitalquery",
                                count: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },
                        hospitalConfirmationArrival: { $first: "$hospitalConfirmationArrival" },
                        hospitalConfirmationArrivalToday: { $first: "$hospitalConfirmationArrivalToday" },
                        hospitalConfirmationArrivalSevenDays: { $first: "$hospitalConfirmationArrivalSevenDays" },
                    }
                },

                {
                    $project: {
                        hospital: {
                            $cond: {
                                if: { $eq: [{ $first: "$hospital.value" }, "NIL"] },
                                then: "$hospitalquery",
                                else: "$hospital"
                            }

                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                        hospitalConfirmationArrival: 1,
                        hospitalConfirmationArrivalToday: 1,
                        hospitalConfirmationArrivalSevenDays: 1,
                    }
                },
                {
                    $addFields: {
                        arrivalConfirmed: {
                            $size: "$hospitalConfirmationArrival"
                        },
                        arrivingToday: {
                            $size: "$hospitalConfirmationArrivalToday"
                        },
                        arrivingSevenDays: {
                            $size: "$hospitalConfirmationArrivalSevenDays"
                        },
                        hospitalConfirmationArrival: {

                            $cond: {
                                if: {
                                    $eq: ["$hospitalConfirmationArrival", []]
                                },
                                then:

                                    [{
                                    "arrivalDate": "NIL",
                                    "flightName": "NIL",
                                    "flightNo": "NIL",
                                    "patient": [{
                                        "name": "NIL",
                                        "country": "NIL",
                                        "treatment": "NIL"
                                    }]
                                }],


                                else: "$hospitalConfirmationArrival",

                            },

                        },
                    }
                },

                {
                    $addFields: {
                        hospital: {
                            $map: {
                                input: "$hospital",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalquery",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                    }
                },
                {
                    $addFields: {

                        patientDataTotal: {
                            $cond: {

                                if: { $eq: [{ $arrayElemAt: ["$patientdata.name", 0] }, "NAN"] },
                                then: 0,
                                else: {
                                    $size: "$patientdata"
                                },

                            }
                        },
                    }
                },
                {
                    $addFields: {
                        countryquerytotal: {
                            $sum: "$country.count"

                        },
                        countryrequesttotal: {
                            $sum: "$country.request"

                        },
                        countryviltotal: {
                            $sum: "$country.vil"

                        },
                        countryconfirmationtotal: {
                            $sum: "$country.confirmation"

                        },
                        countrypartnertotal: {
                            $sum: "$country.refferalpartner"

                        },
                        treatmentrequesttotal: {
                            $sum: "$treatment.request"

                        },
                        treatmentquerytotal: {
                            $sum: "$treatment.count"

                        },
                        treatmentviltotal: {
                            $sum: "$treatment.vil"

                        },
                        treatmentconfirmationtotal: {
                            $sum: "$treatment.confirmation"

                        },
                        treatmentpartnertotal: {
                            $sum: "$treatment.refferalpartner"

                        },
                        hospitalrequesttotal: {
                            $sum: "$hospital.hospitalrequest"

                        },
                        hospitalviltotal: {
                            $sum: "$hospital.hospitalvil"
                        },
                        hospitalconfirmationtotal: {
                            $sum: "$hospital.hospitalconfirmation"

                        },
                        hospitalcounttotal: {
                            $sum: "$hospital.count"

                        },
                        range: "dailydata"

                    }
                },
            ],
            "monthlydata": [{
                    $match: {
                        date: { $gte: firstDay, $lt: lastDay },
                        refferalpartner: { $not: { $eq: 'NAN' } },

                    }
                },
                {

                    $group: {
                        _id: "$refferalpartner",
                        total: {
                            $sum: 1
                        },
                        hospitalrequest: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalrequest", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalrequest.hospitalname",

                                }
                            }

                        },
                        hospitalvil: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalvil", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalvil.hospitalname",

                                }
                            }

                        },
                        hospitalconfirmation: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalconfirmation", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalconfirmation.hospitalname",

                                }
                            }
                        },
                        hospitalquery: {
                            $push: {
                                opdrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalopd", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalopd",

                                    }

                                },
                                pirequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalpi", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalpi",

                                    }

                                },
                                preintimations: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalintimation", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalintimation",

                                    }

                                },
                                opinionrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalrequest", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalrequest",

                                    }

                                },
                                vilrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalvil", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalvil",

                                    }

                                },
                                confrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalconfirmation", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalconfirmation",

                                    }

                                },
                            }
                        },
                        patientdata: {
                            $push: {
                                name: "$name",
                                treatment: {
                                    $cond: {
                                        if: {
                                            $eq: ["$treatment", ""]
                                        },
                                        then: 'Unknown',

                                        else: "$treatment",

                                    }
                                },
                                country: "$country",
                                status: "$currentstatus",
                                mhid: "$mhid",
                                uhidcode: "$uhidcode",

                            }
                        },
                        treatment: {
                            $push: {
                                treatment: {
                                    $cond: {
                                        if: {
                                            $eq: ["$treatment", ""]
                                        },
                                        then: 'Unknown',

                                        else: "$treatment",

                                    }
                                },
                                vil: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$requestvils" }, 0]
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                request: { $size: "$requests" },
                                confirmation: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$confirmations" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                refferalpartner: "$refferalpartner"
                            }
                        },
                        country: {
                            $push: {
                                country: "$country",
                                vil: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$requestvils" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                confirmation: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$confirmations" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },

                                request: { $size: "$requests" },
                                refferalpartner: "$refferalpartner",
                            }
                        },
                        email: {
                            $first: { $arrayElemAt: ["$email", 0] }


                        }


                    }

                },
                {
                    $addFields: {
                        hospitalaquery: {
                            $concatArrays: [
                                "$hospitalquery.opdrequests",
                                "$hospitalquery.preintimations",
                                "$hospitalquery.pirequests",
                                "$hospitalquery.opinionrequests",
                                "$hospitalquery.vilrequests",
                                "$hospitalquery.confrequests"

                            ]
                        }
                    }
                },

                {

                    $unwind: "$country"

                },

                {
                    $group: {
                        _id: {
                            name: "$_id",
                            country: "$country.country",

                        },

                        vil: { $sum: "$country.vil" },
                        confirmation: { $sum: "$country.confirmation" },
                        request: { $sum: "$country.request" },

                        refferalpartner: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$country.refferalpartner", "NAN"]
                                    },
                                    then: "$$REMOVE",
                                    else: '$country.refferalpartner',

                                }
                            }
                        },

                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                        count: {
                            $sum: 1
                        },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        country: {
                            $addToSet: {
                                value: "$_id.country",
                                vil: "$vil",
                                confirmation: "$confirmation",
                                request: "$request",
                                refferalpartner: { $size: "$refferalpartner" },
                                count: "$count"
                            }
                        },

                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                    }
                },


                {

                    $unwind: "$treatment"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            treatment: "$treatment.treatment",

                        },
                        vil: { $sum: "$treatment.vil" },
                        confirmation: { $sum: "$treatment.confirmation" },
                        request: { $sum: "$treatment.request" },
                        refferalpartner: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$treatment.refferalpartner", "NAN"]
                                    },
                                    then: "$$REMOVE",
                                    else: '$treatment.refferalpartner',

                                }
                            }
                        },
                        count: {
                            $sum: 1
                        },
                        country: { $first: "$country" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },

                {
                    $group: {
                        _id: "$_id.name",
                        treatment: {
                            $addToSet: {
                                value: "$_id.treatment",
                                vil: "$vil",
                                confirmation: "$confirmation",
                                request: "$request",
                                refferalpartner: { $size: "$refferalpartner" },
                                count: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                    }
                },
                {
                    $project: {
                        hospitalrequest: {
                            $reduce: {
                                input: "$hospitalrequest",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospitalvil: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1
                    }
                },
                {

                    $unwind: "$hospitalrequest"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalrequest: "$hospitalrequest",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalrequest", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalrequest: {
                            $addToSet: {
                                value: "$_id.hospitalrequest",

                                hospitalrequest: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },

                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $project: {
                        hospitalvil: {
                            $reduce: {
                                input: "$hospitalvil",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospitalrequest: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1

                    }
                },
                {

                    $unwind: "$hospitalvil"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalvil: "$hospitalvil",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalvil", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalvil: {
                            $addToSet: {
                                value: "$_id.hospitalvil",

                                hospitalvil: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                    }
                },
                {
                    $project: {
                        hospital: {
                            $map: {
                                input: "$hospitalrequest",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalvil",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        country: 1,
                        treatment: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1

                    }
                },
                {
                    $project: {
                        hospitalconfirmation: {
                            $reduce: {
                                input: "$hospitalconfirmation",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospital: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,

                    },

                },
                {

                    $unwind: "$hospitalconfirmation"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalconfirmation: "$hospitalconfirmation",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalconfirmation", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalconfirmation: {
                            $addToSet: {
                                value: "$_id.hospitalconfirmation",

                                hospitalconfirmation: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $project: {
                        hospital: {
                            $map: {
                                input: "$hospital",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalconfirmation",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        country: 1,
                        treatment: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,

                    }
                },

                {
                    $project: {

                        hospital: {
                            $filter: {
                                input: "$hospital",
                                as: "item",
                                cond: {
                                    $ne: ["$$item.value", "NAN"]
                                }
                            }
                        },
                        opdrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.opdrequests"
                            }
                        },
                        pirequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.pirequests"
                            }
                        },
                        preintimations: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.preintimations"
                            }
                        },
                        opinionrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.opinionrequests"
                            }
                        },
                        vilrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.vilrequests"
                            }
                        },
                        confrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.confrequests"
                            }
                        },
                        country: 1,
                        treatment: 1,
                        patientdata: 1,

                    }
                },

                {
                    $addFields: {
                        hospitalquery: {
                            $concatArrays: [
                                "$opdrequests",
                                "$pirequests",
                                "$preintimations",
                                "$opinionrequests",
                                "$vilrequests",
                                "$confrequests",

                            ]
                        },
                        hospital: {
                            $cond: {
                                if: { $eq: ["$hospital", []] },
                                then: [{
                                    "value": "NIL",
                                    "hospitalrequest": 0,
                                    "hospitalconfirmation": 0,
                                    "hospitalvil": 0,
                                }],
                                else: "$hospital"
                            }

                        }
                    }
                },
                {
                    $addFields: {
                        hospitalquery: {
                            $reduce: {
                                input: "$hospitalquery",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },

                    }
                },
                {
                    $project: {

                        hospitalquery: {
                            $filter: {
                                input: "$hospitalquery",
                                as: "item",
                                cond: {
                                    $ne: ["$$item", "NAN"]
                                }
                            }
                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospital: 1,
                    }
                },
                {
                    $project: {
                        hospitalquery: {
                            $cond: {
                                if: { $eq: ["$hospitalquery", []] },
                                then: [{
                                    "hospitalname": "NIL",
                                    "patient": "NIL",

                                }],
                                else: "$hospitalquery"
                            }

                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospital: 1,
                    }
                },
                {

                    $unwind: "$hospitalquery"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalquery: "$hospitalquery",

                        },
                        count: { $sum: 1 },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalquery: {
                            $addToSet: {
                                value: "$_id.hospitalquery",

                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {

                    $unwind: "$hospitalquery"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalquery: "$hospitalquery.value.hospitalname",

                        },
                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalquery.value.hospitalname", "NIL"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalquery: {
                            $addToSet: {
                                value: "$_id.hospitalquery",
                                count: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {
                    $project: {
                        hospital: {
                            $cond: {
                                if: { $eq: [{ $first: "$hospital.value" }, "NIL"] },
                                then: "$hospitalquery",
                                else: "$hospital"
                            }

                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                    }
                },
                {
                    $addFields: {
                        hospital: {
                            $map: {
                                input: "$hospital",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalquery",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                    }
                },
                {
                    $addFields: {
                        countryquerytotal: {
                            $sum: "$country.count"

                        },
                        countryrequesttotal: {
                            $sum: "$country.request"

                        },
                        countryviltotal: {
                            $sum: "$country.vil"

                        },
                        countryconfirmationtotal: {
                            $sum: "$country.confirmation"

                        },
                        countrypartnertotal: {
                            $sum: "$country.refferalpartner"

                        },
                        treatmentrequesttotal: {
                            $sum: "$treatment.request"

                        },
                        treatmentquerytotal: {
                            $sum: "$treatment.count"

                        },
                        treatmentviltotal: {
                            $sum: "$treatment.vil"

                        },
                        treatmentconfirmationtotal: {
                            $sum: "$treatment.confirmation"

                        },
                        treatmentpartnertotal: {
                            $sum: "$treatment.refferalpartner"

                        },
                        hospitalrequesttotal: {
                            $sum: "$hospital.hospitalrequest"

                        },
                        hospitalviltotal: {
                            $sum: "$hospital.hospitalvil"
                        },
                        hospitalconfirmationtotal: {
                            $sum: "$hospital.hospitalconfirmation"

                        },
                        hospitalcounttotal: {
                            $sum: "$hospital.count"

                        },
                        range: "monthlydata"

                    }
                },
            ],
            "annualdata": [{
                    $match: {
                        date: { $gte: firstyear, $lt: nextyear },
                        refferalpartner: { $not: { $eq: 'NAN' } },

                    }
                },
                {

                    $group: {
                        _id: "$refferalpartner",
                        total: {
                            $sum: 1
                        },
                        hospitalrequest: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalrequest", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalrequest.hospitalname",

                                }
                            }

                        },
                        hospitalvil: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalvil", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalvil.hospitalname",

                                }
                            }

                        },
                        hospitalconfirmation: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$hospitalconfirmation", []]
                                    },
                                    then: [
                                        'NAN'
                                    ],
                                    else: "$hospitalconfirmation.hospitalname",

                                }
                            }
                        },
                        hospitalquery: {
                            $push: {
                                opdrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalopd", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalopd",

                                    }

                                },
                                pirequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalpi", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalpi",

                                    }

                                },
                                preintimations: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalintimation", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalintimation",

                                    }

                                },
                                opinionrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalrequest", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalrequest",

                                    }

                                },
                                vilrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalvil", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalvil",

                                    }

                                },
                                confrequests: {

                                    $cond: {
                                        if: {
                                            $eq: ["$hospitalconfirmation", []]
                                        },
                                        then: [
                                            'NAN'
                                        ],
                                        else: "$hospitalconfirmation",

                                    }

                                },
                            }
                        },
                        patientdata: {
                            $push: {
                                name: "$name",
                                treatment: {
                                    $cond: {
                                        if: {
                                            $eq: ["$treatment", ""]
                                        },
                                        then: 'Unknown',

                                        else: "$treatment",

                                    }
                                },
                                country: "$country",
                                status: "$currentstatus",
                                mhid: "$mhid",
                                uhidcode: "$uhidcode",

                            }
                        },
                        treatment: {
                            $push: {
                                treatment: {
                                    $cond: {
                                        if: {
                                            $eq: ["$treatment", ""]
                                        },
                                        then: 'Unknown',

                                        else: "$treatment",

                                    }
                                },
                                vil: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$requestvils" }, 0]
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                request: { $size: "$requests" },
                                confirmation: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$confirmations" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                refferalpartner: "$refferalpartner"
                            }
                        },
                        country: {
                            $push: {
                                country: "$country",
                                vil: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$requestvils" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },
                                confirmation: {
                                    $cond: {
                                        if: {
                                            $eq: [{ $size: "$confirmations" }, 0],
                                        },
                                        then: 0,

                                        else: 1,

                                    }
                                },

                                request: { $size: "$requests" },
                                refferalpartner: "$refferalpartner",
                            }
                        },
                        email: {
                            $first: { $arrayElemAt: ["$email", 0] }


                        }


                    }

                },
                {
                    $addFields: {
                        hospitalaquery: {
                            $concatArrays: [
                                "$hospitalquery.opdrequests",
                                "$hospitalquery.preintimations",
                                "$hospitalquery.pirequests",
                                "$hospitalquery.opinionrequests",
                                "$hospitalquery.vilrequests",
                                "$hospitalquery.confrequests"

                            ]
                        }
                    }
                },

                {

                    $unwind: "$country"

                },

                {
                    $group: {
                        _id: {
                            name: "$_id",
                            country: "$country.country",

                        },

                        vil: { $sum: "$country.vil" },
                        confirmation: { $sum: "$country.confirmation" },
                        request: { $sum: "$country.request" },

                        refferalpartner: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$country.refferalpartner", "NAN"]
                                    },
                                    then: "$$REMOVE",
                                    else: '$country.refferalpartner',

                                }
                            }
                        },

                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                        count: {
                            $sum: 1
                        },
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        country: {
                            $addToSet: {
                                value: "$_id.country",
                                vil: "$vil",
                                confirmation: "$confirmation",
                                request: "$request",
                                refferalpartner: { $size: "$refferalpartner" },
                                count: "$count"
                            }
                        },

                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                    }
                },


                {

                    $unwind: "$treatment"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            treatment: "$treatment.treatment",

                        },
                        vil: { $sum: "$treatment.vil" },
                        confirmation: { $sum: "$treatment.confirmation" },
                        request: { $sum: "$treatment.request" },
                        refferalpartner: {
                            $push: {
                                $cond: {
                                    if: {
                                        $eq: ["$treatment.refferalpartner", "NAN"]
                                    },
                                    then: "$$REMOVE",
                                    else: '$treatment.refferalpartner',

                                }
                            }
                        },
                        count: {
                            $sum: 1
                        },
                        country: { $first: "$country" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },

                {
                    $group: {
                        _id: "$_id.name",
                        treatment: {
                            $addToSet: {
                                value: "$_id.treatment",
                                vil: "$vil",
                                confirmation: "$confirmation",
                                request: "$request",
                                refferalpartner: { $size: "$refferalpartner" },
                                count: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                    }
                },
                {
                    $project: {
                        hospitalrequest: {
                            $reduce: {
                                input: "$hospitalrequest",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospitalvil: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1
                    }
                },
                {

                    $unwind: "$hospitalrequest"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalrequest: "$hospitalrequest",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalrequest", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalrequest: {
                            $addToSet: {
                                value: "$_id.hospitalrequest",

                                hospitalrequest: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalvil: { $first: "$hospitalvil" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },

                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $project: {
                        hospitalvil: {
                            $reduce: {
                                input: "$hospitalvil",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospitalrequest: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1

                    }
                },
                {

                    $unwind: "$hospitalvil"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalvil: "$hospitalvil",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalvil", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalvil: {
                            $addToSet: {
                                value: "$_id.hospitalvil",

                                hospitalvil: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospitalrequest: { $first: "$hospitalrequest" },
                        hospitalconfirmation: { $first: "$hospitalconfirmation" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },


                    }
                },
                {
                    $project: {
                        hospital: {
                            $map: {
                                input: "$hospitalrequest",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalvil",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        country: 1,
                        treatment: 1,
                        hospitalconfirmation: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1

                    }
                },
                {
                    $project: {
                        hospitalconfirmation: {
                            $reduce: {
                                input: "$hospitalconfirmation",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },


                        country: 1,
                        treatment: 1,
                        hospital: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,

                    },

                },
                {

                    $unwind: "$hospitalconfirmation"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalconfirmation: "$hospitalconfirmation",

                        },

                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalconfirmation", "NAN"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalconfirmation: {
                            $addToSet: {
                                value: "$_id.hospitalconfirmation",

                                hospitalconfirmation: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospitalquery: { $first: "$hospitalquery" },

                    }
                },
                {
                    $project: {
                        hospital: {
                            $map: {
                                input: "$hospital",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalconfirmation",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        country: 1,
                        treatment: 1,
                        email: 1,
                        patientdata: 1,
                        hospitalquery: 1,

                    }
                },

                {
                    $project: {

                        hospital: {
                            $filter: {
                                input: "$hospital",
                                as: "item",
                                cond: {
                                    $ne: ["$$item.value", "NAN"]
                                }
                            }
                        },
                        opdrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.opdrequests"
                            }
                        },
                        pirequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.pirequests"
                            }
                        },
                        preintimations: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.preintimations"
                            }
                        },
                        opinionrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.opinionrequests"
                            }
                        },
                        vilrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.vilrequests"
                            }
                        },
                        confrequests: {
                            "$map": {
                                "input": "$hospitalquery",
                                "as": "el",
                                "in": "$$el.confrequests"
                            }
                        },
                        country: 1,
                        treatment: 1,
                        patientdata: 1,

                    }
                },

                {
                    $addFields: {
                        hospitalquery: {
                            $concatArrays: [
                                "$opdrequests",
                                "$pirequests",
                                "$preintimations",
                                "$opinionrequests",
                                "$vilrequests",
                                "$confrequests",

                            ]
                        },
                        hospital: {
                            $cond: {
                                if: { $eq: ["$hospital", []] },
                                then: [{
                                    "value": "NIL",
                                    "hospitalrequest": 0,
                                    "hospitalconfirmation": 0,
                                    "hospitalvil": 0,
                                }],
                                else: "$hospital"
                            }

                        }
                    }
                },
                {
                    $addFields: {
                        hospitalquery: {
                            $reduce: {
                                input: "$hospitalquery",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        },

                    }
                },
                {
                    $project: {

                        hospitalquery: {
                            $filter: {
                                input: "$hospitalquery",
                                as: "item",
                                cond: {
                                    $ne: ["$$item", "NAN"]
                                }
                            }
                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospital: 1,
                    }
                },
                {
                    $project: {
                        hospitalquery: {
                            $cond: {
                                if: { $eq: ["$hospitalquery", []] },
                                then: [{
                                    "hospitalname": "NIL",
                                    "patient": "NIL",

                                }],
                                else: "$hospitalquery"
                            }

                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospital: 1,
                    }
                },
                {

                    $unwind: "$hospitalquery"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalquery: "$hospitalquery",

                        },
                        count: { $sum: 1 },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalquery: {
                            $addToSet: {
                                value: "$_id.hospitalquery",

                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {

                    $unwind: "$hospitalquery"

                },
                {
                    $group: {
                        _id: {
                            name: "$_id",
                            hospitalquery: "$hospitalquery.value.hospitalname",

                        },
                        count: {
                            $sum: {

                                $cond: {
                                    if: {
                                        $eq: ["$hospitalquery.value.hospitalname", "NIL"]
                                    },
                                    then: 0,
                                    else: 1,

                                }
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        hospitalquery: {
                            $addToSet: {
                                value: "$_id.hospitalquery",
                                count: "$count"
                            }
                        },
                        country: { $first: "$country" },
                        treatment: { $first: "$treatment" },
                        hospital: { $first: "$hospital" },
                        email: { $first: "$email" },
                        patientdata: { $first: "$patientdata" },
                        hospital: { $first: "$hospital" },

                    }
                },
                {
                    $project: {
                        hospital: {
                            $cond: {
                                if: { $eq: [{ $first: "$hospital.value" }, "NIL"] },
                                then: "$hospitalquery",
                                else: "$hospital"
                            }

                        },

                        country: 1,
                        treatment: 1,
                        patientdata: 1,
                        hospitalquery: 1,
                    }
                },
                {
                    $addFields: {
                        hospital: {
                            $map: {
                                input: "$hospital",
                                as: "one",
                                in: {
                                    $mergeObjects: [
                                        "$$one",
                                        {
                                            $arrayElemAt: [{
                                                    $filter: {
                                                        input: "$hospitalquery",
                                                        as: "two",
                                                        cond: { $eq: ["$$two.value", "$$one.value"] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                    }
                },
                {
                    $addFields: {
                        countryquerytotal: {
                            $sum: "$country.count"

                        },
                        countryrequesttotal: {
                            $sum: "$country.request"

                        },
                        countryviltotal: {
                            $sum: "$country.vil"

                        },
                        countryconfirmationtotal: {
                            $sum: "$country.confirmation"

                        },
                        countrypartnertotal: {
                            $sum: "$country.refferalpartner"

                        },
                        treatmentrequesttotal: {
                            $sum: "$treatment.request"

                        },
                        treatmentquerytotal: {
                            $sum: "$treatment.count"

                        },
                        treatmentviltotal: {
                            $sum: "$treatment.vil"

                        },
                        treatmentconfirmationtotal: {
                            $sum: "$treatment.confirmation"

                        },
                        treatmentpartnertotal: {
                            $sum: "$treatment.refferalpartner"

                        },
                        hospitalrequesttotal: {
                            $sum: "$hospital.hospitalrequest"

                        },
                        hospitalviltotal: {
                            $sum: "$hospital.hospitalvil"
                        },
                        hospitalconfirmationtotal: {
                            $sum: "$hospital.hospitalconfirmation"

                        },
                        hospitalcounttotal: {
                            $sum: "$hospital.count"

                        },
                        range: "annualdata"

                    }
                },
            ],
        }
    },

    { $project: { activity: { $setUnion: ['$dailydata', '$monthlydata', '$annualdata'] } } },
    { $unwind: '$activity' },
    { $replaceRoot: { newRoot: "$activity" } },
    {
        $group: {
            _id: "$_id",
            dailydata: {
                $push: {
                    $cond: {
                        if: {
                            $eq: ["$range", "dailydata"]
                        },
                        then: {
                            country: "$country",
                            treatment: "$treatment",
                            patientdata: "$patientdata",
                            arrivalConfirmed: "$arrivalConfirmed",
                            arrivingToday: "$arrivingToday",
                            arrivingSevenDays: "$arrivingSevenDays",
                            todayArrivalConfirmed: "$hospitalConfirmationArrival",
                            patientDataTotal: "$patientDataTotal",
                            hospital: "$hospital",
                            countryrequesttotal: "$countryrequesttotal",
                            countryviltotal: "$countryviltotal",
                            countryquerytotal: "$countryquerytotal",
                            countryconfirmationtotal: "$countryconfirmationtotal",
                            countrypartnertotal: "$countrypartnertotal",
                            treatmentrequesttotal: "$treatmentrequesttotal",
                            treatmentquerytotal: "$treatmentquerytotal",
                            treatmentviltotal: "$treatmentviltotal",
                            treatmentconfirmationtotal: "$treatmentconfirmationtotal",
                            treatmentpartnertotal: "$treatmentpartnertotal",
                            hospitalrequesttotal: "$hospitalrequesttotal",
                            hospitalviltotal: "$hospitalviltotal",
                            hospitalconfirmationtotal: "$hospitalconfirmationtotal",
                            hospitalcounttotal: "$hospitalcounttotal",

                        },
                        else: "$$REMOVE",

                    }

                }
            },
            monthlydata: {
                $push: {
                    $cond: {
                        if: {
                            $eq: ["$range", "monthlydata"]
                        },
                        then: {
                            country: "$country",
                            treatment: "$treatment",
                            hospital: "$hospital",
                            countryrequesttotal: "$countryrequesttotal",
                            countryquerytotal: "$countryquerytotal",
                            countryviltotal: "$countryviltotal",
                            countryconfirmationtotal: "$countryconfirmationtotal",
                            countrypartnertotal: "$countrypartnertotal",
                            treatmentrequesttotal: "$treatmentrequesttotal",
                            treatmentquerytotal: "$treatmentquerytotal",
                            treatmentviltotal: "$treatmentviltotal",
                            treatmentconfirmationtotal: "$treatmentconfirmationtotal",
                            treatmentpartnertotal: "$treatmentpartnertotal",
                            hospitalrequesttotal: "$hospitalrequesttotal",
                            hospitalviltotal: "$hospitalviltotal",
                            hospitalconfirmationtotal: "$hospitalconfirmationtotal",
                            hospitalcounttotal: "$hospitalcounttotal",

                        },
                        else: "$$REMOVE",

                    }

                }
            },
            annualdata: {
                $push: {
                    $cond: {
                        if: {
                            $eq: ["$range", "annualdata"]
                        },
                        then: {
                            country: "$country",
                            treatment: "$treatment",
                            hospital: "$hospital",
                            countryrequesttotal: "$countryrequesttotal",
                            countryquerytotal: "$countryquerytotal",
                            countryviltotal: "$countryviltotal",
                            countryconfirmationtotal: "$countryconfirmationtotal",
                            countrypartnertotal: "$countrypartnertotal",
                            treatmentrequesttotal: "$treatmentrequesttotal",
                            treatmentquerytotal: "$treatmentquerytotal",
                            treatmentviltotal: "$treatmentviltotal",
                            treatmentconfirmationtotal: "$treatmentconfirmationtotal",
                            treatmentpartnertotal: "$treatmentpartnertotal",
                            hospitalrequesttotal: "$hospitalrequesttotal",
                            hospitalviltotal: "$hospitalviltotal",
                            hospitalconfirmationtotal: "$hospitalconfirmationtotal",
                            hospitalcounttotal: "$hospitalcounttotal",

                        },
                        else: "$$REMOVE",

                    }

                }
            },

        },

    },

    {
        $project: {
            dailydata: {

                $cond: {
                    if: {
                        $eq: ["$dailydata", []]
                    },
                    then: {
                        country: [{
                            "value": "NIL",
                            "vil": 0,
                            "confirmation": 0,
                            "request": 0,
                            "refferalpartner": 0,
                            "count": 0
                        }],
                        treatment: [{
                            "value": "NIL",
                            "vil": 0,
                            "confirmation": 0,
                            "request": 0,
                            "refferalpartner": 0,
                            "count": 0

                        }],
                        patientdata: [{
                            "name": "NIL",
                            "treatment": "NIL",
                            "country": "NIL",
                            "mhid": "NIL",
                            "status": "NIL",
                            "uhidcode": "NIL",

                        }],
                        hospital: [{
                            "value": "NIL",
                            "hospitalrequest": 0,
                            "hospitalvil": 0,
                            "hospitalconfirmation": 0,
                            "count": 0
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
                        "arrivalConfirmed": 0,
                        "arrivingToday": 0,
                        "arrivingSevenDays": 0,
                        patientDataTotal: 0,
                        countryrequesttotal: 0,
                        countryquerytotal: 0,
                        countryviltotal: 0,
                        countryconfirmationtotal: 0,
                        countrypartnertotal: 0,
                        treatmentrequesttotal: 0,
                        treatmentquerytotal: 0,
                        treatmentviltotal: 0,
                        treatmentconfirmationtotal: 0,
                        treatmentpartnertotal: 0,
                        hospitalrequesttotal: 0,
                        hospitalviltotal: 0,
                        hospitalconfirmationtotal: 0,
                        hospitalcounttotal: 0,

                    },
                    else: "$dailydata",

                }


            },
            monthlydata: {

                $cond: {
                    if: {
                        $eq: ["$monthlydata", []]
                    },
                    then: {
                        country: [{
                            "value": "NIL",
                            "vil": 0,
                            "confirmation": 0,
                            "request": 0,
                            "refferalpartner": 0,
                            "count": 0
                        }],
                        treatment: [{
                            "value": "NIL",
                            "vil": 0,
                            "confirmation": 0,
                            "request": 0,
                            "refferalpartner": 0,
                            "count": 0

                        }],
                        hospital: [{
                            "value": "NIL",
                            "hospitalrequest": 0,
                            "hospitalvil": 0,
                            "hospitalconfirmation": 0,
                            "count": 0

                        }],
                        countryrequesttotal: 0,
                        countryquerytotal: 0,
                        countryviltotal: 0,
                        countryconfirmationtotal: 0,
                        countrypartnertotal: 0,
                        treatmentquerytotal: 0,
                        treatmentrequesttotal: 0,
                        treatmentviltotal: 0,
                        treatmentconfirmationtotal: 0,
                        treatmentpartnertotal: 0,
                        hospitalrequesttotal: 0,
                        hospitalviltotal: 0,
                        hospitalconfirmationtotal: 0,
                        hospitalcounttotal: 0,

                    },
                    else: "$monthlydata",

                }


            },
            annualdata: {

                $cond: {
                    if: {
                        $eq: ["$annualdata", []]
                    },
                    then: {
                        country: [{
                            "value": "NIL",
                            "vil": 0,
                            "confirmation": 0,
                            "request": 0,
                            "refferalpartner": 0,
                            "count": 0
                        }],
                        treatment: [{
                            "value": "NIL",
                            "vil": 0,
                            "confirmation": 0,
                            "request": 0,
                            "refferalpartner": 0,
                            "count": 0

                        }],
                        hospital: [{
                            "value": "NIL",
                            "hospitalrequest": 0,
                            "hospitalvil": 0,
                            "hospitalconfirmation": 0,
                            "count": 0
                        }],
                        countryquerytotal: 0,
                        countryrequesttotal: 0,
                        countryviltotal: 0,
                        countryconfirmationtotal: 0,
                        countrypartnertotal: 0,
                        treatmentrequesttotal: 0,
                        treatmentquerytotal: 0,
                        treatmentviltotal: 0,
                        treatmentconfirmationtotal: 0,
                        treatmentpartnertotal: 0,
                        hospitalrequesttotal: 0,
                        hospitalviltotal: 0,
                        hospitalconfirmationtotal: 0,
                        hospitalcounttotal: 0,

                    },
                    else: "$annualdata",

                }


            },
        }
    },
    {
        $addFields: {
            dailydata: {
                $cond: {
                    if: {
                        $isArray: ["$dailydata"]
                    },
                    then: { $arrayElemAt: ['$dailydata', 0] },
                    else: "$dailydata"
                }
            },
            monthlydata: {
                $cond: {
                    if: {
                        $isArray: ["$monthlydata"]
                    },
                    then: { $arrayElemAt: ['$monthlydata', 0] },
                    else: "$monthlydata"
                }
            },
            annualdata: {
                $cond: {
                    if: {
                        $isArray: ["$annualdata"]
                    },
                    then: { $arrayElemAt: ['$annualdata', 0] },
                    else: "$annualdata"
                }
            },
        }
    },


]
module.exports = { pipeline }