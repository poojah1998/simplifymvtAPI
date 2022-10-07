const Profile = require('./profile.model')
const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
var aws = require('aws-sdk')
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

module.exports.upload = (upload.single('documentSignature')), (request, response, next) => {
    next();
}
exports.postProfile = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const profile = new Profile();
        profile.designation = req.body.designation;
        if (req.file !== undefined) {
            profile.documentSignature = req.file;

        }
        profile.hospital = userid
        await profile.save()
        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}
exports.getProfile = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Profile.find({ "hospital": userid })

        res.send(user)
    } catch (err) {
        next(err);
    }

}

exports.putProfile = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    const profile = new Profile();
    if (req.file !== undefined) {

        profile.documentSignature = req.file;

        var profileUpdate = {
            designation: req.body.designation,
            documentSignature: profile.documentSignature

        };
    } else if (req.file == undefined) {
        var profileUpdate = {
            designation: req.body.designation,
        };
    }

    Profile.findByIdAndUpdate(req.params.id, { $set: profileUpdate }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in update the documents' });
        }
    });

}