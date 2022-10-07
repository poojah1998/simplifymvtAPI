const mongoose = require('mongoose');
const Hospital = require('./auth.model')
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const Hospitaluserrole = require('./userole.model')
const HospitalDetails = require('../hospital-details/details.model')
const HospitalBank = require('../hospital-details/bank.model')
const HospitalReports = require('../reports/report.model')
const HospitalRefferalPartners = require('../hospital-refferalpartner/refferal.model')
const HospitalCredentials = require('../sendmail/credentials.model')
const HospitalProfiles = require('../hospital-profile/profile.model')
const otpGen = require("otp-generator");
const otpTool = require("otp-without-db");
const sendEmail = require('../../app/send-email/sendemail');
const { findById } = require('./auth.model');
const jwt_decode = require('jwt-decode');
const HospitalCms = require('../../app/patient/cms.hospital.model')
const HospitalEmployee = require('../hospital-email/employee.model')
const sendHospitalEmail = require('../sendmail/sendmail');
const Zoho = require('../../app/zoho-subscription/model');
const axios = require('axios');
exports.forgetPassword = (req, res, next) => {

    Hospital.findOne({ email: req.body.email }, function(err, myUser) {

        if (!err) {
            if (myUser) {
                // console.log("This is facilitator", myUser)
                email = myUser.email
                username = myUser.name['name']
                let otp = otpGen.generate(6, { upperCase: false, specialChars: false, alphabets: false });
                let hash = otpTool.createNewOTP(email, otp, process.env.KEY, expiresAfter = 10);
                console.log(otp)
                console.log(hash)
                console.log(email)

                sendEmail.facilitatorAdminOtp(otp, username, email)
                res.send({ email: `${myUser.email}`, hash: hash })
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
    console.log(req.body)
    if (otpTool.verifyOTP(req.body.email, req.body.otp, req.body.hash, process.env.KEY)) {
        otpCheck = true
        res.status(201).send({ message: "Success" })
    } else {
        res.status(401).send({ message: "Otp verification failed" })

    }


}


exports.updateForgotPassword = async(req, res, next) => {
    if (otpCheck) {
        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(400).send({ message: "Password must be same" })
        }
        const email = req.body.email;
        const pass = req.body.newPassword
        const salt = await bcrypt.genSaltSync(10);
        const updatedPassword = await bcrypt.hash(req.body.newPassword, salt);

        Hospital.findOneAndUpdate({ email: req.body.email }, { password: updatedPassword }, (err, doc) => {
            if (!err) {
                const userdata = doc.name['name']
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

exports.verifytoken = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send({ message: 'Unauthorized Request' })
        }
        let token = req.headers.authorization.split(' ')[1]
        if (token === 'null') {
            return res.status(401).send({ message: 'Unauthorized Request' })
        }
        let payload = jwt.verify(token, process.env.KEY)
        if (!payload) {
            return res.status(401).send({ message: 'Unauthorized Request' })

        }
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Auth Failed' })
    }
}

exports.registerget = (req, res) => {
    Hospital.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            return res.status(400).send({ message: 'error in retrieving register' }).populate({ path: 'distributor', model: 'distributor' })

        }

    });


}

exports.registerid = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Hospital.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in retrieving register' });


        }
    })

}

exports.registerupdate = async(req, res, next) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    try {
        hash = bcrypt.hash(req.body.password, 10)
        var hospital = {
            name: req.body.name,
            email: req.body.email,
            password: hash,
            mobile: req.body.mobile,
            Role: req.body.Role,
            distributor: req.body.distributor,

        };
        var passcheck = await Hospital.findOne({ _id: req.params.id })
        data = {
            display_name: req.body.name.name,
            email: req.body.email,
            phone: req.body.mobile

        }
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const customer = await axios.put(`https://subscriptions.zoho.in/api/v1/customers/${passcheck.customer_id}`, data, { headers: { "Authorization": `Bearer ${token}` } })
        if (passcheck.password == req.body.password) {
            hospital.password = req.body.password
        }
        hosUpdate = await Hospital.findByIdAndUpdate(req.params.id, { $set: hospital }, { new: true })
        res.send({ message: 'success' });

    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else if (err.code == 11000) {
            res.status(422).send({ message: 'Duplicate email address found' });

        } else {
            next(err)

        }
    }

}

exports.registerProfileUpdate = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        } else {
            var hospital = {
                // name: req.body.name,
                password: hash,
                mobile: req.body.mobile,

            };
            var passcheck = await Hospital.findOne({ _id: req.params.id })

            if (passcheck.password == req.body.password) {
                hospital.password = req.body.password
            }

            Hospital.findByIdAndUpdate(req.params.id, { $set: hospital }, { new: true }, (err, doc) => {
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
exports.userRolesProfileUpdate = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        } else {
            var hospital = {
                // name: req.body.name,
                password: hash,
                mobile: req.body.mobile,

            };
            var passcheck = await Hospitaluserrole.findOne({ _id: req.params.id })

            if (passcheck.password == req.body.password) {
                hospital.password = req.body.password
            }

            Hospitaluserrole.findByIdAndUpdate(req.params.id, { $set: hospital }, { new: true }, (err, doc) => {
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
exports.registerdelete = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    hosData = await Hospital.findById(req.params.id)
    const tokenData = await Zoho.find({})
    const token = tokenData[tokenData.length - 1].data.access_token
    const customer = await axios.delete(`https://subscriptions.zoho.in/api/v1/customers/${hosData.customer_id}`, { headers: { "Authorization": `Bearer ${token}` } })
    hosDel = await Hospital.remove({ _id: req.params.id })
    res.send({ message: 'success' })
    await Hospitaluserrole.deleteMany({ "hospital": req.params.id });
    await HospitalDetails.deleteMany({ "hospital": req.params.id });
    await HospitalBank.deleteMany({ "hospital": req.params.id });
    await HospitalReports.deleteMany({ "hospital": req.params.id });
    await HospitalRefferalPartners.deleteMany({ "hospital": req.params.id });
    await HospitalCredentials.deleteMany({ "hospital": req.params.id });
    await HospitalProfiles.deleteMany({ "hospital": req.params.id });

}
module.exports.register = async(req, res, next) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10)

        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        data = {
            display_name: req.body.name.name,
            email: req.body.email,
            phone: req.body.mobile

        }
        var hospital = new Hospital();
        hospital.name = req.body.name;
        hospital.email = req.body.email;
        hospital.password = hash;
        hospital.mobile = req.body.mobile;
        hospital.Role = req.body.Role;
        hospital.distributor = req.body.distributor;
        const customer = await axios.post('https://subscriptions.zoho.in/api/v1/customers', data, { headers: { "Authorization": `Bearer ${token}` } })
        hospital.customer_id = customer.data.customer.customer_id

        await hospital.save()
        res.send({ message: 'success' });

    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else if (err.code == 11000) {
            res.status(422).send({ message: 'Duplicate email address found' });

        } else {
            next(err)

        }
    }

}

module.exports.login = (req, res, next) => {

    let userData = req.body;
    Hospital.findOne({ email: userData.email }, (error, user) => {


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
                        let payload = { id: user._id, userid: user._id, name: user.name.name, hospitalid: user.name._id, email: user.email, mobile: user.mobile, Role: user.Role }
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


//Hospital user roles

exports.userrolesget = (req, res) => {
    Hospitaluserrole.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            return res.status(400).send({ message: 'error in retrieving the documents' });

        }

    });


}
exports.userrolesgetbyid = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Hospital.findById(userid).populate({
            path: 'hospitaluserroles',
            populate: {
                path: 'hospitalVisiblity',
                model: HospitalCms,
                select: 'name'
            }
        })

        res.send(user.hospitaluserroles)
    } catch (err) {
        next(err);
    }

}

exports.userrolesid = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Hospitaluserrole.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in retrieving the document' });
        }
    })

}

exports.userrolesupdate = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        } else {
            var hospitaluserrole = {
                name: req.body.name,
                email: req.body.email,
                password: hash,
                mobile: req.body.mobile,
                Role: req.body.Role,
                hospitalname: req.body.hospitalname,
                hospitalVisiblity: req.body.hospitalVisiblity,
                country: req.body.country,
                partner: req.body.partner
            };
            var passcheck = await Hospitaluserrole.findOne({ _id: req.params.id })

            if (passcheck.password == req.body.password) {
                hospitaluserrole.password = req.body.password
            }

            Hospitaluserrole.findByIdAndUpdate(req.params.id, { $set: hospitaluserrole }, { new: true }, (err, doc) => {
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
exports.userrolesdelete = async(req, res, next) => {
    try {
        var roleid = req.params.id
        var userid = req.params.userid;
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });


        hospitaluserroledoc = await Hospitaluserrole.findByIdAndRemove(req.params.id);
        res.send(hospitaluserroledoc);

        await Hospital.update({ _id: userid }, { $pull: { hospitaluserroles: roleid } });
    } catch (err) {
        next(err);
    }

}
module.exports.userroles = async(req, res, next) => {
    try {
        bcrypt.hash(req.body.password, 10, async(err, hash) => {
            if (err) {
                res.stauts(500).send({
                    message: err.message
                })
            } else {

                const { userid } = req.params;
                var hospitaluserrole = new Hospitaluserrole();
                hospitaluserrole.name = req.body.name;
                hospitaluserrole.email = req.body.email;
                hospitaluserrole.password = hash;
                hospitaluserrole.mobile = req.body.mobile;
                hospitaluserrole.Role = req.body.Role;
                hospitaluserrole.hospitalname = req.body.hospitalname;
                hospitaluserrole.hospitalVisiblity = req.body.hospitalVisiblity
                hospitaluserrole.country = req.body.country
                hospitaluserrole.partner = req.body.partner

                const user = await Hospital.findById(userid)

                hospitaluserrole.hospital = user
                sendHospitalEmail.userLogin(hospitaluserrole, req.body.password, user)

                hospitaluserrole.save(async(err, doc) => {
                    if (!err) {
                        user.hospitaluserroles.push(hospitaluserrole)
                        await user.save()

                        const hospitalemployee = new HospitalEmployee();
                        hospitalemployee.hospitalId = req.body.hospitalVisiblity;
                        hospitalemployee.partner = 'NIL';
                        hospitalemployee.role = req.body.Role;
                        hospitalemployee.name = req.body.name;
                        hospitalemployee.emailId = req.body.email;
                        hospitalemployee.contact = req.body.mobile;

                        await hospitalemployee.save()

                        res.status(200).send({ message: "Success" })
                    } else {
                        if (err.code == 11000)
                            res.status(422).send({ message: 'Duplicate email address found' });
                        else
                            return next(err);
                    }
                })


            }
        });


    } catch (err) {
        next(err);
    }
}

module.exports.loginuserroles = async(req, res, next) => {
    let userData = req.body;
    Hospitaluserrole.findOne({ email: userData.email }, async(error, user) => {
            if (error) {
                console.log(error)
            } else {
                if (!user) {
                    res.status(401).send({ message: 'Invalid Email' })

                } else {
                    bcrypt.compare(req.body.password, user.password, async(err, result) => {

                        if (err) {
                            return res.status(400).send({ message: "Auth Failed" })

                        }
                        if (result) {
                            hospital = await Hospital.findById(user.hospital)
                            let payload = { id: user.hospital, userid: user._id, name: user.name, hospitalid: hospital.name._id, email: user.email, mobile: user.mobile, Role: user.Role }
                            let token = jwt.sign(payload, process.env.KEY)
                            res.status(200).send({ token })
                        } else {
                            res.status(400).send({ message: "Invalid Password" })

                        }
                    })
                }


            }
        })
        // Hospital Plan Route


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

                    userole = await Hospitaluserrole.find({
                        hospital: user._id
                    })
                    customFields = plan.data.plan.custom_fields
                    let date = new Date(subscription.data.subscription.next_billing_at);
                    let currentDate = new Date();
                    daysleft = Math.ceil((date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24);
                    console.log('daysleft', daysleft)
                    if (daysleft > 0) {
                        if (userole.length < Number(customFields[1].value)) {
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
        user = await Hospital.findOne({ _id: decoded.id })
        return validate(user)
    } catch (err) {
        next(err)
    }
}
exports.getUserByLimit = async(req, res) => {
    var id = req.params.id;
    user = await Hospital.findOne({ _id: id })
    zoneQuery = {
        hospital: user._id
    }

    Hospitaluserrole.find(zoneQuery)
        .then(data => {

            if (data) {
                console.log(data)
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
exports.getUserByLimit = async(req, res, next) => {
    try {
        var id = req.params.id;
        user = await Hospital.findOne({ _id: id })

        if (user.subscription_id) {
            const tokenData = await Zoho.find({})
            const token = tokenData[tokenData.length - 1].data.access_token
            const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
            const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
            userHospital = await Hospitaluserrole.find({
                hospital: user._id

            })
            res.send({
                user: userHospital,
                subscription: subscription.data.subscription,
                plan: plan.data.plan
            });

        } else {
            return res.status(400).send({ message: 'Please take subscription' })

        }


    } catch (err) {
        next(err)
    }

}
exports.getUsersByHospitalId = (req, res) => {
    var id = req.params.hospitalid;
    zoneQuery = { "hospitalVisiblity": { $in: id } };
    Hospitaluserrole.find(zoneQuery)
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