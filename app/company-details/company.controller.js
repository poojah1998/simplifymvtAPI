const Companydetail = require('./company.model')
const Branchcompanydetail = require('./branch.model')

const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
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


exports.postCompanydetails = async(req, res, next) => {
    try {
        const { userid } = req.params;
        address = JSON.parse(req.body.address)
        const companydetail = new Companydetail();
        companydetail.name = req.body.name;
        companydetail.gstno = req.body.gstno;
        companydetail.registration = req.body.registration;
        companydetail.companyemail = req.body.companyemail;
        companydetail.facebooklink = req.body.facebooklink;
        companydetail.twitterlink = req.body.twitterlink;
        companydetail.linkedinlink = req.body.linkedinlink;
        companydetail.instagramlink = req.body.instagramlink;
        companydetail.uhidcode = req.body.uhidcode;
        companydetail.address = address;

        if (req.files['gstnoimg'] !== undefined) {
            let gstimg = req.files['gstnoimg']
            for (let i = 0; i < gstimg.length; i++) {
                companydetail.gstnoimg = gstimg[i].key

            }

        }
        if (req.files['registrationimg'] !== undefined) {

            let registrationimage = req.files['registrationimg']
            for (let i = 0; i < registrationimage.length; i++) {
                companydetail.registrationimg = registrationimage[i].key

            }
        }
        if (req.files['logosize1'] !== undefined) {

            let logosize1 = req.files['logosize1']
            for (let i = 0; i < logosize1.length; i++) {
                companydetail.logosize1 = logosize1[i].key

            }
        }
        if (req.files['logosize2'] !== undefined) {

            let logosize2 = req.files['logosize2']
            for (let i = 0; i < logosize2.length; i++) {
                companydetail.logosize2 = logosize2[i].key

            }
        }
        if (req.files['logosize3'] !== undefined) {

            let logosize3 = req.files['logosize3']
            for (let i = 0; i < logosize3.length; i++) {
                companydetail.logosize3 = logosize3[i].key

            }
        }
        const user = await Facilitator.findById(userid)

        companydetail.user = user
        await companydetail.save()

        user.companydetails.push(companydetail)
        await user.save()
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getCompanydetailsid = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('companydetails')

        res.send(user.companydetails)

    } catch (err) {
        next(err);
    }

}
exports.delCompanydetailsid = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Companydetail.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'Error in delete the documents' });
        }
    });


}

exports.putCompanydetails = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    address = JSON.parse(req.body.address)

    const companydetail = new Companydetail();
    if (Object.keys(req.files).length) {

        if (req.files['gstnoimg'] !== undefined) {
            let gstimg = req.files['gstnoimg']
            for (let i = 0; i < gstimg.length; i++) {
                companydetail.gstnoimg = gstimg[i].key

            }
            var companydetaill = {
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
                gstnoimg: companydetail.gstnoimg,

            };
        }
        if (req.files['registrationimg'] !== undefined) {

            let registrationimage = req.files['registrationimg']
            for (let i = 0; i < registrationimage.length; i++) {
                companydetail.registrationimg = registrationimage[i].key

            }
            var companydetaill = {
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
                registrationimg: companydetail.registrationimg,


            };
        }
        if (req.files['logosize1'] !== undefined) {

            let logosize1 = req.files['logosize1']
            for (let i = 0; i < logosize1.length; i++) {
                companydetail.logosize1 = logosize1[i].key

            }
            var companydetaill = {
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

                logosize1: companydetail.logosize1,



            };
        }
        if (req.files['logosize2'] !== undefined) {

            let logosize2 = req.files['logosize2']
            for (let i = 0; i < logosize2.length; i++) {
                companydetail.logosize2 = logosize2[i].key

            }
            var companydetaill = {
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

                logosize2: companydetail.logosize2,



            };
        }
        if (req.files['logosize3'] !== undefined) {

            let logosize3 = req.files['logosize3']
            for (let i = 0; i < logosize3.length; i++) {
                companydetail.logosize3 = logosize3[i].key

            }
            var companydetaill = {
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

                logosize3: companydetail.logosize3,


            };
        }


        Companydetail.findByIdAndUpdate(req.params.id, { $set: companydetaill }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                return res.status(400).send({ message: 'error in update the documents' });
            }

        });

    } else if (!Object.keys(req.files).length) {
        var companydetaill = {
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
        Companydetail.findByIdAndUpdate(req.params.id, { $set: companydetaill }, { new: true }, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else {
                return res.status(400).send({ message: 'error in update the documents' });
            }
        });

    }


}

// Branch Office

exports.postBranchCompanydetails = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const branchcompanydetail = new Branchcompanydetail();
        branchcompanydetail.branchname = req.body.branchname;
        branchcompanydetail.branchid = req.body.branchid;
        branchcompanydetail.branchcompanyemail = req.body.branchcompanyemail;
        branchcompanydetail.branchaddress = req.body.branchaddress;
        branchcompanydetail.branchcontact = req.body.branchcontact;


        const user = await Facilitator.findById(userid)

        branchcompanydetail.user = user
        await branchcompanydetail.save()

        user.branchcompanydetails.push(branchcompanydetail)
        await user.save()
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}
exports.getBranchCompanydetailsid = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate({
            path: 'branchcompanydetails',
            populate: {
                path: 'branchid'
            }
        })

        res.send(user.branchcompanydetails)

    } catch (err) {
        next(err);
    }

}
exports.delBranchCompanyDetails = async(req, res, next) => {
    try {
        var branchid = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        branchcompanydetail = await Branchcompanydetail.findByIdAndRemove(req.params.id);
        res.send(branchcompanydetail);
        await Facilitator.update({ _id: userid }, { $pull: { branchcompanydetails: branchid } });
    } catch (err) {
        next(err);
    }

}

exports.putBranchCompayDetails = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var branch = {
        branchname: req.body.branchname,
        branchid: req.body.branchid,
        branchcompanyemail: req.body.branchcompanyemail,
        branchaddress: req.body.branchaddress,
        branchcontact: req.body.branchcontact
    };
    Branchcompanydetail.findByIdAndUpdate(req.params.id, { $set: branch }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}