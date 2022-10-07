const Dispute = require('./model')
const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
const Request = require('../../app/opinion-request/request.model')
const Group = require('../hospital-groups/group.model')
var aws = require('aws-sdk')
var stringSimilarity = require("string-similarity");
var Patient = require("../../app/patient/patient.model");

const tesseract = require("node-tesseract-ocr")
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});



exports.postDisputeManagement = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const dispute = new Dispute();
        dispute.level = req.body.level;
        dispute.zone = req.body.zone

        const user = await Hospital.findById(userid)

        dispute.hospital = user._id
        await dispute.save()
        user.hospitalDisputeManagement.push(dispute)
        await user.save()
        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}
exports.getDisputeManagment = async(req, res, next) => {
    try {
        const { userid } = req.params;
        console.log('Hi')
        const user = await Hospital.findById(userid).populate('hospitalDisputeManagement')
        res.send(user.hospitalDisputeManagement)
    } catch (err) {
        next(err);
    }

}

exports.putDisputeManagement = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var dispute = {
        level: req.body.level,
        zone: req.body.zone
    }
    Dispute.findByIdAndUpdate(req.params.id, { $set: dispute }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in update the documents' });
        }
    });

}
exports.getPatientRequestQryMngmtByGroup = async(req, res, next) => {
    try {
        const { hospitalgroup } = req.params;
        const { patientid } = req.params;


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


        var pipeline1 = [{
                $match: {
                    "hospitalid": {
                        $in: doc[0].hospitalid
                    }
                }
            },

            {
                $group: {
                    _id: {

                        patientId: "$patient",
                        userId: "$user"

                    },
                    count: {
                        $sum: 1
                    },
                    data: {
                        $push: {
                            hospitalname: "$hospitalname",
                            hospitalid: "$hospitalid",
                            // patient: "$patient",
                            // linkstatus: "$linkstatus",
                            // doctors: "$doctors",
                            // hospitalcity: "$hospitalcity",
                            // accreditations: "$accreditations",
                            // email: "$email",
                            // _id: "$_id",
                            // hospitalopinions: "$hospitalopinions",
                            // receives: "$receives",
                            // doctoropinions: "$doctoropinions",
                            // hospitalreviewed: "$hospitalreviewed",
                            // user: "$user"
                        }

                    }
                },
            },
            {
                $lookup: {
                    from: 'patient',
                    "let": { "id": "$_id.patientId" },

                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$_id", "$$id"] } } },
                        { "$project": { name: 1, gender: 1, mhid: 1, companyname: 1, treatment: 1, uhidcode: 1, age: 1, ageduration: 1, patientProfile: 1, medicalhistory: 1, country: 1, createdAt: 1 } }
                    ],

                    as: 'patient',

                }
            },
            {
                "$project": {
                    _id: 1,
                    data: 1,
                    patient: { $arrayElemAt: ["$patient", 0] },

                }
            },
            {
                $project: {
                    _id: 1,
                    data: 1,
                    patient: 1,
                    patientSearch: {
                        $concat: ["$patient.name", " - ", "$patient.treatment", " - ", "$patient.country", " - ", "$patient.age"]

                    }

                }

            }

        ]

        data = await Request.aggregate(pipeline1)
            // res.send(data)
        dataSearch = await Patient.findOne({ "_id": patientid })
        console.log('differentPatient', dataSearch.differentPatient)
        search = `${dataSearch.name} - ${dataSearch.treatment} - ${dataSearch.country} - ${dataSearch.age}`
        const user = await Hospital.findOne({ "name._id": hospitalgroup }).populate('hospitalDisputeManagement')
        if (dataSearch.differentPatient == false) {

            if (user.hospitalDisputeManagement[0].level == 'Group Level') {
                for (let i = 0; i < data.length; i++) {
                    if (JSON.stringify(dataSearch._id) != JSON.stringify(data[i]._id.patientId) && JSON.stringify(dataSearch.user) != JSON.stringify(data[i]._id.userId)) {
                        checkDate = data[i].patient.createdAt

                        if (dataSearch.createdAt.getTime() > checkDate) {
                            //date 1 is newer

                            match = stringSimilarity.compareTwoStrings(
                                data[i].patientSearch, search) * 100

                            if (match > 60) {
                                res.send({ message: 'Patient Matched', patient: data[i], percentage: match.toFixed(2), })
                                break
                            }
                        }
                        // console.log(match)
                    }

                }
            }
        }

        // res.send(user.hospitalDisputeManagement)

    } catch (err) {
        next(err)
    }

}
exports.putPatientDispute = (req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        var patient = {
            differentPatient: true,

        };
        Patient.findByIdAndUpdate(req.params.id, { $set: patient }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in update the documents' }); }
        });
    }
    // var getParams = {
    //     Bucket: process.env.BUCKETNAME, // your bucket name,
    //     Key: '2021-07-22T06-52-57.156Z2021-06-16T05-36-05.339ZShirin akter.pdf' // path to the object you're looking for
    // }

// s3.getObject(getParams, async function(err, data) {
//     // Handle any error and exit
//     if (err)
//         return err;

//     // No error happened
//     // Convert Body from a Buffer to a String

//     let objectData = data; // Use the encoding necessary
//     const pdf = require('pdf-parse');
//     // pdf(objectData.Body).then(function(data) {

//     //     // number of pages


//     //     console.log(data.text);

//     // });
//     var Tesseract = require('tesseract.js');

//     Tesseract.recognize(
//         'https://operationfile.s3.ap-south-1.amazonaws.com/2021-06-02T05-06-20.924Z02.jpeg',
//         'eng', { logger: m => console.log(m) }
//     ).then(({ data: { text } }) => {
//         console.log(text);
//     })
// });