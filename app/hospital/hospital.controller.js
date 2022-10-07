const Hospital = require('./hospital.model')
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const { ObjectId } = require('mongodb');
var mailer = require('../send-email/sendemail');
const jwt_decode = require('jwt-decode');
const logger = require('../logs/logger');
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');
exports.postHospital = async(req, res, next) => {
    try {
        console.log(req.body)
        const { userid } = req.params;
        const hospital = new Hospital();
        hospital.name = req.body.name;
        hospital.accreditations = req.body.accreditations;
        hospital.city = req.body.city;
        hospital.country = req.body.country;

        hospital.beds = req.body.beds;
        const user = await Facilitator.findById(userid)
        hospital.user = user
        await hospital.save()

        user.hospitals.push(hospital)
        await user.save()
        logger.info(`${hospital.name} added`, { id: userid, action: "My Hospital", userName: user.name })
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getHospital = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('hospitals')

        res.send(user.hospitals)
    } catch (err) {
        next(err);
    }
}
exports.delHospitalid = async(req, res, next) => {
    try {
        var hosid = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        hospitaldoc = await Hospital.findByIdAndRemove(req.params.id);
        res.send(hospitaldoc);
        await Facilitator.update({ _id: userid }, { $pull: { hospitals: hosid } });
    } catch (err) {
        next(err);
    }

}

exports.putHospital = async(req, res, next) => {
    try {

        const { userid } = req.params
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        var hospital = {
            name: req.body.name,
            accreditations: req.body.accreditations,
            city: req.body.city,
            country: req.body.country,
            beds: req.body.beds,
        };
        const user = await Facilitator.findById(userid)
        Hospital.findByIdAndUpdate(req.params.id, { $set: hospital }, { new: true }, (err, doc) => {
            if (!err) {
                logger.info(`${doc.name} Edited`, { id: userid, action: "Edit", userName: user.name })

                res.send(doc);
            } else { return res.status(400).send({ message: 'error in update the documents' }); }
        });
    } catch (err) {
        next(err)
    }
}
exports.getHospitalCity = (req, res) => {
    var userid = req.params.userid;
    var city = req.params.city;
    zoneQuery = { "city": city, "user": userid };
    Hospital.find(zoneQuery)
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
                        if (customFields[3].value == 'true') {
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