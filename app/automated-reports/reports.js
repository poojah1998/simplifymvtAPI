const cron = require('node-cron');
const Patient = require('../patient/patient.model')
var pipeline = require('./pipeline');
var PipelineBranch = require('./pipeline.branch');
var PipelineRefferal = require('./pipeline.refferal');

var dateFormat = require("dateformat");
var sendemail = require('../send-email/sendemail');
const Company = require('../company-details/company.model')
const Emailcc = require('../send-email/emailcc.model')
const Credential = require('../send-email/credentials.model')
const Userrole = require('../facilitator-register/userrole.model')
const Facilitator = require('../facilitator-register/facilitator.model')
const Refferal = require('../refferal-partner/refferal.model')


cron.schedule('0 21 * * *', async() => {
    try {
        var today = new Date()
        console.log('on')
        today.setHours(21, 0, 0, 0)
        var yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(21, 01, 0, 0)
console.log('today',today);
console.log('yesterday',yesterday)

        dailydate = dateFormat(today, "mmmm dS, yyyy");

        let date = new Date();

        var firstDay =
            new Date(date.getFullYear(), date.getMonth(), 1);

        var lastDay =
            new Date(date.getFullYear(), date.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 0, 0)

        monthlydate = dateFormat(firstDay, "mmmm dS, yyyy");


        var firstyear = new Date()
        firstyear.setMonth(3);
        firstyear.setDate(1);
        firstyear.setHours(0, 0, 0, 0)
        var nextyear = new Date()
        nextyear.setMonth(2);
        nextyear.setDate(31);
        nextyear.setFullYear(firstyear.getFullYear() + 1);
        nextyear.setHours(23, 59, 0, 0)
        yearlydate = dateFormat(firstyear, "mmmm dS, yyyy");
        yearlyyear = firstyear.getFullYear() + "-" + (firstyear.getFullYear() + 1)

        doc = await Patient.aggregate(pipeline.pipeline).allowDiskUse(true)
        doc.map((obj) => {
            obj['dailydate'] = dailydate
            // obj['monthlydate'] = monthlydate
            // obj['yearlydate'] = yearlydate
            // obj['yearlyyear'] = yearlyyear

            return obj

        })

        for (let i = 0; i < doc.length; i++) {
            // month = doc[i].monthlydata.hospital
            // month.map((obj) => {
            //     if (obj.hospitalvil == undefined) {
            //         obj['hospitalvil'] = 0

            //     }
            //     if (obj.hospitalconfirmation == undefined) {
            //         obj['hospitalconfirmation'] = 0
            //     }
            //     return obj

            // })
            daily = doc[i].dailydata.hospital

            daily.map((obj) => {
                if (obj.hospitalvil == undefined) {
                    obj['hospitalvil'] = 0

                }
                if (obj.hospitalconfirmation == undefined) {
                    obj['hospitalconfirmation'] = 0
                }
                return obj
            })
            // annual = doc[i].annualdata.hospital

            // annual.map((obj) => {
            //     if (obj.hospitalvil == undefined) {
            //         obj['hospitalvil'] = 0

            //     }
            //     if (obj.hospitalconfirmation == undefined) {
            //         obj['hospitalconfirmation'] = 0
            //     }
            //     return obj

            // })
            userid = doc[i]._id
            console.log(userid)
            company = await Company.find({ "user": userid });
            doc[i].company = company[0]

            emailccsend = []

            user = await Facilitator.findOne({ "_id": userid });

            emailcc = await Userrole.find({ "user": userid })
            emailcc.forEach(element => {
                if (element.Role == "Management")
                    emailccsend.push(element.email)
            })
            console.log(emailccsend)
            getemail = await Credential.findOne({ "user": userid });
// res.send(doc[i])
            sendemail.autoReportsDaily(doc[i], company, emailccsend, getemail, user)

        }
    } catch (err) {
        console.log(err)
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})

// Branch Reports

// cron.schedule('15 21 * * *', async() => {

//     try {
//         var today = new Date()
//         today.setHours(21, 0, 0, 0)
//         var yesterday = new Date(today)
//         yesterday.setDate(yesterday.getDate() - 1)
//         yesterday.setHours(21, 01, 0, 0)

//         dailydate = dateFormat(today, "mmmm dS, yyyy");

//         let date = new Date();

//         var firstDay =
//             new Date(date.getFullYear(), date.getMonth(), 1);

//         var lastDay =
//             new Date(date.getFullYear(), date.getMonth() + 1, 0);
//         lastDay.setHours(23, 59, 0, 0)

//         monthlydate = dateFormat(firstDay, "mmmm dS, yyyy");


//         var firstyear = new Date()
//         firstyear.setMonth(3);
//         firstyear.setDate(1);
//         firstyear.setHours(0, 0, 0, 0)
//         var nextyear = new Date()
//         nextyear.setMonth(2);
//         nextyear.setDate(31);
//         nextyear.setFullYear(firstyear.getFullYear() + 1);
//         nextyear.setHours(23, 59, 0, 0)
//         yearlydate = dateFormat(firstyear, "mmmm dS, yyyy");
//         yearlyyear = firstyear.getFullYear() + "-" + (firstyear.getFullYear() + 1)

//         doc = await Patient.aggregate(PipelineBranch.pipeline).allowDiskUse(true)
//         doc.map((obj) => {
//             obj['dailydate'] = dailydate
//             obj['monthlydate'] = monthlydate
//             obj['yearlydate'] = yearlydate
//             obj['yearlyyear'] = yearlyyear

//             return obj

//         })

//         for (let i = 0; i < doc.length; i++) {
//             month = doc[i].monthlydata.hospital
//             month.map((obj) => {
//                 if (obj.hospitalvil == undefined) {
//                     obj['hospitalvil'] = 0

//                 }
//                 if (obj.hospitalconfirmation == undefined) {
//                     obj['hospitalconfirmation'] = 0
//                 }
//                 return obj

//             })
//             daily = doc[i].dailydata.hospital

//             daily.map((obj) => {
//                 if (obj.hospitalvil == undefined) {
//                     obj['hospitalvil'] = 0

//                 }
//                 if (obj.hospitalconfirmation == undefined) {
//                     obj['hospitalconfirmation'] = 0
//                 }
//                 return obj




//             })
//             annual = doc[i].annualdata.hospital

//             annual.map((obj) => {
//                 if (obj.hospitalvil == undefined) {
//                     obj['hospitalvil'] = 0

//                 }
//                 if (obj.hospitalconfirmation == undefined) {
//                     obj['hospitalconfirmation'] = 0
//                 }
//                 return obj

//             })
//             userid = doc[i]._id
//             user = await Userrole.findOne({ "_id": userid });
//             company = await Company.find({ "user": user.user });
//             doc[i].company = company[0]

//             emailccsend = []


//             emailcc = await Userrole.find({ "user": user.user })
//             emailcc.forEach(element => {
//                 if (element.Role == "Management")
//                     emailccsend.push(element.email)
//             })
//             console.log(emailccsend)

//             sendemail.autoReportsDailyBranch(doc[i], company, emailccsend, user)

//         }
//     } catch (err) {
//         console.log(err)
//     }
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// })

// Refferal Reports

// cron.schedule('30 21 * * *', async() => {

//     try {
//         var today = new Date()
//         today.setHours(21, 0, 0, 0)
//         var yesterday = new Date(today)
//         yesterday.setDate(yesterday.getDate() - 1)
//         yesterday.setHours(21, 01, 0, 0)

//         dailydate = dateFormat(today, "mmmm dS, yyyy");

//         let date = new Date();

//         var firstDay =
//             new Date(date.getFullYear(), date.getMonth(), 1);

//         var lastDay =
//             new Date(date.getFullYear(), date.getMonth() + 1, 0);
//         lastDay.setHours(23, 59, 0, 0)

//         monthlydate = dateFormat(firstDay, "mmmm dS, yyyy");


//         var firstyear = new Date()
//         firstyear.setMonth(3);
//         firstyear.setDate(1);
//         firstyear.setHours(0, 0, 0, 0)
//         var nextyear = new Date()
//         nextyear.setMonth(2);
//         nextyear.setDate(31);
//         nextyear.setFullYear(firstyear.getFullYear() + 1);
//         nextyear.setHours(23, 59, 0, 0)
//         yearlydate = dateFormat(firstyear, "mmmm dS, yyyy");
//         yearlyyear = firstyear.getFullYear() + "-" + (firstyear.getFullYear() + 1)

//         doc = await Patient.aggregate(PipelineRefferal.pipeline).allowDiskUse(true)
//         doc.map((obj) => {
//             obj['dailydate'] = dailydate
//             obj['monthlydate'] = monthlydate
//             obj['yearlydate'] = yearlydate
//             obj['yearlyyear'] = yearlyyear

//             return obj

//         })

//         for (let i = 0; i < doc.length; i++) {
//             month = doc[i].monthlydata.hospital
//             month.map((obj) => {
//                 if (obj.hospitalvil == undefined) {
//                     obj['hospitalvil'] = 0

//                 }
//                 if (obj.hospitalconfirmation == undefined) {
//                     obj['hospitalconfirmation'] = 0
//                 }
//                 return obj

//             })
//             daily = doc[i].dailydata.hospital

//             daily.map((obj) => {
//                 if (obj.hospitalvil == undefined) {
//                     obj['hospitalvil'] = 0

//                 }
//                 if (obj.hospitalconfirmation == undefined) {
//                     obj['hospitalconfirmation'] = 0
//                 }
//                 return obj




//             })
//             annual = doc[i].annualdata.hospital

//             annual.map((obj) => {
//                 if (obj.hospitalvil == undefined) {
//                     obj['hospitalvil'] = 0

//                 }
//                 if (obj.hospitalconfirmation == undefined) {
//                     obj['hospitalconfirmation'] = 0
//                 }
//                 return obj

//             })
//             userid = doc[i]._id._id
//             user = await Refferal.findOne({ "_id": userid });
//             company = await Company.find({ "user": user.user });
//             doc[i].company = company[0]

//             emailccsend = []


//             emailcc = await Userrole.find({ "user": user.user })
//             emailcc.forEach(element => {
//                 if (element.Role == "Management")
//                     emailccsend.push(element.email)
//             })
//             console.log(emailccsend)

//             sendemail.autoReportsDailyRefferal(doc[i], company, emailccsend, user)

//         }
//     } catch (err) {
//         console.log(err)
//     }
// }, {
//     scheduled: true,
//     timezone: "Asia/Kolkata"
// })