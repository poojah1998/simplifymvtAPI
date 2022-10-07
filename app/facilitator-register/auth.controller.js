const mongoose = require('mongoose');
const Facilitator = require('./facilitator.model')
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const Userrole = require('./userrole.model')
const jwt_decode = require('jwt-decode');
const Doctor = require('../doctor/doctor.model')
const hospitals = require('../hospital/hospital.model')
const Patient = require('../patient/patient.model')
const Refferal = require('../refferal-partner/refferal.model')
const Myhospitalzone = require('../myhospitalzone/myhospitalzone.model')
const Myemployee = require('../myhospitalzone/myemployee.model')
const Mydoctor = require('../myhospitalzone/mydoctor.model')
const Mydefault = require('../myhospitalzone/default.model')
const Prehospitalzone = require('../prehospitalzone/prehospitalzone.model')
const Preemployee = require('../prehospitalzone/preemployees.model')
const Predoctor = require('../prehospitalzone/predoctor.model')
const Predefault = require('../prehospitalzone/defualt.model')
const Request = require('../opinion-request/request.model')
const Receivededit = require('../opinion-request/receivededited.model')
const Sentopinion = require('../opinion-request/sentopinion.model')
const Responsevil = require('../request-vil/responsevil.model')
const Vil = require('../request-vil/requestvil.model')
const Company = require('../company-details/company.model')
const Branchcompany = require('../company-details/branch.model')
const Credentials = require('../send-email/credentials.model')
const Reports = require('../reports/reports.model')
const Emailcc = require('../send-email/emailcc.model')
const sendEmail = require('../send-email/sendemail')
const otpGen = require("otp-generator");
const otpTool = require("otp-without-db");
const logger = require('../logs/logger');
const Employee = require('../employee/model')
const Zoho = require('../zoho-subscription/model');
const axios = require('axios');


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
exports.validateRole = (req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        console.log(decoded)
        if (decoded.Role == 'Super' || decoded.Role == 'Supreme Sorcerer') {
            next()
        } else {
            return res.status(401).send({ message: 'Unauthorized Request' })

        }
    } catch (error) {
        next(err)
    }
}


exports.forgetPassword = (req, res, next) => {

    Facilitator.findOne({ email: req.body.email }, function(err, myUser) {

        if (!err) {
            if (myUser) {
                // console.log("This is facilitator", myUser)
                email = myUser.email
                username = myUser.name
                let otp = otpGen.generate(6, { upperCase: false, specialChars: false, alphabets: false });
                let hash = otpTool.createNewOTP(email, otp, process.env.KEY, expiresAfter = 10);
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

        Facilitator.findOneAndUpdate({ email: req.body.email }, { password: updatedPassword }, (err, doc) => {
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
exports.registerget = (req, res) => {
    Facilitator.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            return res.status(400).send({ message: 'error in retrieving the documents' });

        }
    });
}
exports.getAllFacilitator = (req, res) => {
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);

    Facilitator.find({}, { name: 1 }, (err, docs) => {
        if (!err) {


            res.send(docs);
        } else {
            return res.status(400).send({ message: 'error in retrieving the documents' });

        }
    });


}

exports.registerid = async(req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        data = await Facilitator.findById(req.params.id).populate([{ path: 'aggregator', model: 'adminSchema' }, {
            path: 'distributor',
            model: 'distributor'
        }])
        res.send(data)
    } catch (err) {
        next(err)
    }
}

exports.registerupdate = async(req, res, next) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    try {
        const hash = await bcrypt.hash(req.body.password, 10)
        var facilitator = {
            name: req.body.name,
            email: req.body.email,
            password: hash,
            phone: req.body.mobile,
            Role: req.body.Role,
            plan: req.body.plan,
            aggregator: req.body.aggregator,
            distributor: req.body.distributor

        };
        var passcheck = await Facilitator.findOne({ _id: req.params.id })
        data = {
            display_name: req.body.name,
            email: req.body.email,
            phone: req.body.mobile

        }
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const customer = await axios.put(`https://subscriptions.zoho.in/api/v1/customers/${passcheck.customer_id}`, data, { headers: { "Authorization": `Bearer ${token}` } })

        data = req.body.aggregator.filter(item => !passcheck.aggregator.includes(item._id));


        if (passcheck.password == req.body.password) {
            facilitator.password = req.body.password
        }
        if (req.body.Role == "Super") {
            facilitator.plan = "I am Super";

        }
        facUpdate = await Facilitator.findByIdAndUpdate(req.params.id, { $set: facilitator }, { new: true })

        if (data.length) {
            data.forEach(async element => {
                Facilitator.findOne({ _id: element._id }, (error, user) => {

                    sendEmail.aggregatorMail(user, facilitator, req)

                });
            });


        }
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

exports.updatePassword = async(req, res) => {
    console.log(req.params.id)

    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    console.log(req.body)
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        } else {
            var facilitator = {
                password: hash,
            };
            var passcheck = await Facilitator.findOne({ _id: req.params.id })

            if (passcheck.password == req.body.password) {
                facilitator.password = req.body.password
            }

            Facilitator.findByIdAndUpdate(req.params.id, { $set: facilitator }, { new: true }, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else {
                    if (err.code == 11000)
                        res.status(422).send({ message: 'Duplicate email address found' })
                    else return res.status(400).send({ message: 'error in retriving the documents' });

                }

            });
        }
    })

}

exports.registerdelete = async(req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

        userid = req.params.id
        facData = await Facilitator.findById(req.params.id)
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const customer = await axios.delete(`https://subscriptions.zoho.in/api/v1/customers/${facData.customer_id}`, { headers: { "Authorization": `Bearer ${token}` } })
        facDel = await Facilitator.remove({ _id: req.params.id })
        res.send({ message: 'success' })
        await Userrole.deleteMany({ "user": userid });
        await Doctor.deleteMany({ "user": userid });
        await hospitals.deleteMany({ "user": userid });
        await Patient.deleteMany({ "user": userid });
        await Refferal.deleteMany({ "user": userid });
        await Myhospitalzone.deleteMany({ "user": userid });
        await Myemployee.deleteMany({ "user": userid });
        await Mydoctor.deleteMany({ "user": userid });
        await Mydefault.deleteMany({ "user": userid });
        await Prehospitalzone.deleteMany({ "user": userid });
        await Preemployee.deleteMany({ "user": userid });
        await Predoctor.deleteMany({ "user": userid });
        await Predefault.deleteMany({ "user": userid });
        await Request.deleteMany({ "user": userid });
        await Receivededit.deleteMany({ "user": userid });
        await Sentopinion.deleteMany({ "user": userid });
        await Responsevil.deleteMany({ "user": userid });
        await Vil.deleteMany({ "user": userid });
        await Company.deleteMany({ "user": userid });
        await Branchcompany.deleteMany({ "user": userid });
        await Credentials.deleteMany({ "user": userid });
        await Reports.deleteMany({ "user": userid });
        await Emailcc.deleteMany({ "user": userid });
        await Employee.deleteMany({ "user": userid });

    } catch (err) {
        next(err)
    }
}
module.exports.register = async(req, res, next) => {
    try {
        hash = await bcrypt.hash(req.body.password, 10)
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        data = {
            display_name: req.body.name,
            email: req.body.email,
            phone: req.body.mobile

        }
        var facilitator = new Facilitator();
        facilitator.name = req.body.name;
        facilitator.email = req.body.email;
        facilitator.password = hash
        facilitator.mobile = req.body.mobile;
        facilitator.aggregator = req.body.aggregator;
        facilitator.distributor = req.body.distributor;
        facilitator.Role = req.body.Role;

        const customer = await axios.post('https://subscriptions.zoho.in/api/v1/customers', data, { headers: { "Authorization": `Bearer ${token}` } })
        facilitator.customer_id = customer.data.customer.customer_id
        await facilitator.save()

        if (req.body.aggregator.length) {
            req.body.aggregator.forEach(async element => {
                Facilitator.findOne({ _id: element._id }, (error, user) => {

                    sendEmail.aggregatorMail(user, facilitator, req)

                });
            });


        }
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
        Facilitator.findOne({ email: userData.email }, (error, user) => {


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
                            logger.info(`Logging in`, { id: user._id, action: "User Login", userName: user.name })
                            res.status(200).send({ token })
                        } else {
                            res.status(400).send({ message: "Invalid Password" })

                        }
                    })

                }

            }
        })


    }
    // user roles
exports.forgetUserRolePassword = (req, res, next) => {
    Userrole.findOne({ email: req.body.email }, function(err, myUser) {
        if (!err) {
            if (myUser) {
                // console.log("This is facilitator", myUser)
                email = myUser.email
                username = myUser.name
                let otp = otpGen.generate(6, { upperCase: false, specialChars: false, alphabets: false });
                let hash = otpTool.createNewOTP(email, otp, process.env.KEY, expiresAfter = 10);
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
otpCheckUser = false
exports.verifyUserRoleOtp = async(req, res, next) => {
    console.log(req.body)
    if (otpTool.verifyOTP(req.body.email, req.body.otp, req.body.hash, process.env.KEY)) {
        otpCheckUser = true
        res.status(201).send({ message: "Success" })
    } else {
        res.status(401).send({ message: "Otp verification failed" })

    }


}
exports.updateUserRoleForgotPassword = async(req, res, next) => {
    if (otpCheckUser) {
        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(400).send({ message: "Password must be same" })
        }
        const email = req.body.email;
        const pass = req.body.newPassword
        const salt = await bcrypt.genSaltSync(10);
        const updatedPassword = await bcrypt.hash(req.body.newPassword, salt);

        Userrole.findOneAndUpdate({ email: req.body.email }, { password: updatedPassword }, (err, doc) => {
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

exports.userrolesget = (req, res) => {
    Userrole.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            return res.status(400).send({ message: 'error in retrieving the documents' });

        }

    });


}
exports.userRolesGetByCountry = (req, res) => {
    var country = req.params.country;
    var userid = req.params.userid;

    zoneQuery = { "country": country, "user": userid };
    Userrole.find(zoneQuery)
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
exports.userrolesgetbyid = async(req, res, next) => {
    try {
        const { userid } = req.params;

        const user = await Facilitator.findById(userid).populate('userroles')

        res.send(user.userroles)
    } catch (err) {
        next(err);
    }

}
exports.userrolesid = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    Userrole.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else {
            return res.status(400).send({ message: 'error in retrieving the documents' });

        }
    })

}

exports.userrolesupdate = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.stauts(500).send({
                message: err.message
            })
        } else {
            var userrole = {
                name: req.body.name,
                email: req.body.email,
                password: hash,
                country: req.body.country,
                mobile: req.body.mobile,
                hospitals: req.body.hospitals,
                Role: req.body.Role,
                adminname: req.body.adminname

            };
            var passcheck = await Userrole.findOne({ _id: req.body._id })

            if (passcheck.password == req.body.password) {
                userrole.password = req.body.password
            }
            Userrole.findByIdAndUpdate(req.params.id, { $set: userrole }, { new: true }, (err, doc) => {
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
exports.userUpdatePassword = async(req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        if (err) {
            res.status(500).send({
                message: err.message
            })
        } else {
            var facilitator = {
                name: req.body.name,
                password: hash,
            };
            var passcheck = await Userrole.findOne({ _id: req.params.id })

            if (passcheck.password == req.body.password) {
                facilitator.password = req.body.password
            }

            Userrole.findByIdAndUpdate(req.params.id, { $set: facilitator }, { new: true }, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else {
                    if (err.code == 11000)
                        res.status(422).send({ message: 'Duplicate email address found' })
                    else return res.status(400).send({ message: 'error in retriving the documents' });

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


        userroledoc = await Userrole.findByIdAndRemove(req.params.id);
        res.send(userroledoc);
        await Facilitator.update({ _id: userid }, { $pull: { userroles: roleid } });

    } catch (err) {
        next(err);
    }

}
module.exports.userroles = (req, res, next) => {

    bcrypt.hash(req.body.password, 10, async(err, hash) => {
        try {

            if (err) {
                res.stauts(500).send({
                    message: err.message
                })
            } else {
                const { userid } = req.params;
                var userrole = new Userrole();
                userrole.name = req.body.name;
                userrole.email = req.body.email;
                userrole.password = hash;
                userrole.country = req.body.country;
                userrole.mobile = req.body.mobile;
                userrole.Role = req.body.Role;
                userrole.adminname = req.body.adminname;
                userrole.hospitals = req.body.hospitals;

                const user = await Facilitator.findById(userid)

                userrole.user = user

                await userrole.save((err, doc) => {
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

                user.userroles.push(userrole)
                await user.save()


            }
        } catch (err) {
            next(err);
        }
    });

}

module.exports.loginuserroles = (req, res, next) => {
    let userData = req.body;
    Userrole.findOne({ email: userData.email }, (error, user) => {


        if (error) {
            console.log(error)
        } else {
            if (!user) {
                res.status(400).send({ message: 'Invalid Email' })

            } else {
                bcrypt.compare(req.body.password, user.password, (err, result) => {

                    if (err) {
                        return res.status(400).send({ message: "Auth Failed" })

                    }
                    if (result) {
                        let payload = { id: user.user, branchid: user._id, country: user.country, name: user.name, email: user.email, mobile: user.mobile, Role: user.Role }
                        let token = jwt.sign(payload, process.env.KEY)
                        logger.info(`Logging in`, { id: user._id, action: "User Login", userName: user.name })
                        res.status(200).send({ token })

                    } else {
                        res.status(400).send({ message: "Invalid Password" })

                    }
                })

            }

        }
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
                    userole = await Userrole.find({ user: user._id })

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
        user = await Facilitator.findOne({ _id: decoded.id })
        return validate(user)
    } catch (err) {
        next(err)
    }
}
exports.getUsersByLimit = async(req, res, next) => {
    try {
        var id = req.params.userid;
        user = await Facilitator.findOne({ _id: id })

        if (user.Role != 'Super') {
            if (user.subscription_id) {
                const tokenData = await Zoho.find({})
                const token = tokenData[tokenData.length - 1].data.access_token
                const subscription = await axios.get(`https://subscriptions.zoho.in/api/v1/subscriptions/${user.subscription_id}`, { headers: { "Authorization": `Bearer ${token}` } })
                const plan = await axios.get(`https://subscriptions.zoho.in/api/v1/plans/${subscription.data.subscription.plan.plan_code}`, { headers: { "Authorization": `Bearer ${token}` } })
                user = await Userrole.find({
                    "user": id,

                })
                res.send({
                    user: user,
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

// // exports.checkRole = (role = []) => {
// //     return (req, res, next) => {
// //         console.log(role)
// //         let token = req.headers.authorization.split(' ')[1]
// //         var decoded = jwt_decode(token);
// //         console.log(decoded)
// //             // if (req.role == role) {
// //             //     console.log(`${role} role granted`)
// //             //     next()
// //             // } else {
// //             //     res.status(401).send({ result: 'error', message: `No ${role} permission granted` })
// //             // }
// //     }
// }