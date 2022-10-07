const Doctor = require('./doctor.model')
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const { ObjectId } = require('mongodb');
var aws = require('aws-sdk')
const Doctorcms = require('../patient/cms.doctor.model')
const Doctorimg = require('../patient/cms.doctorimg.model')
const Company = require('../company-details/company.model')
const sendEmail = require('../send-email/sendemail')
const removeMd = require('remove-markdown');
const HospitalDetails = require('../../hospital/hospital-details/details.model')
const HospitalCms = require('../patient/cms.hospital.model')
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
const jwt_decode = require('jwt-decode');

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {

        cb(null, 'images')
    } else if (file.mimetype === 'application/pdf') {
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
        key: function(req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
        }
    }),
    fileFilter: fileFilter

})


module.exports.upload = (upload.single('profile')), (request, response, next) => {
    next();
}
exports.postDoctor = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const doctor = new Doctor();
        doctor.name = req.body.name;
        doctor.department = req.body.department;
        doctor.associatedhospital = req.body.associatedhospital;
        doctor.degree = req.body.degree;
        doctor.expirence = req.body.expirence;
        if (req.file !== undefined) {
            doctor.profile = req.file;

        }
        const user = await Facilitator.findById(userid)

        doctor.user = user
        await doctor.save()

        user.doctors.push(doctor)
        await user.save()
        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getDoctorid = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate({
            path: 'doctors',
            populate: {
                path: 'associatedhospital'
            }
        })

        res.send(user.doctors)
    } catch (err) {
        next(err);
    }


}
exports.delDoctorid = async(req, res, next) => {
    try {
        var userid = req.params.userid;
        var doccid = req.params.id

        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        doctordoc = await Doctor.findByIdAndRemove(req.params.id);
        res.send(doctordoc);
        await Facilitator.update({ _id: userid }, { $pull: { doctors: doccid } });
    } catch (err) {
        next(err);
    }



}

exports.putDoctor = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    const doctor = new Doctor();
    if (req.file !== undefined) {
        var id = req.params.id;
        zoneQuery = { "_id": id };
        Doctor.find(zoneQuery)
            .then(data => {

                if (data) {
                    const s3 = new aws.S3({
                        accessKeyId: process.env.ACCESSKEYID,
                        secretAccessKey: process.env.SECERETACCESSKEY,
                        region: process.env.REGION,
                    });

                    const params = {
                        Bucket: process.env.BUCKETNAME,
                        Key: data[0].profile['key']
                    };

                    s3.deleteObject(params, (error, data) => {
                        if (error) {
                            console.log(error)
                        }
                        console.log("success")
                    });
                } else {
                    console.log("Data not found");
                }
                // res.send(data);
            })
        doctor.profile = req.file;

        var doctorr = {
            name: req.body.name,
            department: req.body.department,
            associatedhospital: req.body.associatedhospital,
            degree: req.body.degree,
            expirence: req.body.expirence,
            profile: doctor.profile

        };
        Doctor.findByIdAndUpdate(req.params.id, { $set: doctorr }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                return res.status(400).send({ message: 'error in update the documents' });
            }
        });

    } else if (req.file == undefined) {
        var doctorr = {
            name: req.body.name,
            department: req.body.department,
            associatedhospital: req.body.associatedhospital,
            degree: req.body.degree,
            expirence: req.body.expirence,

        };
        Doctor.findByIdAndUpdate(req.params.id, { $set: doctorr }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                return res.status(400).send({ message: 'error in update the documents' });
            }
        });

    }


}
exports.getDoctorHospital = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;
    console.log(id)
    zoneQuery = { "associatedhospital": id, "user": userid };

    Doctor.find(zoneQuery).populate('associatedhospital')
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
exports.plan = async(req, res, next) => {
    try {
        async function validate(user) {
            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })

                    customFields = plan.data.plan.custom_fields
                    let date = new Date(subscription.data.subscription.next_billing_at);
                    let currentDate = new Date();
                    daysleft = Math.ceil((date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24);
                    console.log('daysleft', daysleft)
                    if (daysleft > 0) {
                        if (customFields[6].value == 'true') {
                            return next()

                        } else {
                            return res.status(400).send({ message: 'Upgrade your plan' })
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
        if (!req.headers.authorization) {
            return next()

        }
        let token = req.headers.authorization.split(' ')[1]

        if (token === 'null') {
            user = await Facilitator.findOne({ _id: req.params.userid })
            return validate(user)
        }
        var decoded = jwt_decode(token);
        user = await Facilitator.findOne({ _id: decoded.id })
        return validate(user)
    } catch (err) {
        next(err)
    }
}


exports.downloadDoctorProfile = async(req, res, next) => {
    try {
        doctorprofile = []
        var companydetails = await Company.find({ "user": req.params.userid })

        var company = companydetails[0]

        var doctorid = await Doctorcms.findById(req.params.doctorid).populate({
            path: 'hospitals',
            model: HospitalCms,
            select: 'name'
        })
        console.log('doctorid', doctorid)
        if (doctorid != null) {
            doctorid = JSON.parse(JSON.stringify(doctorid))
            zoneQuery = {
                "related.ref": ObjectId(req.params.doctorid),
                "related.field": 'image'
            };

            var doctorimage = await Doctorimg.findOne(zoneQuery)
            doctorimage = JSON.parse(JSON.stringify(doctorimage))


            doctorprofile.push({
                doctorname: doctorid['name'],
                hospitalname: doctorid.hospitals[0].name,
                designation: doctorid['designation'],
                qualification: doctorid['qualification'],
                expertise: removeMd(doctorid['expertise']),
                serviceoffered: removeMd(doctorid['serviceoffered']),
                experience: removeMd(doctorid['experience']),
                image: doctorimage['url'],
                companyname: company.name,
                address: company.address,
                companyemail: company.companyemail,
                logo: company.logosize1,
                source: 'prehospital'

            })
        }
        sendEmail.downloadDoctorProfile(doctorprofile, res)

    } catch (err) {
        next(err)
    }
}

exports.downloadDoctorProfileByHospital = async(req, res, next) => {
    try {

        hospitalid = req.params.hospitalid
        const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
        var doctorProfile = []
        var doctorId = await Doctorcms.findById(req.params.doctorid).populate({
            path: 'hospitals',
            model: HospitalCms,
            select: 'name'
        })
        if (doctorId != null) {
            doctorId = JSON.parse(JSON.stringify(doctorId))
            zoneQuery = {
                "related.ref": ObjectId(req.params.doctorid),
                "related.field": 'image'
            };

            var doctorImage = await Doctorimg.findOne(zoneQuery)
            doctorImage = JSON.parse(JSON.stringify(doctorImage))


            doctorProfile.push({
                doctorname: doctorId['name'],
                hospitalname: doctorId.hospitals[0].name,
                designation: doctorId['designation'],
                qualification: doctorId['qualification'],
                expertise: removeMd(doctorId['expertise']),
                serviceoffered: removeMd(doctorId['serviceoffered']),
                experience: removeMd(doctorId['experience']),
                image: doctorImage['url'],
                companyname: hospital.name,
                address: hospital.address,
                companyemail: hospital.companyemail,
                logo: hospital.logosize1,

            })


        }
        sendEmail.downloadDoctorProfile(doctorProfile, res)
    } catch (err) {
        next(err)
    }
}