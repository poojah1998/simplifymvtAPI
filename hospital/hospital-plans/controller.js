const mongoose = require('mongoose');
const Plan = require('./model')
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
        planType: req.body.planType,
        queries: req.body.queries,
        users: req.body.users,
        refferalPartner: req.body.refferalPartner,


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
    plan.planType = req.body.planType;
    plan.queries = req.body.queries;
    plan.users = req.body.users;
    plan.refferalPartner = req.body.refferalPartner

    plan.save((err, doc) => {
        if (!err) {

            res.send({ message: 'Success' });

        } else {
            return next(err);

        }
    })


}