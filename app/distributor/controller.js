const Distributor = require('./model')
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


exports.getDistributor = (req, res) => {
    Distributor.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            return res.status(400).send({ message: 'error in retrieving register' });

        }

    });


}

exports.putDistributor = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        } else {
            var distributor = {
                name: req.body.name,
                email: req.body.email,
                password: hash,
                mobile: req.body.mobile,
                country: req.body.country,

            };
            var passcheck = await Distributor.findOne({ _id: req.params.id })

            if (passcheck.password == req.body.password) {
                Distributor.password = req.body.password
            }

            Distributor.findByIdAndUpdate(req.params.id, { $set: distributor }, { new: true }, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else {
                    if (err.code == 11000)
                        res.status(422).send({ message: 'Duplicate email address found' })
                    else return res.status(400).send({ message: 'error in update the documents' });

                }
            });
        }
    })

}

exports.delDistributor = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Distributor.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'Error in delete the document' });

        }
    });
}

module.exports.postDistributor = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            res.stauts(500).send({
                message: err.message
            })
        } else {
            var distributor = new Distributor();
            distributor.name = req.body.name;
            distributor.email = req.body.email;
            distributor.password = hash;
            distributor.mobile = req.body.mobile;
            distributor.country = req.body.country;

            distributor.save((err, doc) => {
                if (!err) {
                    let payload = { name: doc.name, email: doc.email, mobile: doc.mobile, Role: doc.Role }
                    let token = jwt.sign(payload, process.env.KEY)
                    res.send({ token });

                } else {
                    if (err.code == 11000)
                        res.status(422).send({ message: 'Duplicate email address found' });
                    else
                        return next(err);
                }
            })
        }
    });

}

module.exports.loginDistributor = (req, res, next) => {
    let userData = req.body;
    Distributor.findOne({ email: userData.email }, (error, user) => {


        if (error) {
            console.log(error)
        } else {
            if (!user) {
                res.status(400).send({ message: "Invalid Email" })

            } else {
                bcrypt.compare(req.body.password, user.password, (err, result) => {

                    if (err) {
                        return res.status(400).send({ message: "Auth Failed" })

                    }
                    if (result) {
                        let payload = { id: user._id, branchid: user._id, name: user.name, email: user.email, mobile: user.mobile, Role: user.Role }
                        let token = jwt.sign(payload, process.env.KEY)
                        res.status(200).send({ token })
                    } else {
                        res.status(400).send({ message: "Invalid Password" })

                    }
                })

            }

        }
    })


}