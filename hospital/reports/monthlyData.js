var empty = [{
    hospitalname: "NIL",
    _id: "NIL",
    patient: "NIL",
    hospitalid: "NIL",
}]
var emptyHospitalPatient = [{
    hospitalName: "NIL",
    _id: "NIL",
    patient: "NIL",
    hospitalId: "NIL",
}]
var emptyPatient = [{

    _id: "NIL",
    country: "NIL",
    treatment: "NIL",
    companyname: "NIL",

}]
var emptyPatientRefferal = [{

    _id: "NIL",
    country: "NIL",
    refferalpartner: {
        name: "NIL"
    },
}]
emptyRefferal = {
    name: "None"

}
let date = new Date();
var firstDay =
    new Date(date.getFullYear(), date.getMonth(), 1);

var lastDay =
    new Date(date.getFullYear(), date.getMonth() + 1, 0);
lastDay.setHours(23, 59, 0, 0)


monthlyData = (doc) => {
    data = doc
    dataPipe = [{
            $project: {
                // _id: 1,
                hospitalGroupId: "$name._id",
                hospitalGroupName: "$name.name",
                hospitalGroupCms: data

            }
        }, {

            $unwind: "$hospitalGroupCms"
        },

        { "$match": { "$expr": { "$eq": ["$hospitalGroupId", { $toString: "$hospitalGroupCms._id" }] } } },

        {
            $lookup: {
                from: 'requestvil',
                "let": { "id": "$hospitalGroupCms.hospitalid" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],

                as: 'hospitalVil',

            }
        }, {
            $lookup: {
                from: 'confirmation',
                "let": { "id": "$hospitalGroupCms.hospitalid" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],
                as: 'hospitalConfirmation',

            }
        }, {
            $lookup: {
                from: 'request',
                "let": { "id": "$hospitalGroupCms.hospitalid" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],
                as: 'hospitalOpinionRequest',

            }
        }, {
            $lookup: {
                from: 'opdrequest',
                "let": { "id": "$hospitalGroupCms.hospitalid" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],
                as: 'hospitalOpdRequest',

            }
        }, {

            $lookup: {
                from: 'pirequest',
                "let": { "id": "$hospitalGroupCms.hospitalid" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],
                as: 'hospitalPiRequest',

            }
        }, {

            $lookup: {
                from: 'preintimation',
                "let": { "id": "$hospitalGroupCms.hospitalid" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],
                as: 'hospitalPreIntimation',

            }
        },

        {
            $project: {
                hospitalGroupId: 1,
                hospitalGroupName: 1,
                hospitalGroupCms: 1,
                "hospitalVil.hospitalname": 1,
                "hospitalVil._id": 1,
                "hospitalVil.patient": 1,
                "hospitalVil.hospitalid": 1,
                "hospitalConfirmation.hospitalname": 1,
                "hospitalConfirmation.patient": 1,
                "hospitalConfirmation._id": 1,
                "hospitalConfirmation.hospitalid": 1,
                "hospitalOpinionRequest.hospitalname": 1,
                "hospitalOpinionRequest.patient": 1,
                "hospitalOpinionRequest._id": 1,
                "hospitalOpinionRequest.hospitalid": 1,
                "hospitalOpdRequest.hospitalname": 1,
                "hospitalOpdRequest.patient": 1,
                "hospitalOpdRequest.hospitalid": 1,
                "hospitalPiRequest.hospitalname": 1,
                "hospitalPiRequest.patient": 1,
                "hospitalPiRequest.hospitalid": 1,
                "hospitalPreIntimation.hospitalname": 1,
                "hospitalPreIntimation.patient": 1,
                "hospitalPreIntimation.hospitalid": 1,
                hospitalGroupCms: 1
            }
        },

        {
            $addFields: {
                hospitalquery: {
                    $concatArrays: [
                        "$hospitalOpdRequest",
                        "$hospitalPreIntimation",
                        "$hospitalPiRequest",
                        "$hospitalOpinionRequest",
                        "$hospitalVil",
                        "$hospitalConfirmation"

                    ]

                },
            }
        }, {
            $addFields: {
                hospitalquery: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalquery", []]
                        },
                        then: empty,

                        else: "$hospitalquery",

                    }
                },
                hospitalOpinionRequest: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOpinionRequest", []]
                        },
                        then: empty,

                        else: "$hospitalOpinionRequest",

                    }
                },
                hospitalVilTreatment: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVil", []]
                        },
                        then: empty,

                        else: "$hospitalVil",

                    }
                },
                hospitalVil: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVil", []]
                        },
                        then: empty,

                        else: "$hospitalVil",

                    }
                },
                hospitalConfirmation: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConfirmation", []]
                        },
                        then: empty,

                        else: "$hospitalConfirmation",

                    }
                }

            }
        },

        {
            $unwind: "$hospitalVil"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalVil.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalVil.patient',

            }
        }, {
            $addFields: {
                "hospitalVil.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVil.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalVil.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalVil.patient"
        },

        {
            $group: {
                _id: {
                    hospitalGroupId: "$hospitalGroupId",
                    hospitalGroupName: "$hospitalGroupName",
                },

                hospitalVil: { $push: "$hospitalVil" },
                hospitalConfirmation: { $first: "$hospitalConfirmation" },
                hospitalquery: { $first: "$hospitalquery" },

                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmation" },
                hospitalqueryTreatment: { $first: "$hospitalquery" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
            }
        }, {
            $unwind: "$hospitalVil"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$hospitalVil.patient.country",

                },
                hospitalConfirmation: { $first: "$hospitalConfirmation" },
                hospitalquery: { $first: "$hospitalquery" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseVil: {
                    $addToSet: {
                        value: "$_id.country",

                        vil: "$count"
                    }
                },

                hospitalConfirmation: { $first: "$hospitalConfirmation" },
                hospitalquery: { $first: "$hospitalquery" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },



        {
            $unwind: "$hospitalConfirmation"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalConfirmation.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalConfirmation.patient',

            }
        }, {
            $addFields: {
                "hospitalConfirmation.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConfirmation.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalConfirmation.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalConfirmation.patient"
        },

        {
            $group: {
                _id: "$_id",
                hospitalConfirmation: { $push: "$hospitalConfirmation" },
                countryWiseVil: { $first: "$countryWiseVil" },
                hospitalquery: { $first: "$hospitalquery" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConfirmation"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$hospitalConfirmation.patient.country",

                },
                countryWiseVil: { $first: "$countryWiseVil" },
                hospitalquery: { $first: "$hospitalquery" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseConf: {
                    $addToSet: {
                        value: "$_id.country",

                        conf: "$count"
                    }
                },

                countryWiseVil: { $first: "$countryWiseVil" },
                hospitalQuery: { $first: "$hospitalquery" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$hospitalQuery"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalQuery.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalQuery.patient',

            }
        }, {
            $addFields: {
                "hospitalQuery.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalQuery.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalQuery.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalQuery.patient"
        },

        {
            $group: {
                _id: "$_id",
                countryWiseVil: { $first: "$countryWiseVil" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalQuery: { $push: "$hospitalQuery" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalQuery"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$hospitalQuery.patient.country",
                    patientId: "$hospitalQuery.patient._id",

                },
                countryWiseVil: { $first: "$countryWiseVil" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseTotal: {
                    $addToSet: {
                        value: "$_id.country",
                        patientId: "$_id.patientId",

                        val: "$count"
                    }
                },

                countryWiseVil: { $first: "$countryWiseVil" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$countryWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$countryWiseTotal.value",

                },
                countryWiseVil: { $first: "$countryWiseVil" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseQuery: {
                    $addToSet: {
                        value: "$_id.country",

                        val: "$count"
                    }
                },

                countryWiseVil: { $first: "$countryWiseVil" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $project: {
                countryWiseConf: {
                    $filter: {
                        input: "$countryWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                countryWiseVil: {
                    $filter: {
                        input: "$countryWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                countryWiseQuery: 1,
                hospitalVilTreatment: 1,
                hospitalConfirmationTreatment: 1,
                hospitalqueryTreatment: 1,
                hospitalGroupCms: 1
            }
        },

        {
            $project: {
                countryWise: {
                    $map: {
                        input: "$countryWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$countryWiseVil",
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

                countryWiseConf: 1,
                hospitalVilTreatment: 1,
                hospitalConfirmationTreatment: 1,
                hospitalqueryTreatment: 1,
                hospitalGroupCms: 1

            }
        }, {
            $project: {
                countryWise: {
                    $map: {
                        input: "$countryWise",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$countryWiseConf",
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
                hospitalVilTreatment: 1,
                hospitalConfirmationTreatment: 1,
                hospitalqueryTreatment: 1,
                hospitalGroupCms: 1

            }
        },

        {
            $addFields: {
                hospitalVilHospital: "$hospitalVilTreatment"
            }
        },
        // Treatment Wise

        {
            $unwind: "$hospitalVilTreatment"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalVilTreatment.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalVilTreatment.patient',

            }
        }, {
            $addFields: {
                "hospitalVilTreatment.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVilTreatment.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalVilTreatment.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalVilTreatment.patient"
        },

        {
            $group: {
                _id: "$_id",


                hospitalVilTreatment: { $push: "$hospitalVilTreatment" },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                countryWise: { $first: "$countryWise" },


                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryHospital: { $first: "$hospitalqueryTreatment" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalVilTreatment"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$hospitalVilTreatment.patient.treatment",

                },
                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseVil: {
                    $addToSet: {
                        value: "$_id.treatment",

                        vil: "$count"
                    }
                },

                hospitalConfirmationTreatment: { $first: "$hospitalConfirmationTreatment" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },



        {
            $unwind: "$hospitalConfirmationTreatment"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalConfirmationTreatment.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalConfirmationTreatment.patient',

            }
        }, {
            $addFields: {
                "hospitalConfirmationTreatment.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConfirmationTreatment.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalConfirmationTreatment.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalConfirmationTreatment.patient"
        },

        {
            $group: {
                _id: "$_id",
                hospitalConfirmationTreatment: { $push: "$hospitalConfirmationTreatment" },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConfirmationTreatment"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$hospitalConfirmationTreatment.patient.treatment",

                },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                hospitalqueryTreatment: { $first: "$hospitalqueryTreatment" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseConf: {
                    $addToSet: {
                        value: "$_id.treatment",

                        conf: "$count"
                    }
                },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                hospitalQueryTreatment: { $first: "$hospitalqueryTreatment" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$hospitalQueryTreatment"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalQueryTreatment.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalQueryTreatment.patient',

            }
        }, {
            $addFields: {
                "hospitalQueryTreatment.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalQueryTreatment.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalQueryTreatment.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalQueryTreatment.patient"
        },

        {
            $group: {
                _id: "$_id",
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                hospitalQueryTreatment: { $push: "$hospitalQueryTreatment" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalQueryTreatment"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$hospitalQueryTreatment.patient.treatment",
                    patientId: "$hospitalQueryTreatment.patient._id",

                },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseTotal: {
                    $addToSet: {
                        value: "$_id.treatment",
                        patientId: "$_id.patientId",

                        val: "$count"
                    }
                },

                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$treatmentWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$treatmentWiseTotal.value",

                },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseQuery: {
                    $addToSet: {
                        value: "$_id.treatment",

                        val: "$count"
                    }
                },

                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                countryWise: { $first: "$countryWise" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilHospital" },

            }
        }, {
            $project: {
                treatmentWiseConf: {
                    $filter: {
                        input: "$treatmentWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                treatmentWiseVil: {
                    $filter: {
                        input: "$treatmentWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                treatmentWiseQuery: 1,
                countryWise: 1,
                hospitalVilHospital: 1,
                hospitalConfirmationHospital: 1,
                hospitalqueryHospital: 1,
                hospitalGroupCms: 1,
                hospitalVilRefferal: 1
            }
        },

        {
            $project: {
                treatmentWise: {
                    $map: {
                        input: "$treatmentWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$treatmentWiseVil",
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

                treatmentWiseConf: 1,
                countryWise: 1,
                hospitalVilHospital: 1,
                hospitalConfirmationHospital: 1,
                hospitalqueryHospital: 1,
                hospitalGroupCms: 1,
                hospitalVilRefferal: 1
            }
        }, {
            $project: {
                treatmentWise: {
                    $map: {
                        input: "$treatmentWise",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$treatmentWiseConf",
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

                countryWise: 1,
                hospitalVilHospital: 1,
                hospitalConfirmationHospital: 1,
                hospitalqueryHospital: 1,
                hospitalGroupCms: 1,
                hospitalVilRefferal: 1

            }


        },

        // Hospital Wise
        {
            $unwind: "$hospitalVilHospital"
        },


        {
            $group: {
                _id: "$_id",

                hospitalVilHospital: { $push: "$hospitalVilHospital" },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryRefferal: { $first: "$hospitalqueryHospital" },
            }
        }, {
            $unwind: "$hospitalVilHospital"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalVilHospital.hospitalname",

                },
                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseVil: {
                    $addToSet: {
                        value: "$_id.hospital",
                        vil: "$count"
                    }
                },

                hospitalConfirmationHospital: { $first: "$hospitalConfirmationHospital" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
            }
        },

        {
            $unwind: "$hospitalConfirmationHospital"
        },


        {
            $group: {
                _id: "$_id",

                hospitalConfirmationHospital: { $push: "$hospitalConfirmationHospital" },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
            }
        }, {
            $unwind: "$hospitalConfirmationHospital"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalConfirmationHospital.hospitalname",

                },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalqueryHospital: { $first: "$hospitalqueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseConf: {
                    $addToSet: {
                        value: "$_id.hospital",
                        conf: "$count"
                    }
                },

                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalQueryHospital: { $first: "$hospitalqueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
            }
        },


        {
            $unwind: "$hospitalQueryHospital"
        },



        {
            $group: {
                _id: "$_id",
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                hospitalQueryHospital: { $push: "$hospitalQueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
            }
        }, {
            $unwind: "$hospitalQueryHospital"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalQueryHospital.hospitalname",
                    patientId: "$hospitalQueryHospital.patient",

                },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseTotal: {
                    $addToSet: {
                        value: "$_id.hospital",
                        patientId: "$_id.patientId",

                        val: "$count"
                    }
                },

                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
            }
        },

        {
            $unwind: "$hospitalWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalWiseTotal.value",

                },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseQuery: {
                    $addToSet: {
                        value: "$_id.hospital",

                        val: "$count"
                    }
                },

                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
            }
        }, {
            $project: {
                hospitalWiseConf: {
                    $filter: {
                        input: "$hospitalWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                hospitalWiseVil: {
                    $filter: {
                        input: "$hospitalWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                hospitalWiseQuery: 1,
                countryWise: 1,
                treatmentWise: 1,
                hospitalGroupCms: 1,
                hospitalVilRefferal: 1,
                hospitalConfirmationRefferal: 1,
                hospitalqueryRefferal: 1
            }
        },

        {
            $project: {
                hospitalWise: {
                    $map: {
                        input: "$hospitalWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$hospitalWiseVil",
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

                hospitalWiseConf: 1,
                countryWise: 1,
                treatmentWise: 1,
                hospitalGroupCms: 1,
                hospitalVilRefferal: 1,
                hospitalConfirmationRefferal: 1,
                hospitalqueryRefferal: 1
            }
        }, {
            $project: {
                hospitalWise: {
                    $map: {
                        input: "$hospitalWise",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$hospitalWiseConf",
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

                countryWise: 1,
                treatmentWise: 1,
                hospitalGroupCms: "$hospitalGroupCms.hospitalid",
                hospitalVilRefferal: 1,
                hospitalConfirmationRefferal: 1,
                hospitalqueryRefferal: 1
            }
        },
        // Refferal Wise

        {
            $unwind: "$hospitalVilRefferal"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalVilRefferal.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1, "companyname": 1 } }
                ],
                as: 'hospitalVilRefferal.patient',

            }
        }, {
            $addFields: {
                "hospitalVilRefferal.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVilRefferal.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalVilRefferal.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalVilRefferal.patient"
        },

        {
            $group: {
                _id: "$_id",


                hospitalVilRefferal: { $push: "$hospitalVilRefferal" },

                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },

                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalVilRefferal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$hospitalVilRefferal.patient.companyname",

                },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseVil: {
                    $addToSet: {
                        value: "$_id.refferal",

                        vil: "$count"
                    }
                },

                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                hospitalConfirmationRefferal: { $first: "$hospitalConfirmationRefferal" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },



        {
            $unwind: "$hospitalConfirmationRefferal"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalConfirmationRefferal.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1, "companyname": 1 } }
                ],
                as: 'hospitalConfirmationRefferal.patient',

            }
        }, {
            $addFields: {
                "hospitalConfirmationRefferal.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConfirmationRefferal.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalConfirmationRefferal.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalConfirmationRefferal.patient"
        },

        {
            $group: {
                _id: "$_id",
                hospitalConfirmationRefferal: { $push: "$hospitalConfirmationRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConfirmationRefferal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$hospitalConfirmationRefferal.patient.companyname",

                },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseConf: {
                    $addToSet: {
                        value: "$_id.refferal",

                        conf: "$count"
                    }
                },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalqueryRefferal: { $first: "$hospitalqueryRefferal" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$hospitalqueryRefferal"
        },

        {

            $lookup: {
                from: 'patient',
                "let": { "id": "$hospitalqueryRefferal.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1, "companyname": 1 } }
                ],
                as: 'hospitalqueryRefferal.patient',

            }
        }, {
            $addFields: {
                "hospitalqueryRefferal.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalqueryRefferal.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalqueryRefferal.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalqueryRefferal.patient"
        },

        {
            $group: {
                _id: "$_id",
                hospitalqueryRefferal: { $push: "$hospitalqueryRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalqueryRefferal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$hospitalqueryRefferal.patient.companyname",
                    patientId: "$hospitalqueryRefferal.patient._id",

                },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },


                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseTotal: {
                    $addToSet: {
                        value: "$_id.refferal",
                        patientId: "$_id.patientId",

                        val: "$count"
                    }
                },

                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$refferalWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$refferalWiseTotal.value",

                },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },
                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseQuery: {
                    $addToSet: {
                        value: "$_id.refferal",

                        val: "$count"
                    }
                },

                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $project: {
                refferalWiseConf: {
                    $filter: {
                        input: "$refferalWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                refferalWiseVil: {
                    $filter: {
                        input: "$refferalWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                refferalWiseQuery: 1,
                hospitalGroupCms: 1,
            }
        },

        {
            $project: {
                refferalWise: {
                    $map: {
                        input: "$refferalWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$refferalWiseVil",
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

                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                refferalWiseConf: 1,
                hospitalGroupCms: 1,
            }
        }, {
            $project: {
                refferalWise: {
                    $map: {
                        input: "$refferalWise",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$refferalWiseConf",
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

                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                hospitalGroupCms: 1,

            }
        },
        // Hospital Own Patient
        {
            $lookup: {
                from: 'hospitalQueryAssign',
                "let": { "id": "$hospitalGroupCms" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalId", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],

                as: 'hospitalOwnQuery',

            }
        }, {
            $lookup: {
                from: 'hospitalVilAssign',
                "let": { "id": "$hospitalGroupCms" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalId", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],

                as: 'hospitalOwnVil',

            }
        }, {
            $lookup: {
                from: 'hospitalConfirmationAssign',
                "let": { "id": "$hospitalGroupCms" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalId", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],

                as: 'hospitalOwnConf',

            }
        }, {
            $lookup: {
                from: 'hospitalOpdAssign',
                "let": { "id": "$hospitalGroupCms" },

                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$hospitalId", "$$id"] } } },
                    {
                        $match: {
                            createdAt: { $gte: firstDay, $lte: lastDay },

                        }
                    },
                ],

                as: 'hospitalOwnOpd',

            }
        }, {
            $project: {
                hospitalGroupCms: 1,
                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                refferalWise: 1,
                "hospitalOwnVil.hospitalName": 1,
                "hospitalOwnVil._id": 1,
                "hospitalOwnVil.patient": 1,
                "hospitalOwnVil.hospitalId": 1,
                "hospitalOwnQuery.hospitalName": 1,
                "hospitalOwnQuery._id": 1,
                "hospitalOwnQuery.patient": 1,
                "hospitalOwnQuery.hospitalId": 1,
                "hospitalOwnOpd.hospitalName": 1,
                "hospitalOwnOpd._id": 1,
                "hospitalOwnOpd.patient": 1,
                "hospitalOwnOpd.hospitalId": 1,
                "hospitalOwnConf.hospitalName": 1,
                "hospitalOwnConf._id": 1,
                "hospitalOwnConf.patient": 1,
                "hospitalOwnConf.hospitalId": 1,
            }
        },

        {
            $addFields: {
                hospitalOwnQuery: {
                    $concatArrays: [
                        "$hospitalOwnQuery",
                        "$hospitalOwnVil",
                        "$hospitalOwnOpd",
                        "$hospitalOwnConf",
                    ]

                },
            }
        }, {
            $addFields: {
                hospitalOwnQuery: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOwnQuery", []]
                        },
                        then: emptyHospitalPatient,

                        else: "$hospitalOwnQuery",

                    }
                },
                hospitalVilTreatment: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOwnVil", []]
                        },
                        then: emptyHospitalPatient,

                        else: "$hospitalOwnVil",

                    }
                },
                hospitalVil: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOwnVil", []]
                        },
                        then: emptyHospitalPatient,

                        else: "$hospitalOwnVil",

                    }
                },
                hospitalConf: {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOwnConf", []]
                        },
                        then: emptyHospitalPatient,

                        else: "$hospitalOwnConf",

                    }
                },

            }
        }, {
            $unwind: "$hospitalVil"
        },

        {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalVil.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalVil.patient',

            }
        }, {
            $addFields: {
                "hospitalVil.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVil.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalVil.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalVil.patient"
        },

        {
            $group: {
                _id: "$_id",

                hospitalVil: { $push: "$hospitalVil" },

                hospitalOwnQuery: { $first: "$hospitalOwnQuery" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQuery" },
                hospitalConf: { $first: "$hospitalConf" },
                hospitalConfTreatment: { $first: "$hospitalConf" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" }

            }
        }, {
            $unwind: "$hospitalVil"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$hospitalVil.patient.country",

                },

                hospitalOwnQuery: { $first: "$hospitalOwnQuery" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                hospitalConf: { $first: "$hospitalConf" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseVil: {
                    $addToSet: {
                        value: "$_id.country",

                        vil: "$count"
                    }
                },


                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                hospitalConf: { $first: "$hospitalConf" },
                hospitalQuery: { $first: "$hospitalOwnQuery" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConf"
        },

        {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalConf.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalConf.patient',

            }
        }, {
            $addFields: {
                "hospitalConf.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConf.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalConf.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalConf.patient"
        },

        {
            $group: {
                _id: "$_id",

                hospitalConf: { $push: "$hospitalConf" },

                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWiseVil: { $first: "$countryWiseVil" },
                hospitalQuery: { $first: "$hospitalQuery" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConf"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$hospitalConf.patient.country",

                },

                hospitalQuery: { $first: "$hospitalQuery" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWiseVil: { $first: "$countryWiseVil" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseConf: {
                    $addToSet: {
                        value: "$_id.country",

                        conf: "$count"
                    }
                },


                hospitalQuery: { $first: "$hospitalQuery" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWiseVil: { $first: "$countryWiseVil" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$hospitalQuery"
        }, {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalQuery.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalQuery.patient',

            }
        }, {
            $addFields: {
                "hospitalQuery.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalQuery.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalQuery.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalQuery.patient"
        },

        {
            $group: {
                _id: "$_id",
                countryWiseVil: { $first: "$countryWiseVil" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalQuery: { $push: "$hospitalQuery" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalQuery"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$hospitalQuery.patient.country",
                    patientId: "$hospitalQuery.patient._id",

                },
                countryWiseVil: { $first: "$countryWiseVil" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },


                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseTotal: {
                    $addToSet: {
                        value: "$_id.country",
                        patientId: "$_id.patientId",

                        val: "$count"
                    }
                },

                countryWiseVil: { $first: "$countryWiseVil" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$countryWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$countryWiseTotal.value",

                },
                countryWiseVil: { $first: "$countryWiseVil" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWiseQuery: {
                    $addToSet: {
                        value: "$_id.country",

                        val: "$count"
                    }
                },

                countryWiseVil: { $first: "$countryWiseVil" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalVilTreatment: { $first: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                hospitalVilHospital: { $first: "$hospitalVilTreatment" },
                countryWiseConf: { $first: "$countryWiseConf" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $project: {
                countryWiseVil: {
                    $filter: {
                        input: "$countryWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                countryWiseConf: {
                    $filter: {
                        input: "$countryWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                countryWiseQuery: 1,
                countryWise: 1,
                hospitalWise: 1,
                treatmentWise: 1,
                hospitalVilTreatment: 1,
                hospitalOwnQueryTreatment: 1,
                hospitalVilHospital: 1,
                hospitalConfTreatment: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                countryWiseByHospital: {
                    $map: {
                        input: "$countryWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$countryWiseVil",
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

                countryWise: 1,
                hospitalWise: 1,
                treatmentWise: 1,
                hospitalVilTreatment: 1,
                hospitalOwnQueryTreatment: 1,
                hospitalVilHospital: 1,
                countryWiseConf: 1,
                hospitalConfTreatment: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                countryWiseByHospital: {
                    $map: {
                        input: "$countryWiseByHospital",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$countryWiseConf",
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

                countryWise: 1,
                hospitalWise: 1,
                treatmentWise: 1,
                hospitalVilTreatment: 1,
                hospitalOwnQueryTreatment: 1,
                hospitalVilHospital: 1,
                hospitalConfTreatment: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        },
        // Hospital Patient Treatment Wise

        {
            $unwind: "$hospitalVilTreatment"
        },

        {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalVilTreatment.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalVilTreatment.patient',

            }
        }, {
            $addFields: {
                "hospitalVilTreatment.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVilTreatment.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalVilTreatment.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalVilTreatment.patient"
        },

        {
            $group: {
                _id: "$_id",

                hospitalVilTreatment: { $push: "$hospitalVilTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalConfHospital: { $first: "$hospitalConfTreatment" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryTreatment" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$hospitalVilTreatment"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$hospitalVilTreatment.patient.treatment",

                },

                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseVil: {
                    $addToSet: {
                        value: "$_id.treatment",

                        vil: "$count"
                    }
                },


                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                hospitalConfTreatment: { $first: "$hospitalConfTreatment" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConfTreatment"
        },

        {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalConfTreatment.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalConfTreatment.patient',

            }
        }, {
            $addFields: {
                "hospitalConfTreatment.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConfTreatment.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalConfTreatment.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalConfTreatment.patient"
        },

        {
            $group: {
                _id: "$_id",

                hospitalConfTreatment: { $push: "$hospitalConfTreatment" },
                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryTreatment" },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$hospitalConfTreatment"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$hospitalConfTreatment.patient.treatment",

                },

                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseConf: {
                    $addToSet: {
                        value: "$_id.treatment",

                        conf: "$count"
                    }
                },


                hospitalOwnQueryTreatment: { $first: "$hospitalOwnQueryTreatment" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalOwnQueryTreatment"
        }, {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalOwnQueryTreatment.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1 } }
                ],
                as: 'hospitalOwnQueryTreatment.patient',

            }
        }, {
            $addFields: {
                "hospitalOwnQueryTreatment.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOwnQueryTreatment.patient", []]
                        },
                        then: emptyPatient,

                        else: "$hospitalOwnQueryTreatment.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalOwnQueryTreatment.patient"
        },

        {
            $group: {
                _id: "$_id",
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalOwnQueryTreatment: { $push: "$hospitalOwnQueryTreatment" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalOwnQueryTreatment"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$hospitalOwnQueryTreatment.patient.treatment",
                    patientId: "$hospitalOwnQueryTreatment.patient._id",

                },
                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseTotal: {
                    $addToSet: {
                        value: "$_id.treatment",
                        patientId: "$_id.patientId",

                        val: "$count"
                    }
                },

                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$treatmentWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$treatmentWiseTotal.value",

                },

                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWiseQuery: {
                    $addToSet: {
                        value: "$_id.treatment",

                        val: "$count"
                    }
                },

                treatmentWiseVil: { $first: "$treatmentWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                hospitalVilHospital: { $first: "$hospitalVilHospital" },
                hospitalOwnQueryHospital: { $first: "$hospitalOwnQueryHospital" },
                treatmentWiseConf: { $first: "$treatmentWiseConf" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                hospitalVilRefferal: { $first: "$hospitalVilHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $project: {
                treatmentWiseVil: {
                    $filter: {
                        input: "$treatmentWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                treatmentWiseConf: {
                    $filter: {
                        input: "$treatmentWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                treatmentWiseQuery: 1,
                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                countryWiseByHospital: 1,
                hospitalVilHospital: 1,
                hospitalOwnQueryHospital: 1,
                hospitalConfHospital: 1,
                hospitalVilRefferal: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                treatmentWiseByHospital: {
                    $map: {
                        input: "$treatmentWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$treatmentWiseVil",
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

                countryWise: 1,
                hospitalWise: 1,
                treatmentWise: 1,
                countryWiseByHospital: 1,
                hospitalVilHospital: 1,
                hospitalOwnQueryHospital: 1,
                treatmentWiseConf: 1,
                hospitalConfHospital: 1,
                hospitalVilRefferal: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                treatmentWiseByHospital: {
                    $map: {
                        input: "$treatmentWiseByHospital",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$treatmentWiseConf",
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

                countryWise: 1,
                hospitalWise: 1,
                treatmentWise: 1,
                countryWiseByHospital: 1,
                hospitalVilHospital: 1,
                hospitalOwnQueryHospital: 1,
                hospitalConfHospital: 1,
                hospitalVilRefferal: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        },
        // Hospital Patient Hospital Wise

        {
            $unwind: "$hospitalVilHospital"
        },


        {
            $group: {
                _id: "$_id",

                hospitalVilHospital: { $push: "$hospitalVilHospital" },
                hospitalOwnQueryhospital: { $first: "$hospitalOwnQueryHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryHospital" },
                hospitalConfRefferal: { $first: "$hospitalConfHospital" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$hospitalVilHospital"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalVilHospital.hospitalName",

                },

                hospitalOwnQueryhospital: { $first: "$hospitalOwnQueryhospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseVil: {
                    $addToSet: {
                        value: "$_id.hospital",

                        vil: "$count"
                    }
                },


                hospitalOwnQueryhospital: { $first: "$hospitalOwnQueryhospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalConfHospital: { $first: "$hospitalConfHospital" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConfHospital"
        },


        {
            $group: {
                _id: "$_id",

                hospitalConfHospital: { $push: "$hospitalConfHospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalOwnQueryhospital: { $first: "$hospitalOwnQueryhospital" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },


            }
        }, {
            $unwind: "$hospitalConfHospital"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalConfHospital.hospitalName",

                },

                hospitalOwnQueryhospital: { $first: "$hospitalOwnQueryhospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseConf: {
                    $addToSet: {
                        value: "$_id.hospital",

                        conf: "$count"
                    }
                },


                hospitalOwnQueryhospital: { $first: "$hospitalOwnQueryhospital" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalOwnQueryhospital"
        },



        {
            $group: {
                _id: "$_id",
                hospitalOwnQueryhospital: { $push: "$hospitalOwnQueryhospital" },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalOwnQueryhospital"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalOwnQueryhospital.hospitalName",
                    patientId: "$hospitalOwnQueryhospital.patient",

                },
                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseTotal: {
                    $addToSet: {
                        value: "$_id.hospital",
                        patientId: "$_id.patientId",

                        val: "$count"
                    }
                },

                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $unwind: "$hospitalWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalWiseTotal.value",

                },

                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWiseQuery: {
                    $addToSet: {
                        value: "$_id.hospital",

                        val: "$count"
                    }
                },

                hospitalWiseVil: { $first: "$hospitalWiseVil" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseConf: { $first: "$hospitalWiseConf" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                hospitalVilRefferal: { $first: "$hospitalVilRefferal" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $project: {
                hospitalWiseVil: {
                    $filter: {
                        input: "$hospitalWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                hospitalWiseConf: {
                    $filter: {
                        input: "$hospitalWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                hospitalWiseQuery: 1,
                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                countryWiseByHospital: 1,
                treatmentWiseByHospital: 1,
                hospitalOwnQueryRefferal: 1,
                hospitalConfRefferal: 1,
                hospitalVilRefferal: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                hospitalWiseByHospital: {
                    $map: {
                        input: "$hospitalWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$hospitalWiseVil",
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

                countryWise: 1,
                hospitalWise: 1,
                treatmentWise: 1,
                countryWiseByHospital: 1,
                treatmentWiseByHospital: 1,
                hospitalWiseConf: 1,
                hospitalOwnQueryRefferal: 1,
                hospitalConfRefferal: 1,
                hospitalVilRefferal: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                hospitalWiseByHospital: {
                    $map: {
                        input: "$hospitalWiseByHospital",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$hospitalWiseConf",
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

                countryWise: 1,
                hospitalWise: 1,
                treatmentWise: 1,
                countryWiseByHospital: 1,
                treatmentWiseByHospital: 1,
                hospitalOwnQueryRefferal: 1,
                hospitalConfRefferal: 1,
                hospitalVilRefferal: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        },
        // Hospital Patient Refferal Wise

        {
            $unwind: "$hospitalVilRefferal"
        },

        {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalVilRefferal.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1, "refferalpartner": 1 } }
                ],
                as: 'hospitalVilRefferal.patient',

            }
        }, {
            $addFields: {
                "hospitalVilRefferal.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVilRefferal.patient", []]
                        },
                        then: emptyPatientRefferal,

                        else: "$hospitalVilRefferal.patient",

                    }
                },

            }
        },


        {
            $unwind: "$hospitalVilRefferal.patient"
        },

        {
            $addFields: {

                "hospitalVilRefferal.patient.refferalpartner": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalVilRefferal.patient.refferalpartner", "NAN"]
                        },
                        then: emptyRefferal,

                        else: "$hospitalVilRefferal.patient.refferalpartner",

                    }
                },
            }
        }, {
            $group: {
                _id: "$_id",

                hospitalVilRefferal: { $push: "$hospitalVilRefferal" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },




            }
        }, {
            $unwind: "$hospitalVilRefferal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$hospitalVilRefferal.patient.refferalpartner.name",

                },

                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseVil: {
                    $addToSet: {
                        value: "$_id.refferal",

                        vil: "$count"
                    }
                },


                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalConfRefferal"
        },

        {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalConfRefferal.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1, "refferalpartner": 1 } }
                ],
                as: 'hospitalConfRefferal.patient',

            }
        }, {
            $addFields: {
                "hospitalConfRefferal.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConfRefferal.patient", []]
                        },
                        then: emptyPatientRefferal,

                        else: "$hospitalConfRefferal.patient",

                    }
                },


            }
        },


        {
            $unwind: "$hospitalConfRefferal.patient"
        }, {
            $addFields: {

                "hospitalConfRefferal.patient.refferalpartner": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalConfRefferal.patient.refferalpartner", "NAN"]
                        },
                        then: emptyRefferal,

                        else: "$hospitalConfRefferal.patient.refferalpartner",

                    }
                },
            }
        }, {
            $group: {
                _id: "$_id",

                hospitalConfRefferal: { $push: "$hospitalConfRefferal" },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                hospitalConfRefferal: { $first: "$hospitalConfRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$hospitalConfRefferal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$hospitalConfRefferal.patient.refferalpartner.name",

                },
                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },


                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseConf: {
                    $addToSet: {
                        value: "$_id.refferal",

                        conf: "$count"
                    }
                },


                hospitalOwnQueryRefferal: { $first: "$hospitalOwnQueryRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalOwnQueryRefferal"
        }, {

            $lookup: {
                from: 'hospitalpatient',
                "let": { "id": "$hospitalOwnQueryRefferal.patient" },


                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },

                    { "$project": { "country": 1, "treatment": 1, "refferalpartner": 1 } }
                ],
                as: 'hospitalOwnQueryRefferal.patient',

            }
        }, {
            $addFields: {
                "hospitalOwnQueryRefferal.patient": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOwnQueryRefferal.patient", []]
                        },
                        then: emptyPatientRefferal,

                        else: "$hospitalOwnQueryRefferal.patient",

                    }
                },

            }
        }, {
            $unwind: "$hospitalOwnQueryRefferal.patient"
        },

        {
            $addFields: {

                "hospitalOwnQueryRefferal.patient.refferalpartner": {
                    $cond: {
                        if: {
                            $eq: ["$hospitalOwnQueryRefferal.patient.refferalpartner", "NAN"]
                        },
                        then: emptyRefferal,

                        else: "$hospitalOwnQueryRefferal.patient.refferalpartner",

                    }
                },
            }
        }, {
            $group: {
                _id: "$_id",

                hospitalOwnQueryRefferal: { $push: "$hospitalOwnQueryRefferal" },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalOwnQueryRefferal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$hospitalOwnQueryRefferal.patient.refferalpartner.name",
                    patientId: "$hospitalOwnQueryRefferal.patient._id",

                },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseTotal: {
                    $addToSet: {
                        value: "$_id.refferal",
                        patientId: "$_id.patientId",
                        val: "$count"
                    }
                },
                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },


            }
        },

        {
            $unwind: "$refferalWiseTotal"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$refferalWiseTotal.value",

                },

                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                count: {
                    $sum: 1
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWiseQuery: {
                    $addToSet: {
                        value: "$_id.refferal",

                        val: "$count"
                    }
                },

                countryWise: { $first: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                countryWiseByHospital: { $first: "$countryWiseByHospital" },
                treatmentWiseByHospital: { $first: "$treatmentWiseByHospital" },
                hospitalWiseByHospital: { $first: "$hospitalWiseByHospital" },
                refferalWiseVil: { $first: "$refferalWiseVil" },
                refferalWiseConf: { $first: "$refferalWiseConf" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $project: {
                refferalWiseVil: {
                    $filter: {
                        input: "$refferalWiseVil",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                refferalWiseConf: {
                    $filter: {
                        input: "$refferalWiseConf",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                refferalWiseQuery: 1,
                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                countryWiseByHospital: 1,
                treatmentWiseByHospital: 1,
                hospitalWiseByHospital: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                refferalWiseByHospital: {
                    $map: {
                        input: "$refferalWiseQuery",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$refferalWiseVil",
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

                refferalWiseConf: 1,
                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                countryWiseByHospital: 1,
                treatmentWiseByHospital: 1,
                hospitalWiseByHospital: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $project: {
                refferalWiseByHospital: {
                    $map: {
                        input: "$refferalWiseByHospital",
                        as: "one",
                        in: {
                            $mergeObjects: [
                                "$$one",
                                {
                                    $arrayElemAt: [{
                                            $filter: {
                                                input: "$refferalWiseConf",
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

                countryWise: 1,
                treatmentWise: 1,
                hospitalWise: 1,
                countryWiseByHospital: 1,
                treatmentWiseByHospital: 1,
                hospitalWiseByHospital: 1,
                refferalWise: 1,
                hospitalGroupCms: 1,

            }
        }, {
            $addFields: {
                countryWise: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$countryWise.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$countryWise",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$countryWise",

                    }
                },
                treatmentWise: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$treatmentWise.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$treatmentWise",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$treatmentWise",

                    }
                },
                hospitalWise: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$hospitalWise.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$hospitalWise",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$hospitalWise",

                    }
                },
                refferalWise: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$refferalWise.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$refferalWise",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$refferalWise",

                    }
                },
                countryWiseByHospital: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$countryWiseByHospital.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$countryWiseByHospital",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$countryWiseByHospital",

                    }
                },
                treatmentWiseByHospital: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$treatmentWiseByHospital.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$treatmentWiseByHospital",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$treatmentWiseByHospital",

                    }
                },
                hospitalWiseByHospital: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$hospitalWiseByHospital.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$hospitalWiseByHospital",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$hospitalWiseByHospital",

                    }
                },
                refferalWiseByHospital: {
                    $cond: {
                        if: {
                            $eq: [{ $arrayElemAt: ["$refferalWiseByHospital.value", 0] }, "NIL"]
                        },
                        then: {
                            $map: {
                                input: "$refferalWiseByHospital",
                                as: "r",
                                in: { "value": "NIL", val: 0 }

                            }
                        },
                        else: "$refferalWiseByHospital",

                    }
                },
            }
        }, {
            $addFields: {
                countryWise: {
                    $concatArrays: [
                        "$countryWise",
                        "$countryWiseByHospital",


                    ]

                },
            }
        }, {
            $addFields: {
                treatmentWise: {
                    $concatArrays: [
                        "$treatmentWise",
                        "$treatmentWiseByHospital",


                    ]

                },
            }
        }, {
            $addFields: {
                hospitalWise: {
                    $concatArrays: [
                        "$hospitalWise",
                        "$hospitalWiseByHospital",


                    ]

                },
            }
        }, {
            $addFields: {
                refferalWise: {
                    $concatArrays: [
                        "$refferalWise",
                        "$refferalWiseByHospital",


                    ]

                },
            }
        }, {
            $project: {
                countryWise: {
                    $filter: {
                        input: "$countryWise",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                treatmentWise: {
                    $filter: {
                        input: "$treatmentWise",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                hospitalWise: {
                    $filter: {
                        input: "$hospitalWise",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                refferalWise: {
                    $filter: {
                        input: "$refferalWise",
                        as: "item",
                        cond: {
                            $ne: ["$$item.value", "NIL"]
                        }
                    }
                },
                hospitalGroupCms: 1,

            }
        },

        {
            $unwind: "$countryWise"
        }, {
            $group: {
                _id: "$_id",

                countryWise: { $push: "$countryWise" },
                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$countryWise"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    country: "$countryWise.value",

                },

                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                val: {
                    $sum: "$countryWise.val"
                },
                vil: {
                    $sum: "$countryWise.vil"
                },
                conf: {
                    $sum: "$countryWise.conf"
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                countryWise: {
                    $addToSet: {
                        value: "$_id.country",

                        val: "$val",
                        vil: "$vil",
                        conf: "$conf"

                    }
                },


                treatmentWise: { $first: "$treatmentWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$treatmentWise"
        }, {
            $group: {
                _id: "$_id",

                treatmentWise: { $push: "$treatmentWise" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$treatmentWise"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    treatment: "$treatmentWise.value",

                },

                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                val: {
                    $sum: "$treatmentWise.val"
                },
                vil: {
                    $sum: "$treatmentWise.vil"
                },
                conf: {
                    $sum: "$treatmentWise.conf"
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                treatmentWise: {
                    $addToSet: {
                        value: "$_id.treatment",

                        val: "$val",
                        vil: "$vil",
                        conf: "$conf"

                    }
                },

                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$hospitalWise"
        }, {
            $group: {
                _id: "$_id",
                hospitalWise: { $push: "$hospitalWise" },

                treatmentWise: { $first: "$treatmentWise" },
                countryWise: { $first: "$countryWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$hospitalWise"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    hospital: "$hospitalWise.value",

                },

                treatmentWise: { $first: "$treatmentWise" },
                countryWise: { $first: "$countryWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                val: {
                    $sum: "$hospitalWise.val"
                },
                vil: {
                    $sum: "$hospitalWise.vil"
                },
                conf: {
                    $sum: "$hospitalWise.conf"
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                hospitalWise: {
                    $addToSet: {
                        value: "$_id.hospital",

                        val: "$val",
                        vil: "$vil",
                        conf: "$conf"

                    }
                },

                treatmentWise: { $first: "$treatmentWise" },
                countryWise: { $first: "$countryWise" },
                refferalWise: { $first: "$refferalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        }, {
            $unwind: "$refferalWise"
        }, {
            $group: {
                _id: "$_id",
                refferalWise: { $push: "$refferalWise" },

                treatmentWise: { $first: "$treatmentWise" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },



            }
        }, {
            $unwind: "$refferalWise"
        },

        {
            $group: {
                _id: {
                    name: "$_id",
                    refferal: "$refferalWise.value",

                },

                treatmentWise: { $first: "$treatmentWise" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

                val: {
                    $sum: "$refferalWise.val"
                },
                vil: {
                    $sum: "$refferalWise.vil"
                },
                conf: {
                    $sum: "$refferalWise.conf"
                },
            }
        }, {
            $group: {
                _id: "$_id.name",
                refferalWise: {
                    $addToSet: {
                        value: "$_id.refferal",

                        val: "$val",
                        vil: "$vil",
                        conf: "$conf"

                    }
                },

                treatmentWise: { $first: "$treatmentWise" },
                countryWise: { $first: "$countryWise" },
                hospitalWise: { $first: "$hospitalWise" },
                hospitalGroupCms: { $first: "$hospitalGroupCms" },

            }
        },

        {
            $project: {
                treatmentWise: 1,
                countryWise: 1,
                hospitalWise: 1,
                refferalWise: 1,

            }
        }, {
            $addFields: {
                countryQueryTotal: {
                    $sum: "$countryWise.val"

                },
                countryVilTotal: {
                    $sum: "$countryWise.vil"

                },
                countryConfTotal: {
                    $sum: "$countryWise.conf"

                },
                treatmentQueryTotal: {
                    $sum: "$treatmentWise.val"

                },
                treatmentVilTotal: {
                    $sum: "$treatmentWise.vil"

                },
                treatmentConfTotal: {
                    $sum: "$treatmentWise.conf"

                },

                hospitalQueryTotal: {
                    $sum: "$hospitalWise.val"

                },
                hospitalVilTotal: {
                    $sum: "$hospitalWise.vil"

                },
                hospitalConfTotal: {
                    $sum: "$hospitalWise.conf"

                },
                refferalQueryTotal: {
                    $sum: "$refferalWise.val"

                },
                refferalVilTotal: {
                    $sum: "$refferalWise.vil"

                },
                refferalConfTotal: {
                    $sum: "$refferalWise.conf"

                },
                range: "monthlyData"

            }
        },
    ]
    return dataPipe

}

module.exports = { monthlyData }