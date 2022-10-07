const Myhospitalzone = require('./myhospitalzone.model')
const Myemployee = require('./myemployee.model')
const Mydoctor = require('./mydoctor.model')
const Mydefualt = require('./default.model')
const jwt_decode = require('jwt-decode');
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const { ObjectId } = require('mongodb');

exports.postmyHospitalZone = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const myhospitalzone = new Myhospitalzone();
        myhospitalzone.hospitalid = req.body.hospitalid;
        myhospitalzone.zone = req.body.zone;
        myhospitalzone.treatments = req.body.treatments;
        myhospitalzone.countries = req.body.countries;
        myhospitalzone.executivesto = req.body.executivesto;
        myhospitalzone.executivescc = req.body.executivescc;
        myhospitalzone.doctorsto = req.body.doctorsto;
        myhospitalzone.doctorscc = req.body.doctorscc;
        const user = await Facilitator.findById(userid)

        myhospitalzone.user = user
        await myhospitalzone.save()

        user.myhospitalzones.push(myhospitalzone)
        await user.save()
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getmyHospitalZOne = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('myhospitalzones')

        res.send(user.myhospitalzones)
    } catch (err) {
        next(err);
    }

}
exports.delmyHospitalZone = async(req, res, next) => {
    try {
        var zone = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        myhospitalzonedoc = await Myhospitalzone.findByIdAndRemove(req.params.id);
        res.send(myhospitalzonedoc);

        await Facilitator.update({ _id: userid }, { $pull: { myhospitalzones: zone } });
    } catch (err) {
        next(err);
    }

}

exports.putmyHospitalZone = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var myhospitalzone = {
        hospitalid: req.body.hospitalid,
        zone: req.body.zone,
        treatments: req.body.treatments,
        countries: req.body.countries,
        executivesto: req.body.executivesto,
        executivescc: req.body.executivescc,
        doctorsto: req.body.doctorsto,
        doctorscc: req.body.doctorscc,

    };
    Myhospitalzone.findByIdAndUpdate(req.params.id, { $set: myhospitalzone }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getmyHospitalOpinionZoneId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;
    var country = req.params.country;
    var treatment = req.params.treatment;

    zoneQuery = { "hospitalid": id, "user": userid, "countries": country, "treatments": treatment };
    Myhospitalzone.find(zoneQuery).populate('executivesto executivescc doctorsto doctorscc')
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
exports.getmyHospitalZoneId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;
    zoneQuery = { "hospitalid": id, "user": userid };
    Myhospitalzone.find(zoneQuery)
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
exports.getmyHospitalZoneIddetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Myhospitalzone.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('executivesto executivescc doctorsto doctorscc')

}

// Myemployee
exports.postmyEmployee = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const myemployee = new Myemployee();
        myemployee.hospitalid = req.body.hospitalid;
        myemployee.name = req.body.name;
        myemployee.emailid = req.body.emailid;
        myemployee.contact = req.body.contact;

        const user = await Facilitator.findById(userid)

        myemployee.user = user
        await myemployee.save()

        user.myemployees.push(myemployee)
        await user.save()
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}
exports.getmyEmployeeIddetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Myemployee.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

}
exports.getmyEmployee = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('myemployees')

        res.send(user.myemployees)
    } catch (err) {
        next(err);
    }

}
exports.delmyEmployee = async(req, res, next) => {
    try {
        var emp = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        myemployeedoc = await Myemployee.findByIdAndRemove(req.params.id);
        res.send(myemployeedoc);

        await Facilitator.update({ _id: userid }, { $pull: { myemployees: emp } });
    } catch (err) {
        next(err);
    }
}

exports.putmyEmployee = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var myemployee = {
        hospitalid: req.body.hospitalid,
        name: req.body.name,
        emailid: req.body.emailid,
        contact: req.body.contact,

    };
    Myemployee.findByIdAndUpdate(req.params.id, { $set: myemployee }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getmyEmployeeId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;
    zoneQuery = { "hospitalid": id, "user": userid };
    Myemployee.find(zoneQuery)
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

// Predoctors
exports.postmyDoctor = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const mydoctor = new Mydoctor();
        mydoctor.hospitalid = req.body.hospitalid;
        mydoctor.name = req.body.name;
        mydoctor.emailid = req.body.emailid;

        const user = await Facilitator.findById(userid)

        mydoctor.user = user
        await mydoctor.save()

        user.mydoctors.push(mydoctor)
        await user.save()
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getmyDoctor = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('mydoctors')

        res.send(user.mydoctors)
    } catch (err) {
        next(err);
    }

}
exports.delmyDoctor = async(req, res, next) => {
    try {
        var doc = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        mydoctordoc = await Mydoctor.findByIdAndRemove(req.params.id);
        res.send(mydoctordoc);

        await Facilitator.update({ _id: userid }, { $pull: { mydoctors: doc } });
    } catch (err) {
        next(err);
    }

}

exports.putmyDoctor = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var mydoctor = {
        hospitalid: req.body.hospitalid,
        name: req.body.name,
        emailid: req.body.emailid,

    };
    Mydoctor.findByIdAndUpdate(req.params.id, { $set: mydoctor }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getmyDoctorId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;
    zoneQuery = { "hospitalid": id, "user": userid };
    Mydoctor.find(zoneQuery)
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
exports.getmyDoctorIddetail = (req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        Mydoctor.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        })

    }
    // Mydefualt
exports.postMyDefualt = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const mydefualt = new Mydefualt();
        mydefualt.hospitalid = req.body.hospitalid;
        mydefualt.executivesto = req.body.executivesto;
        mydefualt.executivescc = req.body.executivescc;
        const user = await Facilitator.findById(userid)
        mydefualt.user = user
        await mydefualt.save()

        user.mydefualts.push(mydefualt)
        await user.save()
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

exports.getMyDefualt = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('mydefualts')

        res.send(user.mydefualts)
    } catch (err) {
        next(err);
    }

}


exports.putMyDefault = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var mydefualt = {
        hospitalid: req.body.hospitalid,
        executivesto: req.body.executivesto,
        executivescc: req.body.executivescc,
    };
    Mydefualt.findByIdAndUpdate(req.params.id, { $set: mydefualt }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getMyDefualtId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;

    zoneQuery = { "hospitalid": id, "user": userid };
    Mydefualt.find(zoneQuery).populate('executivesto executivescc')
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
exports.getMyDefualtIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Mydefualt.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

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
                        if (customFields[8].value == 'true') {
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