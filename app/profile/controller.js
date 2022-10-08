const Profile = require('./model')
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');



exports.postProfile = async(req, res, next) => {
    console.log("11111111111");
    try {
        const { userid } = req.params;
        const profile = new Profile();
        profile.designation = req.body.designation;
        console.log( profile.designation);
        profile.user = userid
        await profile.save()
        res.status(201).send({ message: "success" })
    } catch (err) {
        next(err);
    }
}
exports.getProfile = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const user = await Profile.find({ "user": userid })

        res.send(user)
    } catch (err) {
        next(err);
    }

}

exports.putProfile = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    profileUpdate = {
        designation: req.body.designation
    }

    Profile.findByIdAndUpdate(req.params.id, { $set: profileUpdate }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in update the documents' });
        }
    });

}