const mongoose = require('mongoose');
const Plan = require('./plan.model')
const { ObjectId } = require('mongodb');

exports.getPlan = (req, res) => {
    Plan.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            return res.status(400).send({ message: 'error in retrieving the documents' });

        }
    });

}

exports.getPlanById = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Plan.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in retrieving the documents' });


        }
    })

}

exports.planUpdate = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var plan = {
        name: req.body.name,
        price: req.body.price,
        plantype: req.body.plantype,
        queries: req.body.queries,
        users: req.body.users,
        refferalpartner: req.body.refferalpartner,
        hospitalvisibility: req.body.hospitalvisibility,
        myhospitalvisibility: req.body.myhospitalvisibility,
        doctorvisibility: req.body.doctorvisibility,
        mydoctorvisibility: req.body.mydoctorvisibility,
        zonevisibility: req.body.zonevisibility,
        myzonevisibility: req.body.myzonevisibility,

    };
    Plan.findByIdAndUpdate(req.params.id, { $set: plan }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            if (err.code == 11000)
                res.status(422).send({ message: 'Duplicate email address found' })
            else return res.status(400).send({ message: 'error in retriving the documents' });

        }

    });


}
exports.planDelete = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


    Plan.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'Error in delete the documents' });

        }
    });
}
module.exports.postPlan = (req, res, next) => {
    var plan = new Plan();
    plan.name = req.body.name;
    plan.price = req.body.price;
    plan.plantype = req.body.plantype;
    plan.queries = req.body.queries;
    plan.users = req.body.users;
    plan.refferalpartner = req.body.refferalpartner
    plan.hospitalvisibility = req.body.hospitalvisibility;
    plan.myhospitalvisibility = req.body.myhospitalvisibility;
    plan.doctorvisibility = req.body.doctorvisibility;
    plan.mydoctorvisibility = req.body.mydoctorvisibility;
    plan.zonevisibility = req.body.zonevisibility;
    plan.myzonevisibility = req.body.myzonevisibility;
    plan.save((err, doc) => {
        if (!err) {

            res.send({ message: 'Success' });

        } else {
            return next(err);

        }
    })


}