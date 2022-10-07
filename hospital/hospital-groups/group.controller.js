const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
var aws = require('aws-sdk')
var express = require('express')
const axios = require('axios').default;
const jwt = require('jsonwebtoken')
const HospitalUserRole = require('../hospital-auth/userole.model')
const jwt_decode = require('jwt-decode');
const Country = require('./country.model');
const HospitalPartner = require('../hospital-refferalpartner/refferal.model')

const Group = require('./group.model')

var FormData = require('form-data');
var form = new FormData();

exports.getHospitalGroups = async (req, res) => {
    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);


    if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {

        userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
        const { hospitalgroup } = req.params;
        let objectIdArray = userRole.hospitalVisiblity.map(s => mongoose.Types.ObjectId(s));

        var pipeline = [{
            $match: {
                "_id": {
                    $in: objectIdArray
                },
            }
        },

        {

            "$lookup": {
                "from": "accreditation",
                "localField": "accreditations",
                "foreignField": "_id",
                "as": "accreditations",
            }
        },
        {
            "$lookup": {
                "from": "doctor",
                "localField": "_id",
                "foreignField": "hospitals",
                "as": "doctors",
            }
        },

        {
            "$lookup": {
                "from": "countries",
                "localField": "country",
                "foreignField": "_id",
                "as": "country",
            }
        },
        {
            "$lookup": {
                "from": "city",
                "localField": "city1",
                "foreignField": "_id",
                "as": "city1",
            }
        },


        ]
        Group.aggregate(pipeline, (err, doc) => {
            if (!err) {
                res.send(doc)
                console.log('doc', doc)

            } else {
                res.send(err)

            }

        })
    } else if (decoded.Role == 'Group Refferal Partner') {
        partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
        const { hospitalgroup } = req.params;
        let objectIdArray = partner.hospitalVisiblity.map(s => mongoose.Types.ObjectId(s));

        var pipeline = [{
            $match: {
                "_id": {
                    $in: objectIdArray
                },
            }
        },

        {

            "$lookup": {
                "from": "accreditation",
                "localField": "accreditations",
                "foreignField": "_id",
                "as": "accreditations",
            }
        },
        {
            "$lookup": {
                "from": "doctor",
                "localField": "_id",
                "foreignField": "hospitals",
                "as": "doctors",
            }
        },

        {
            "$lookup": {
                "from": "countries",
                "localField": "country",
                "foreignField": "_id",
                "as": "country",
            }
        },
        {
            "$lookup": {
                "from": "city",
                "localField": "city1",
                "foreignField": "_id",
                "as": "city1",
            }
        },


        ]
        Group.aggregate(pipeline, (err, doc) => {
            if (!err) {
                res.send(doc)
                console.log('doc', doc)

            } else {
                res.send(err)

            }

        })


    } else {
        const { hospitalgroup } = req.params;

        var pipeline = [{
            $match: {
                hospitalgroup: ObjectId(hospitalgroup),
            }
        },

        {

            "$lookup": {
                "from": "accreditation",
                "localField": "accreditations",
                "foreignField": "_id",
                "as": "accreditations",
            }
        },
        {
            "$lookup": {
                "from": "doctor",
                "localField": "_id",
                "foreignField": "hospitals",
                "as": "doctors",
            }
        },

        {
            "$lookup": {
                "from": "countries",
                "localField": "country",
                "foreignField": "_id",
                "as": "country",
            }
        },
        {
            "$lookup": {
                "from": "city",
                "localField": "city1",
                "foreignField": "_id",
                "as": "city1",
            }
        },


        ]
        Group.aggregate(pipeline, (err, doc) => {
            if (!err) {
                res.send(doc)

            } else {
                res.send(err)

            }

        })
    }


}
exports.getSingleHospital = (req, res) => {
    const { hospitalid } = req.params;
    var pipeline = [{
        $match: {
            _id: ObjectId(hospitalid),
        }
    },
    {
        "$lookup": {
            "from": "accreditation",
            "localField": "accreditations",
            "foreignField": "_id",
            "as": "accreditations",
        }
    },
    {
        "$lookup": {
            "from": "doctor",
            "localField": "_id",
            "foreignField": "hospitals",
            "as": "doctors",
        }
    },

    {
        "$lookup": {
            "from": "countries",
            "localField": "country",
            "foreignField": "_id",
            "as": "country",
        }
    },
    {
        "$lookup": {
            "from": "city",
            "localField": "city1",
            "foreignField": "_id",
            "as": "city1",
        }
    },

    ]
    Group.aggregate(pipeline, (err, doc) => {
        if (!err) {
            res.send(doc)
        } else {
            res.send(err)

        }

    })

}
exports.unitAdmin = async (req, res, next) => {
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
                        $toString: "$_id"

                    }

                }
            }
        }

        ]
        doc = await Group.aggregate(pipeline)
        console.log(doc)
        if (doc.length) {
            data = await Hospital.find({
                "name._id": {
                    $in: doc[0].hospitalid
                }
            })
            res.send(data)
        }

    } catch (err) {
        next(err)
    }

}
exports.putCmsHospital = async (req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        const token = await axios.post(`${process.env.CMSLOGIN}`, {
            identifier: process.env.CMSID,
            password: process.env.CMSPASS,
        });
        jwttoken = token.data.jwt
        body = {
            name: req.body.name,
            accreditations: req.body.accreditations,
            doctors: req.body.doctors,
            beds: req.body.beds,
            established: req.body.established,
            speciality: req.body.speciality,
            awards: req.body.awards,
            infrastructure: req.body.infrastructure,
            distance: req.body.distance,
            address: req.body.address,
            "money-matters": req.body['moneymatters'],
            "food-dining": req.body['fooddining'],
            language: req.body.language,
            transportation: req.body.transportation,
            description: req.body.description,



        }

        const { data } = await axios.put(`${process.env.CMSHOSPITAL}${req.params.id}`, body, {
            headers: {
                Authorization: `Bearer ${jwttoken}`,
            },
        });
        res.send(data)

    } catch (err) {
        next(err);
    }
}
exports.putCmsDoctor = async (req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        const token = await axios.post(`${process.env.CMSLOGIN}`, {
            identifier: process.env.CMSID,
            password: process.env.CMSPASS,
        });
        jwttoken = token.data.jwt
        body = {
            name: req.body.name,
            designation: req.body.designation,
            qualification: req.body.qualification,
            expertise: req.body.expertise,
            serviceoffered: req.body.serviceoffered,
            experience: req.body.experience,
            experience_year: req.body.experience_year,
            highlights: req.body.highlights,
            treatments: req.body.treatments,
            hospitals: req.body.hospitals,
            languages: req.body.languages,
            departments: req.body.departments,


        }

        const { data } = await axios.put(`${process.env.CMSDOCTOR}${req.params.id}`, body, {
            headers: {
                Authorization: `Bearer ${jwttoken}`,
            },
        });
        res.send(data)

    } catch (err) {
        next(err);
    }
}
exports.getCountry = async (req, res) => {
    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);

    userRole = await HospitalUserRole.findOne({ _id: decoded.userid })

    country = await Country.find({
        "name": {
            $in: userRole.country
        }
    })

    res.send(country)


}
exports.getFacAllHospitals = async (req, res) => {

    var pipeline = [

    {

        "$lookup": {
            "from": "accreditation",
            "localField": "accreditations",
            "foreignField": "_id",
            "as": "accreditations",
        }
    },
    {
        "$lookup": {
            "from": "doctor",
            "localField": "_id",
            "foreignField": "hospitals",
            "as": "doctors",
        }
    },
    {
        "$lookup": {
            "from": "upload_file",
            "localField": "doctors._id",
            "foreignField": "related.ref",
            "as": "doctorsImage",
        }
    },
    {
        "$lookup": {
            "from": "countries",
            "localField": "country",
            "foreignField": "_id",
            "as": "country",
        }
    },
    {
        "$lookup": {
            "from": "city",
            "localField": "city1",
            "foreignField": "_id",
            "as": "city1",
        }
    },
   
    {
        "$lookup": {
            "from": "upload_file",
            "localField": "_id",
            "foreignField": "related.ref",
            "as": "hospitalImage",
        }
    },

    ]
    Group.aggregate(pipeline, (err, doc) => {
        if (!err) {
            res.send(doc)
            console.log('doc', doc)

        } else {
            res.send(err)

        }

    })


}
exports.getAllHospitals = async (req, res) => {

    var pipeline = [

        {

            "$lookup": {
                "from": "accreditation",
                "localField": "accreditations",
                "foreignField": "_id",
                "as": "accreditations",
            }
        },
        {
            "$lookup": {
                "from": "doctor",
                "localField": "_id",
                "foreignField": "hospitals",
                "as": "doctors",
            }
        },

        {
            "$lookup": {
                "from": "countries",
                "localField": "country",
                "foreignField": "_id",
                "as": "country",
            }
        },
        {
            "$lookup": {
                "from": "city",
                "localField": "city1",
                "foreignField": "_id",
                "as": "city1",
            }
        },

        {

            "$group": {
                "_id": { $arrayElemAt: ["$city1.name", 0] },
                data: {
                    $push: {
                        accreditations: "$accreditations",
                        doctors: "$doctors",
                        country: "$country",
                        city: { $arrayElemAt: ["$city1.name", 0] },
                        _id: "$_id",
                        name: "$name"

                    },
                }
            }
        },

    ]
    Group.aggregate(pipeline, (err, doc) => {
        if (!err) {
            
            doc.sort(function(a, b){
                if(a._id < b._id) { return -1; }
                if(a._id > b._id) { return 1; }
                return 0;
            })
            res.send(doc)

        } else {
            res.send(err)

        }
    })


}
exports.getAllHospitalSupreme = async (req, res) => {

    var pipeline = [

        {

            "$lookup": {
                "from": "accreditation",
                "localField": "accreditations",
                "foreignField": "_id",
                "as": "accreditations",
            }
        },
        {
            "$lookup": {
                "from": "doctor",
                "localField": "_id",
                "foreignField": "hospitals",
                "as": "doctors",
            }
        },

        {
            "$lookup": {
                "from": "countries",
                "localField": "country",
                "foreignField": "_id",
                "as": "country",
            }
        },
        {
            "$lookup": {
                "from": "city",
                "localField": "city1",
                "foreignField": "_id",
                "as": "city1",
            }
        },


    ]
    Group.aggregate(pipeline, (err, doc) => {
        if (!err) {
            res.send(doc)

        } else {
            res.send(err)

        }

    })



}