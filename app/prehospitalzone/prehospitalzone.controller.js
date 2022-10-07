const Prehospitalzone = require('./prehospitalzone.model')
const Preemployee = require('./preemployees.model')
const Predoctor = require('./predoctor.model')
const Predefualt = require('./defualt.model')
const jwt_decode = require('jwt-decode');
const Preimport = require('./import.model')
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');
const Facilitator = require('../facilitator-register/facilitator.model')

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

exports.postpreHospitalZone = async(req, res, next) => {
    try {
        const { userid } = req.params;
        const prehospitalzone = new Prehospitalzone();
        prehospitalzone.hospitalid = req.body.hospitalid;
        prehospitalzone.zone = req.body.zone;
        prehospitalzone.treatments = req.body.treatments;
        prehospitalzone.countries = req.body.countries;
        prehospitalzone.executivesto = req.body.executivesto;
        prehospitalzone.executivescc = req.body.executivescc;
        prehospitalzone.doctorsto = req.body.doctorsto;
        prehospitalzone.doctorscc = req.body.doctorscc;
        const user = await Facilitator.findById(userid)

        prehospitalzone.user = user
        await prehospitalzone.save()

        user.prehospitalzones.push(prehospitalzone)
        await user.save()
        res.send({ message: "success" })
    } catch (err) {
        next(err);
    }
}

exports.getpreHospitalZOne = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('prehospitalzones')

        res.send(user.prehospitalzones)
    } catch (err) {
        next(err);
    }


}
exports.delpreHospitalZone = async(req, res, next) => {
    try {
        var zone = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        prehospitalzonedoc = await Prehospitalzone.findByIdAndRemove(req.params.id);
        res.send(prehospitalzonedoc);

        await Facilitator.update({ _id: userid }, { $pull: { prehospitalzones: zone } });
    } catch (err) {
        next(err);
    }

}

exports.putPreHospitalZone = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var prehospitalzone = {
        hospitalid: req.body.hospitalid,
        zone: req.body.zone,
        treatments: req.body.treatments,
        countries: req.body.countries,
        executivesto: req.body.executivesto,
        executivescc: req.body.executivescc,
        doctorsto: req.body.doctorsto,
        doctorscc: req.body.doctorscc,

    };
    Prehospitalzone.findByIdAndUpdate(req.params.id, { $set: prehospitalzone }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getpreHospitalZoneId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;

    zoneQuery = { "hospitalid": id, "user": userid };
    Prehospitalzone.find(zoneQuery)
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
exports.getpreHospitalOpinionZoneId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;
    var country = req.params.country;
    var treatment = req.params.treatment;

    zoneQuery = { "hospitalid": id, "user": userid, "countries": country, "treatments": treatment };
    Prehospitalzone.find(zoneQuery).populate('executivesto executivescc doctorsto doctorscc')
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
exports.getpreHospitalZoneIddetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Prehospitalzone.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('executivesto executivescc doctorsto doctorscc')

}

// Preemployee
exports.postpreEmployee = async(req, res, next) => {
        try {
            const { userid } = req.params;
            const preemployee = new Preemployee();
            preemployee.hospitalid = req.body.hospitalid;
            preemployee.name = req.body.name;
            preemployee.emailid = req.body.emailid;
            preemployee.contact = req.body.contact;
            const user = await Facilitator.findById(userid)

            preemployee.user = user
            await preemployee.save()

            user.preemployees.push(preemployee)
            await user.save()
            res.send({ message: "success" })
        } catch (err) {
            next(err);
        }
    }
    // exports.postpreEmployeeImport = async(req, res, next) => {
    //     try {
    //         const { userid } = req.params;
    //         prehospitalzonedata = await Prehospitalzone.find({ user: process.env.USERID })
    //         prehospitalzonedata.forEach(async element => {
    //             const prehospitalzone = new Prehospitalzone();
    //             prehospitalzone.hospitalid = element.hospitalid;
    //             prehospitalzone.zone = element.zone;
    //             prehospitalzone.treatments = element.treatments;
    //             prehospitalzone.countries = element.countries;
    //             prehospitalzone.executivesto = element.executivesto;
    //             prehospitalzone.executivescc = element.executivescc;
    //             prehospitalzone.doctorsto = element.doctorsto;
    //             prehospitalzone.doctorscc = element.doctorscc;
    //             const user = await Facilitator.findById(userid)
    //             prehospitalzone.user = user
    //             await prehospitalzone.save()
    //             user.prehospitalzones.push(prehospitalzone)
    //             await user.save()

//         });
//         predoctordata = await Predoctor.find({ user: process.env.USERID })
//         predoctordata.forEach(async element => {

//             const predoctor = new Predoctor();
//             predoctor.hospitalid = element.hospitalid;
//             predoctor.name = element.name;
//             predoctor.emailid = element.emailid;
//             const user = await Facilitator.findById(userid)
//             predoctor.user = user
//             await predoctor.save()

//             user.predoctors.push(predoctor)
//             await user.save()

//         });

//         preemployeedata = await Preemployee.find({ user: process.env.USERID })
//         preemployeedata.forEach(async element => {
//             const preemployee = new Preemployee();

//             preemployee.hospitalid = element.hospitalid;
//             preemployee.name = element.name;
//             preemployee.emailid = element.emailid;
//             preemployee.contact = element.contact;
//             const user = await Facilitator.findById(userid)
//             preemployee.user = user
//             await preemployee.save()
//             user.preemployees.push(preemployee)
//             await user.save()

//         });
//         predefualtdata = await Predefualt.find({ user: process.env.USERID })
//         console.log(predefualtdata)
//         predefualtdata.forEach(async element => {
//             const predefualt = new Predefualt();
//             predefualt.hospitalid = element.hospitalid;
//             predefualt.executivesto = element.executivesto;
//             predefualt.executivescc = element.executivescc;
//             const user = await Facilitator.findById(userid)
//             predefualt.user = user
//             await predefualt.save()
//             user.predefualts.push(predefualt)
//             await user.save()

//         });
//         preimport = new Preimport()
//         preimport.import = true
//         const user = await Facilitator.findById(userid)
//         preimport.user = user
//         await preimport.save()
//         user.preimports.push(preimport)
//         await user.save()
//         res.send({ message: "success" })

//     } catch (err) {
//         next(err);
//     }
// }
// exports.getpreImport = async(req, res, next) => {
//     try {
//         const { userid } = req.params;

//         const user = await Facilitator.findById(userid).populate('preimports')

//         res.send(user.preimports)
//     } catch (err) {
//         next(err);
//     }
// }
exports.getpreEmployeeIddetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Preemployee.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

}
exports.getpreEmployee = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('preemployees')

        res.send(user.preemployees)
    } catch (err) {
        next(err);
    }
}
exports.delpreEmployee = async(req, res, next) => {
    try {
        var emp = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        preemployeedoc = await Preemployee.findByIdAndRemove(req.params.id);
        res.send(preemployeedoc);

        await Facilitator.update({ _id: userid }, { $pull: { preemployees: emp } });
    } catch (err) {
        next(err);
    }

}

exports.putPreEmployee = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var preemployee = {
        hospitalid: req.body.hospitalid,
        name: req.body.name,
        emailid: req.body.emailid,
        contact: req.body.contact,

    };
    Preemployee.findByIdAndUpdate(req.params.id, { $set: preemployee }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getpreEmployeeId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;
    zoneQuery = { "hospitalid": id, "user": userid };
    Preemployee.find(zoneQuery)
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
exports.postpreDoctor = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const predoctor = new Predoctor();
        predoctor.hospitalid = req.body.hospitalid;
        predoctor.name = req.body.name;
        predoctor.emailid = req.body.emailid;
        const user = await Facilitator.findById(userid)
        predoctor.user = user
        await predoctor.save()

        user.predoctors.push(predoctor)
        await user.save()
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

exports.getpreDoctor = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('predoctors')

        res.send(user.predoctors)
    } catch (err) {
        next(err);
    }

}
exports.delpreDoctor = async(req, res, next) => {
    try {
        var doc = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        predoctordoc = await Predoctor.findByIdAndRemove(req.params.id);
        res.send(predoctordoc);

        await Facilitator.update({ _id: userid }, { $pull: { predoctors: doc } });
    } catch (err) {
        next(err);
    }

}

exports.putPreDoctor = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var predoctor = {
        hospitalid: req.body.hospitalid,
        name: req.body.name,
        emailid: req.body.emailid,

    };
    Predoctor.findByIdAndUpdate(req.params.id, { $set: predoctor }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getpreDoctorId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;

    zoneQuery = { "hospitalid": id, "user": userid };
    Predoctor.find(zoneQuery)
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
exports.getpreDoctorIddetail = (req, res) => {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        Predoctor.findById(req.params.id, (err, doc) => {
            if (!err) {
                res.send(doc);
            } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
        })

    }
    // Predefualt
exports.postpreDefualt = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const predefualt = new Predefualt();
        predefualt.hospitalid = req.body.hospitalid;
        predefualt.executivesto = req.body.executivesto;
        predefualt.executivescc = req.body.executivescc;
        const user = await Facilitator.findById(userid)
        predefualt.user = user
        await predefualt.save()

        user.predefualts.push(predefualt)
        await user.save()
        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}

exports.getpreDefualt = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('predefualts')

        res.send(user.predefualts)
    } catch (err) {
        next(err);
    }

}


exports.putPreDefault = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    var predefualt = {
        hospitalid: req.body.hospitalid,
        executivesto: req.body.executivesto,
        executivescc: req.body.executivescc,
    };
    Predefualt.findByIdAndUpdate(req.params.id, { $set: predefualt }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });


}
exports.getpreDefualtId = (req, res) => {
    var id = req.params.hospitalid;
    var userid = req.params.userid;

    zoneQuery = { "hospitalid": id, "user": userid };
    Predefualt.find(zoneQuery).populate('executivesto executivescc')
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
exports.getpreDefualtIdDetail = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Predefualt.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    }).populate('executivesto executivescc')

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
                        if (customFields[7].value == 'true') {
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