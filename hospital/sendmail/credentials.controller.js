const Credential = require('./credentials.model')

const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');

exports.postCredentials = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const credential = new Credential();
        credential.email1 = req.body.email1;
        credential.password1 = req.body.password1;
        credential.email2 = req.body.email2;
        credential.password2 = req.body.password2;
        credential.host = req.body.host;

        const user = await Hospital.findById(userid)

        credential.hospital = user._id
        await credential.save()

        user.hospitalCredentials.push(credential)
        await user.save()
        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getCredentialsid = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Hospital.findById(userid).populate('hospitalCredentials')

        res.send(user.hospitalCredentials)
    } catch (err) {
        next(err);
    }

}


exports.putCredentials = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var credential = {
        email1: req.body.email1,
        password1: req.body.password1,
        email2: req.body.email2,
        password2: req.body.password2,
        host: req.body.host
    };
    Credential.findByIdAndUpdate(req.params.id, { $set: credential }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}