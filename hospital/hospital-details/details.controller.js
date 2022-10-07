const Hospitaldetail = require('./details.model')
const Bank = require('./bank.model')

const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
var aws = require('aws-sdk')
var express = require('express')
var multer = require('multer')
var multerS3 = require('multer-s3')
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {

        cb(null, 'images')
    } else if (file.mimetype === 'application/pdf') {
        cb(null, 'files')
    } else {
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

module.exports.upload = (upload.fields([{
        name: 'gstnoimg',
        maxCount: 1
    },
    {
        name: 'registrationimg',
        maxCount: 1
    },
    {
        name: 'logosize1',
        maxCount: 1
    },
    {
        name: 'logosize2',
        maxCount: 1
    },
    {
        name: 'logosize3',
        maxCount: 1
    }
])), (request, response, next) => {
    next();
}


exports.postHospitalDetails = async(req, res, next) => {
    try {
        address = JSON.parse(req.body.address)
        const { userid } = req.params;
        const hospitaldetail = new Hospitaldetail();
        hospitaldetail.name = req.body.name;
        hospitaldetail.gstno = req.body.gstno;
        hospitaldetail.registration = req.body.registration;
        hospitaldetail.companyemail = req.body.companyemail;
        hospitaldetail.facebooklink = req.body.facebooklink;
        hospitaldetail.twitterlink = req.body.twitterlink;
        hospitaldetail.linkedinlink = req.body.linkedinlink;
        hospitaldetail.instagramlink = req.body.instagramlink;
        hospitaldetail.uhidcode = req.body.uhidcode;
        hospitaldetail.address = address;

        if (req.files['gstnoimg'] !== undefined) {
            let gstimg = req.files['gstnoimg']
            for (let i = 0; i < gstimg.length; i++) {
                hospitaldetail.gstnoimg = gstimg[i].key

            }

        }
        if (req.files['registrationimg'] !== undefined) {

            let registrationimage = req.files['registrationimg']
            for (let i = 0; i < registrationimage.length; i++) {
                hospitaldetail.registrationimg = registrationimage[i].key

            }
        }
        if (req.files['logosize1'] !== undefined) {

            let logosize1 = req.files['logosize1']
            for (let i = 0; i < logosize1.length; i++) {
                hospitaldetail.logosize1 = logosize1[i].key

            }
        }
        if (req.files['logosize2'] !== undefined) {

            let logosize2 = req.files['logosize2']
            for (let i = 0; i < logosize2.length; i++) {
                hospitaldetail.logosize2 = logosize2[i].key

            }
        }
        if (req.files['logosize3'] !== undefined) {

            let logosize3 = req.files['logosize3']
            for (let i = 0; i < logosize3.length; i++) {
                hospitaldetail.logosize3 = logosize3[i].key

            }
        }
        const user = await Hospital.findById(userid)

        hospitaldetail.hospital = user
        await hospitaldetail.save()

        user.hospitaldetails.push(hospitaldetail)
        await user.save()
        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getHospitalDetailsid = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Hospital.findById(userid).populate('hospitaldetails')

        res.send(user.hospitaldetails)
    } catch (err) {
        next(err);
    }

}
exports.delHospitalDetailsid = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


    Hospitaldetail.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'Error in delete the document' });
        }
    });


}

exports.putHospitalDetails = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    address = JSON.parse(req.body.address)

    const hospitaldetail = new Hospitaldetail();
    if (Object.keys(req.files).length) {
        // console.log("first")

        if (req.files['gstnoimg'] !== undefined) {
            let gstimg = req.files['gstnoimg']
            for (let i = 0; i < gstimg.length; i++) {
                hospitaldetail.gstnoimg = gstimg[i].key

            }
            var hospitaldetaill = {
                name: req.body.name,
                gstno: req.body.gstno,
                registration: req.body.registration,
                companyemail: req.body.companyemail,
                facebooklink: req.body.facebooklink,
                twitterlink: req.body.twitterlink,
                linkedinlink: req.body.linkedinlink,
                instagramlink: req.body.instagramlink,
                gstnoimg: hospitaldetail.gstnoimg,
                uhidcode: req.body.uhidcode,
                address: address,
            };
        }
        if (req.files['registrationimg'] !== undefined) {

            let registrationimage = req.files['registrationimg']
            for (let i = 0; i < registrationimage.length; i++) {
                hospitaldetail.registrationimg = registrationimage[i].key

            }
            var hospitaldetaill = {
                name: req.body.name,
                gstno: req.body.gstno,
                registration: req.body.registration,
                companyemail: req.body.companyemail,
                facebooklink: req.body.facebooklink,
                twitterlink: req.body.twitterlink,
                linkedinlink: req.body.linkedinlink,
                instagramlink: req.body.instagramlink,
                registrationimg: hospitaldetail.registrationimg,
                uhidcode: req.body.uhidcode,
                address: address,

            };
        }
        if (req.files['logosize1'] !== undefined) {

            let logosize1 = req.files['logosize1']
            for (let i = 0; i < logosize1.length; i++) {
                hospitaldetail.logosize1 = logosize1[i].key

            }
            var hospitaldetaill = {
                name: req.body.name,
                gstno: req.body.gstno,
                registration: req.body.registration,
                companyemail: req.body.companyemail,
                facebooklink: req.body.facebooklink,
                twitterlink: req.body.twitterlink,
                linkedinlink: req.body.linkedinlink,
                instagramlink: req.body.instagramlink,
                logosize1: hospitaldetail.logosize1,
                uhidcode: req.body.uhidcode,
                address: address,


            };
        }
        if (req.files['logosize2'] !== undefined) {

            let logosize2 = req.files['logosize2']
            for (let i = 0; i < logosize2.length; i++) {
                hospitaldetail.logosize2 = logosize2[i].key

            }
            var hospitaldetaill = {
                name: req.body.name,
                gstno: req.body.gstno,
                registration: req.body.registration,
                companyemail: req.body.companyemail,
                facebooklink: req.body.facebooklink,
                twitterlink: req.body.twitterlink,
                linkedinlink: req.body.linkedinlink,
                instagramlink: req.body.instagramlink,
                logosize2: hospitaldetail.logosize2,
                uhidcode: req.body.uhidcode,
                address: address,


            };
        }
        if (req.files['logosize3'] !== undefined) {

            let logosize3 = req.files['logosize3']
            for (let i = 0; i < logosize3.length; i++) {
                hospitaldetail.logosize3 = logosize3[i].key

            }
            var hospitaldetaill = {
                name: req.body.name,
                gstno: req.body.gstno,
                registration: req.body.registration,
                companyemail: req.body.companyemail,
                facebooklink: req.body.facebooklink,
                twitterlink: req.body.twitterlink,
                linkedinlink: req.body.linkedinlink,
                instagramlink: req.body.instagramlink,
                logosize3: hospitaldetail.logosize3,
                uhidcode: req.body.uhidcode,
                address: address,

            };
        }


        Hospitaldetail.findByIdAndUpdate(req.params.id, { $set: hospitaldetaill }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                return res.status(400).send({ message: 'error in retriving the documents' });
            }
        });

    } else if (!Object.keys(req.files).length) {
        // console.log("second")
        var hospitaldetaill = {
            name: req.body.name,
            gstno: req.body.gstno,
            registration: req.body.registration,
            companyemail: req.body.companyemail,
            facebooklink: req.body.facebooklink,
            twitterlink: req.body.twitterlink,
            linkedinlink: req.body.linkedinlink,
            instagramlink: req.body.instagramlink,
            uhidcode: req.body.uhidcode,
            address: address,
        };
        Hospitaldetail.findByIdAndUpdate(req.params.id, { $set: hospitaldetaill }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                return res.status(400).send({ message: 'error in retriving the documents' });
            }
        });

    }
}

// Hospital Bank Details

exports.postBankDetails = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const bank = new Bank();
        bank.beneficiaryName = req.body.beneficiaryName
        bank.accountNo = req.body.accountNo
        bank.accountType = req.body.accountType
        bank.bankName = req.body.bankName
        bank.branch = req.body.branch
        bank.address = req.body.address
        bank.city = req.body.city
        bank.state = req.body.state
        bank.ifscCode = req.body.ifscCode
        bank.branchCode = req.body.branchCode
        const user = await Hospital.findById(userid)

        bank.hospital = user._id
        await bank.save()
        user.hospitalBankDetails.push(bank)
        await user.save()
        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}
exports.getBankDetails = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Hospital.findById(userid).populate('hospitalBankDetails')
        res.send(user.hospitalBankDetails)
    } catch (err) {
        next(err);
    }

}

exports.putBankDetails = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


    var bankUpdate = {
        beneficiaryName: req.body.beneficiaryName,
        accountNo: req.body.accountNo,
        accountType: req.body.accountType,
        bankName: req.body.bankName,
        branch: req.body.branch,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        ifscCode: req.body.ifscCode,
        branchCode: req.body.branchCode,

    };


    Bank.findByIdAndUpdate(req.params.id, { $set: bankUpdate }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in update the documents' });
        }
    });

}