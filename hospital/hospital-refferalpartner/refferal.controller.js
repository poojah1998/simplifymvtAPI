const Refferal = require('./refferal.model')
const Counter = require('../../app/patient/counter.model')
const Group = require('../hospital-groups/group.model')
const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
var express = require('express')
const jwt_decode = require('jwt-decode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const Facilitator = require('../../app/facilitator-register/facilitator.model')
const HospitalCms = require('../../app/patient/cms.hospital.model')
var generator = require('generate-password');
var facPatient = require('../../app/patient/patient.model');

sendEmail = require('../sendmail/sendmail')
const Zoho = require('../../app/zoho-subscription/model');
const axios = require('axios');
exports.postRefferalPartner = (req, res, next) => {
    var password = generator.generate({
        length: 10,
        numbers: true
    });
    bcrypt.hash(password, 10, async(err, hash) => {
        try {

            if (err) {
                res.stauts(500).send({
                    message: err.message
                })
            } else {

                const { userid } = req.params;
                const refferal = new Refferal();
                refferal.name = req.body.name;
                refferal.country = req.body.country;
                refferal.role = req.body.role;

                refferal.password = hash;
                refferal.contact = req.body.contact;
                refferal.emailid = req.body.emailid;
                refferal.partnercategory = req.body.partnercategory;
                refferal.target = req.body.target;
                refferal.refferalfees = req.body.refferalfees;
                refferal.feescategory = req.body.feescategory;
                refferal.associatedHospital = req.body.associatedHospital;
                refferal.hospitalVisiblity = req.body.hospitalVisiblity
                const user = await Hospital.findById(userid)

                refferal.hospital = user._id
                await refferal.save()
                user.hospitalrefferalpartners.push(refferal)
                await user.save()
                sendEmail.refferalLogin(refferal, password)

                res.status(201).send({ message: "success" })

            }
        } catch (err) {
            next(err);
        }
    });


}
exports.getRefferalPartner = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Hospital.findById(userid).populate({
            path: 'hospitalrefferalpartners',
            populate: {
                path: 'hospitalVisiblity',
                model: HospitalCms,
                select: 'name'
            }
        })
        res.send(user.hospitalrefferalpartners)
    } catch (err) {
        next(err);
    }

}
exports.putResetPassword = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);
    console.log(req.body)
    Refferal.findById(req.params.id, (err, doc) => {
        if (err) {
            res.status(402).send({ message: err.message })
        } else {
            if (!doc) {
                res.status(402).send({ message: 'No user found' })
            } else {
                bcrypt.compare(req.body.confirmpassword, doc.password, (err, result) => {
                    if (err) {
                        return res.status(400).send({ message: "Auth Failed" })

                    }
                    if (result) {
                        bcrypt.hash(req.body.newpassword, 10, (err, hash) => {
                            var refferal = {

                                password: hash,

                            };
                            Refferal.findByIdAndUpdate(req.params.id, { $set: refferal }, { new: true }, (err, doc) => {
                                if (!err) {
                                    res.send({ message: 'success' });
                                } else { return res.status(400).send({ message: 'error in update the documents' }); }
                            });
                        })
                    } else {
                        res.status(400).send({ message: "Invalid Password" })

                    }

                })

            }

        }
    });

}

exports.delRefferalPartner = async(req, res, next) => {
    try {
        var refid = req.params.id
        var userid = req.params.userid;

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
        refferaldoc = await Refferal.findByIdAndRemove(req.params.id);
        await Hospital.update({ _id: userid }, { $pull: { hospitalrefferalpartners: refid } });
        res.send(refferaldoc);

    } catch (err) {
        next(err);
    }

}
exports.getRefferalById = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Refferal.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

}

exports.putRefferalPartner = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.stauts(500).send({
                message: err.message
            })
        } else {
            var refferal = {
                name: req.body.name,
                country: req.body.country,
                contact: req.body.contact,
                emailid: req.body.emailid,
                partnercategory: req.body.partnercategory,
                target: req.body.target,
                refferalfees: req.body.refferalfees,
                feescategory: req.body.feescategory,
                hospitalVisiblity: req.body.hospitalVisiblity,
                password: hash
            };
            var passcheck = await Refferal.findOne({ _id: req.body._id })

            if (passcheck.password == req.body.password) {
                refferal.password = req.body.password
            }

            Refferal.findByIdAndUpdate(req.params.id, { $set: refferal }, { new: true }, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else { return res.status(400).send({ message: 'error in update the documents' }); }
            });

        }
    })

}
module.exports.loginPartner = async(req, res, next) => {
    let userData = req.body;
    Refferal.findOne({ emailid: userData.email }, async(error, user) => {
            if (error) {
                console.log(error)
            } else {
                if (!user) {
                    res.status(401).send({ message: 'Invalid Email' })

                } else {
                    bcrypt.compare(req.body.password, user.password, async(err, result) => {

                        if (err) {
                            return res.status(400).send({ message: "Auth Failed" })

                        }
                        if (result) {
                            hospital = await Hospital.findById(user.hospital)
                            let payload = { id: user.hospital, refferalid: user._id, name: user.name, partnerName: user.name, hospitalid: hospital.name._id, email: user.emailid, Role: user.role }
                            let token = jwt.sign(payload, process.env.KEY)
                            res.status(200).send({ token })
                        } else {
                            res.status(400).send({ message: "Invalid Password" })

                        }
                    })
                }


            }
        })
        // Hospital Plan Route


}
exports.getFacilitator = async(req, res) => {

    Facilitator.find({}, { name: 1, mobile: 1, email: 1, companydetail: 1 }).populate('companydetails', 'name')
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
exports.getFacilitatorByGroup = async(req, res, next) => {
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
        hospitalId = doc[0].hospitalid

        var pipeline1 = [{
                $project: {
                    requests: 1,
                    preintimations: 1,
                    opdrequests: 1,
                    pirequests: 1,
                    requestvils: 1,
                    confirmations: 1,

                    user: 1,
                    _id: 0

                }
            },
            {
                $lookup: {
                    from: 'request',
                    "let": { "id": hospitalId },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                        { "$project": { hospitalid: 1, _id: 0 } }
                    ],

                    as: 'requests',

                }
            },

            {
                $lookup: {
                    from: 'preintimation',
                    "let": { "id": hospitalId },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                        { "$project": { hospitalid: 1, _id: 0 } }
                    ],
                    as: 'preintimations'
                }
            },
            {
                $lookup: {
                    from: 'opdrequest',
                    "let": { "id": hospitalId },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                        { "$project": { hospitalid: 1, _id: 0 } }
                    ],
                    as: 'opdrequests'
                }
            },

            {
                $lookup: {
                    from: 'pirequest',
                    "let": { "id": hospitalId },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                        { "$project": { hospitalid: 1, _id: 0 } }
                    ],
                    as: 'pirequests'
                }
            },

            {
                $lookup: {
                    from: 'requestvil',
                    "let": { "id": hospitalId },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                        { "$project": { hospitalid: 1, _id: 0 } }
                    ],
                    as: 'requestvils'
                }
            },

            {
                $lookup: {
                    from: 'confirmation',
                    "let": { "id": hospitalId },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                        { "$project": { hospitalid: 1, _id: 0 } }
                    ],
                    as: 'confirmations'
                }
            },
            {
                $lookup: {
                    from: 'adminSchema',
                    "let": { "id": "$user" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, email: 1, mobile: 1, companydetails: 1, _id: 0 } }
                    ],
                    as: 'user'
                }
            },
            {
                $match: {
                    $or: [{
                            "requests.0": { $exists: true },
                        },
                        {
                            "preintimations.0": { $exists: true },
                        },
                        {
                            "opdrequests.0": { $exists: true },
                        },
                        {
                            "pirequests.0": { $exists: true },
                        },
                        {
                            "requestvils.0": { $exists: true },
                        },
                        {
                            "confirmations.0": { $exists: true },
                        },
                    ]
                }


            },
            {
                $project: {


                    user: 1

                }
            },
            {
                $unwind: "$user"
            },
            {
                $addFields: {
                    "name": "$user.name",
                    "email": "$user.email",
                    "mobile": "$user.mobile",

                    "companydetails": "$user.companydetails",
                }
            },
            {
                $project: {


                    user: 0

                }
            },

            {
                $lookup: {
                    from: 'companydetail',
                    "let": { "id": "$companydetails" },

                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                        { "$project": { name: 1 } }
                    ],
                    as: 'companydetails'
                }
            },
            {
                $unwind: "$companydetails"
            },
            {
                $group: {
                    _id: "$companydetails._id",
                    "name": { $first: "$name" },
                    "email": { $last: "$email" },
                    "mobile": { $last: "$mobile" },

                    companydetails: {
                        $push: {
                            name: "$companydetails.name"

                        }
                    }


                }
            }
        ]

        data = await facPatient.aggregate(pipeline1)
        res.send(data)
    } catch (err) {
        next(err)
    }
}
exports.getFacilitatorByUnit = async(req, res, next) => {
        try {
            hospitalId = []
            hospitalId.push(req.params.hospitalid)
            var pipeline1 = [{
                    $project: {
                        requests: 1,
                        preintimations: 1,
                        opdrequests: 1,
                        pirequests: 1,
                        requestvils: 1,
                        confirmations: 1,

                        user: 1,
                        _id: 0

                    }
                },
                {
                    $lookup: {
                        from: 'request',
                        "let": { "id": hospitalId },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                            { "$project": { hospitalid: 1, _id: 0 } }
                        ],

                        as: 'requests',

                    }
                },

                {
                    $lookup: {
                        from: 'preintimation',
                        "let": { "id": hospitalId },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                            { "$project": { hospitalid: 1, _id: 0 } }
                        ],
                        as: 'preintimations'
                    }
                },
                {
                    $lookup: {
                        from: 'opdrequest',
                        "let": { "id": hospitalId },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                            { "$project": { hospitalid: 1, _id: 0 } }
                        ],
                        as: 'opdrequests'
                    }
                },

                {
                    $lookup: {
                        from: 'pirequest',
                        "let": { "id": hospitalId },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                            { "$project": { hospitalid: 1, _id: 0 } }
                        ],
                        as: 'pirequests'
                    }
                },

                {
                    $lookup: {
                        from: 'requestvil',
                        "let": { "id": hospitalId },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                            { "$project": { hospitalid: 1, _id: 0 } }
                        ],
                        as: 'requestvils'
                    }
                },

                {
                    $lookup: {
                        from: 'confirmation',
                        "let": { "id": hospitalId },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$hospitalid", "$$id"] } } },
                            { "$project": { hospitalid: 1, _id: 0 } }
                        ],
                        as: 'confirmations'
                    }
                },
                {
                    $lookup: {
                        from: 'adminSchema',
                        "let": { "id": "$user" },

                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                            { "$project": { name: 1, email: 1, mobile: 1, companydetails: 1, _id: 0 } }
                        ],
                        as: 'user'
                    }
                },
                {
                    $match: {
                        $or: [{
                                "requests.0": { $exists: true },
                            },
                            {
                                "preintimations.0": { $exists: true },
                            },
                            {
                                "opdrequests.0": { $exists: true },
                            },
                            {
                                "pirequests.0": { $exists: true },
                            },
                            {
                                "requestvils.0": { $exists: true },
                            },
                            {
                                "confirmations.0": { $exists: true },
                            },
                        ]
                    }


                },
                {
                    $project: {


                        user: 1

                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $addFields: {
                        "name": "$user.name",
                        "email": "$user.email",
                        "mobile": "$user.mobile",

                        "companydetails": "$user.companydetails",
                    }
                },
                {
                    $project: {


                        user: 0

                    }
                },

                {
                    $lookup: {
                        from: 'companydetail',
                        "let": { "id": "$companydetails" },

                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$id"] } } },
                            { "$project": { name: 1 } }
                        ],
                        as: 'companydetails'
                    }
                },
                {
                    $unwind: "$companydetails"
                },
                {
                    $group: {
                        _id: "$companydetails._id",
                        "name": { $first: "$name" },
                        "email": { $last: "$email" },
                        "mobile": { $last: "$mobile" },

                        companydetails: {
                            $push: {
                                name: "$companydetails.name"

                            }
                        }


                    }
                }
            ]

            data = await facPatient.aggregate(pipeline1)
            res.send(data)
        } catch (err) {
            next(err)
        }
    }
    // Hospital Plan Route

exports.plan = async(req, res, next) => {
    try {
        async function validate(user) {
            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                    refferal = await Refferal.find({
                        hospital: user._id
                    })
                    customFields = plan.data.plan.custom_fields
                    let date = new Date(subscription.data.subscription.next_billing_at);
                    let currentDate = new Date();
                    daysleft = Math.ceil((date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24);
                    console.log('daysleft', daysleft)
                    if (daysleft > 0) {
                        if (refferal.length < Number(customFields[2].value)) {
                            return next()

                        } else {
                            return res.status(400).send({ message: 'Limit Exceeded' })
                        }

                    } else {
                        return res.status(400).send({ message: 'Renew your plan' })

                    }

                } else {
                    return res.status(400).send({ message: 'Please take subscription' })
                }
            } else {
                return next()


            }
        }

        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        user = await Hospital.findOne({ _id: decoded.id })
        return validate(user)
    } catch (err) {
        next(err)
    }
}

exports.getRefferalByLimit = async(req, res, next) => {
    try {
        var id = req.params.id;
        user = await Hospital.findOne({ _id: id })

        if (user.subscription_id) {
            const tokenData = await Zoho.find({})
            const token = tokenData[tokenData.length - 1].data.access_token
            const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
            const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
            refferal = await Refferal.find({
                hospital: user._id

            })
            res.send({
                refferal: refferal,
                subscription: subscription.data.subscription,
                plan: plan.data.plan
            });

        } else {
            return res.status(400).send({ message: 'Please take subscription' })

        }


    } catch (err) {
        next(err)
    }

}