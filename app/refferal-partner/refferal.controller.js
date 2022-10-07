const Refferal = require('./refferal.model')
const mongoose = require('mongoose');
const Facilitator = require('../facilitator-register/facilitator.model')
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
var generator = require('generate-password');
var sendemail = require('../send-email/sendemail');
const bcrypt = require('bcryptjs');
const jwt_decode = require('jwt-decode');
const sendEmail = require('../send-email/sendemail')
const otpGen = require("otp-generator");
const otpTool = require("otp-without-db");
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');
exports.postRefferal = (req, res, next) => {
    var password = generator.generate({
        length: 10,
        numbers: true
    });
    bcrypt.hash(password, 10, async(err, hash) => {
        try {

            if (err) {
                res.stauts(500).send({
                    message: err.message
                })
            } else {

                const { userid } = req.params;
                const refferal = new Refferal();
                refferal.name = req.body.name;
                refferal.emailid = req.body.emailid;
                refferal.password = hash;
                refferal.contact = req.body.contact;
                refferal.country = req.body.country;
                refferal.branchoffice = req.body.branchoffice;
                if (req.body.branchoffice == "" || req.body.branchoffice == "undefined") {
                    refferal.branchoffice = 'NAN';

                } else {
                    refferal.branchoffice = req.body.branchoffice;

                }
                refferal.partnercategory = req.body.partnercategory;
                refferal.fees = req.body.fees;
                refferal.feescategory = req.body.feescategory;
                const user = await Facilitator.findById(userid)

                refferal.user = user
                await refferal.save((err, doc) => {
                    if (!err) {
                        let payload = { name: doc.name, email: doc.emailid, mobile: doc.contact, Role: doc.Role }
                        let token = jwt.sign(payload, process.env.KEY)
                        res.send({ token });
                        sendemail.refferalLogin(doc, user._id, user.name, password, req)

                    } else {
                        if (err.code == 11000)
                            res.status(422).send({ message: 'Duplicate email address found' });
                        else
                            return next(err);
                    }
                })
                user.refferals.push(refferal)
                await user.save()
            }
        } catch (err) {
            next(err);
        }
    });


}
module.exports.loginRefferalPartner = (req, res, next) => {
    let userData = req.body;
    Refferal.findOne({ emailid: userData.email }, (error, user) => {


        if (error) {
            console.log(error)
        } else {
            if (!user) {
                res.status(401).send({ message: 'Invalid Email' })

            } else {
                bcrypt.compare(req.body.password, user.password, (err, result) => {

                    if (err) {
                        return res.status(400).send({ message: "Auth Failed" })

                    }
                    if (result) {
                        let payload = { id: user.user, branchid: user._id, refferalid: user._id, country: user.country, branchoffice: user.branchoffice, name: user.name, email: user.emailid, mobile: user.contact, Role: 'Refferal Partner' }
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
exports.getRefferal = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('refferals')

        res.send(user.refferals)
    } catch (err) {
        next(err);
    }


}
exports.getRefferalBybranchid = (req, res) => {
    var branchid = req.params.branchid;
    zoneQuery = {
        "branchoffice": branchid

    };
    Refferal.find(zoneQuery)
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
exports.delRefferal = async(req, res, next) => {
    try {
        var ref = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        refferaldoc = await Refferal.findByIdAndRemove(req.params.id);
        res.send(refferaldoc);

        await Facilitator.update({ _id: userid }, { $pull: { refferals: ref } });
    } catch (err) {
        next(err);
    }

}

exports.putRefferal = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.stauts(500).send({
                message: err.message
            })
        } else {
            var refferal = {
                name: req.body.name,
                emailid: req.body.emailid,
                contact: req.body.contact,
                country: req.body.country,
                branchoffice: req.body.branchoffice,
                partnercategory: req.body.partnercategory,
                password: hash,
                fees: req.body.fees,
                feescategory: req.body.feescategory,
            };
            var passcheck = await Refferal.findOne({ _id: req.body._id })

            if (passcheck.password == req.body.password) {
                refferal.password = req.body.password
            }
            if (req.body.branchoffice == "" || req.body.branchoffice == "undefined") {
                refferal.branchoffice = 'NAN';

            } else {
                refferal.branchoffice = req.body.branchoffice;

            }
            Refferal.findByIdAndUpdate(req.params.id, { $set: refferal }, { new: true }, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else { return res.status(400).send({ message: 'error in update the documents' }); }
            });

        }
    })

}

exports.putResetPassword = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);
    console.log(req.body)
    Refferal.findById(req.params.id, (err, doc) => {
        if (err) {
            res.status(402).send({ message: err.message })
        } else {
            if (!doc) {
                res.status(402).send({ message: 'No user found' })
            } else {
                bcrypt.compare(req.body.confirmpassword, doc.password, (err, result) => {
                    if (err) {
                        return res.status(400).send({ message: "Auth Failed" })

                    }
                    if (result) {
                        bcrypt.hash(req.body.newpassword, 10, (err, hash) => {
                            var refferal = {

                                password: hash,

                            };
                            Refferal.findByIdAndUpdate(req.params.id, { $set: refferal }, { new: true }, (err, doc) => {
                                if (!err) {
                                    res.send({ message: 'success' });
                                } else { return res.status(400).send({ message: 'error in update the documents' }); }
                            });
                        })
                    } else {
                        res.status(400).send({ message: "Invalid Password" })

                    }

                })

            }

        }
    });

}
exports.getRefferalById = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Refferal.findById(req.params.id, (err, doc) => {
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
                    refferal = await Refferal.find({ user: user._id })

                    customFields = plan.data.plan.custom_fields
                    let date = new Date(subscription.data.subscription.next_billing_at);
                    let currentDate = new Date();
                    daysleft = Math.ceil((date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24);
                    console.log('daysleft', daysleft)
                    if (daysleft > 0) {
                        if (refferal.length < Number(customFields[2].value)) {
                            return next()

                        } else {
                            return res.status(400).send({ message: 'Limit Exceeded' })
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

        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        user = await Facilitator.findOne({ _id: decoded.id })
        return validate(user)
    } catch (err) {
        next(err)
    }
}

exports.getRefferalByLimit = async(req, res, next) => {
        try {
            var id = req.params.userid;
            user = await Facilitator.findOne({ _id: id })

            if (user.Role != 'Super') {
                if (user.subscription_id) {
                    const tokenData = await Zoho.find({})
                    const token = tokenData[tokenData.length - 1].data.access_token
                    const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                    const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                    refferal = await Refferal.find({
                        "user": id,

                    })
                    res.send({
                        refferal: refferal,
                        subscription: subscription.data.subscription,
                        plan: plan.data.plan
                    });

                } else {
                    return res.status(400).send({ message: 'Please take subscription' })

                }

            }
        } catch (err) {
            next(err)
        }

    }
    // forgot Password
exports.forgetPassword = (req, res, next) => {

    Refferal.findOne({ emailid: req.body.email }, function(err, myUser) {

        if (!err) {
            if (myUser) {
                // console.log("This is facilitator", myUser)
                email = myUser.emailid
                username = myUser.name
                let otp = otpGen.generate(6, { upperCase: false, specialChars: false, alphabets: false });
                let hash = otpTool.createNewOTP(email, otp, process.env.KEY, expiresAfter = 10);
                sendEmail.facilitatorAdminOtp(otp, username, email)
                res.send({ email: `${myUser.emailid}`, hash: hash })
            } else {
                res.status(401).send({ message: "User is not registered" })
            }
        } else {
            next(err)
        }
    })
}

otpCheck = false
exports.verifyOtp = async(req, res, next) => {
    if (otpTool.verifyOTP(req.body.email, req.body.otp, req.body.hash, process.env.KEY)) {
        otpCheck = true
        res.status(201).send({ message: "Success" })
    } else {
        res.status(401).send({ message: "Otp verification failed" })

    }


}


exports.updateForgotPassword = async(req, res, next) => {
    console.log('hiiiiiiii', req.body)
    if (otpCheck) {
        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(400).send({ message: "Password must be same" })
        }
        const email = req.body.email;
        const pass = req.body.newPassword
        const salt = await bcrypt.genSaltSync(10);
        const updatedPassword = await bcrypt.hash(req.body.newPassword, salt);

        Refferal.findOneAndUpdate({ emailid: req.body.email }, { password: updatedPassword }, (err, doc) => {
            if (!err) {
                const userdata = doc.name
                sendEmail.updatedFacilitatorPassword(userdata, pass, email)
                res.status(201).send({ message: "Sucesss" })
            } else {
                res.status(400).send({ message: "Updation failed" })
            }
        })
    } else {
        return res.status(400).send({ message: "Unauthorized Access" })

    }
}