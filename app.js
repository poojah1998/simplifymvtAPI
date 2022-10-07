const express = require('express');
const bodyparser = require('body-parser')
const { mongoose } = require('./config/db.js')
require('dotenv').config()

const cors = require('cors')

const axios = require('axios');

axios.defaults.headers.common = {
    "X-com-zoho-subscriptions-organizationid": "60011753155",
    // "X-com-zoho-subscriptions-organizationid": "60011581102",

};

const authroute = require('./app/facilitator-register/routes')
const docroute = require('./app/doctor/routes')
const hosroute = require('./app/hospital/routes')
const patroute = require('./app/patient/routes')
const refroute = require('./app/refferal-partner/routes')
const preroute = require('./app/prehospitalzone/router')
const myroute = require('./app/myhospitalzone/router')
const reqroute = require('./app/opinion-request/routes')
const comroute = require('./app/company-details/routes')
const creroute = require('./app/send-email/routes')
const vilroute = require('./app/request-vil/routes')
const confroute = require('./app/patient-confirmation/routes')
const pdfroute = require('./app/pdf-making/routes')
const employee = require('./app/employee/routes')
const reminder = require('./app/reminder/reminder')

const hosauthroute = require('./hospital/hospital-auth/routes')
const hosdetailroute = require('./hospital/hospital-details/routes')
const hosdetailreports = require('./hospital/reports/routes')

const paymentroute = require('./app/payment/routes')
const planroute = require('./app/plans/routes')
const intimationroute = require('./app/pre-intimation/routes')
const opd = require('./app/opd/routes')
const reports = require('./app/reports/routes')
const chatRoute = require('./app/chat/routes')

const hospitalgroup = require('./hospital/hospital-groups/routes')
const autoreports = require('./app/automated-reports/reports')
const hospitalpatient = require('./hospital/hospital-patients/routes')
const hospitalrefferalpartner = require('./hospital/hospital-refferalpartner/routes')
const hospitalCredential = require('./hospital/sendmail/routes')
const hospitalProfile = require('./hospital/hospital-profile/routes')
const hospitalEmail = require('./hospital/hospital-email/routes')
const hospitalOpnion = require('./hospital/hospital-opinion/routes')
const hospitalOpd = require('./hospital/hospital-opd/routes')
const hospitalVil = require('./hospital/hospital-vil/routes')
const hospitalConf = require('./hospital/hospital-conf/routes')
const autoReportHospitalGroup = require('./hospital/reports/auto-group-reports')
const autoReportHospitalUnit = require('./hospital/reports/auto-unit-report')
const hospitalPlan = require('./hospital/hospital-plans/routes')
const disputeManagement = require('./hospital/dispute-management/routes')
const userProfile = require('./app/profile/routes')
const distributorRoutes = require('./app/distributor/routes')
const zohoSub = require('./app/zoho-subscription/controller')
const zohoRoutes = require('./app/zoho-subscription/routes')

const pi = require('./app/Proforma Invoice/routes')
const helmet = require("helmet");

var app = express()


app.use(helmet());

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }))


app.use(cors());
app.options('*', cors());


app.use('/uploads', express.static('uploads'))
app.use('/auth/api', authroute)
app.use('/auth/api', docroute)
app.use('/auth/api', hosroute)
app.use('/auth/api', patroute)
app.use('/auth/api', refroute)
app.use('/auth/api', preroute)
app.use('/auth/api', myroute)
app.use('/auth/api', reqroute)
app.use('/auth/api', comroute)
app.use('/auth/api', creroute)
app.use('/auth/api', vilroute)
app.use('/auth/api', confroute)
app.use('/auth/api', pdfroute)
app.use('/auth/api', paymentroute)
app.use('/auth/api', planroute)
app.use('/auth/api', intimationroute)
app.use('/auth/api', userProfile)
app.use('/auth/api', distributorRoutes)
app.use('/auth/api', opd)
app.use('/auth/api', pi)
app.use('/auth/api', reports)
app.use('/auth/api', chatRoute)
app.use('/auth/api', employee)
app.use('/auth/api', zohoRoutes)


app.use('/auth/api/hospital', hosauthroute)
app.use('/auth/api/hospital', hosdetailroute)
app.use('/auth/api/hospital', hospitalgroup)
app.use('/auth/api/hospital', hosdetailreports)
app.use('/auth/api/hospital', hospitalpatient)
app.use('/auth/api/hospital', hospitalrefferalpartner)
app.use('/auth/api/hospital', hospitalCredential)
app.use('/auth/api/hospital', hospitalProfile)
app.use('/auth/api/hospital', hospitalEmail)
app.use('/auth/api/hospital', hospitalOpnion)
app.use('/auth/api/hospital', hospitalOpd)
app.use('/auth/api/hospital', hospitalVil)
app.use('/auth/api/hospital', hospitalConf)
app.use('/auth/api/hospital', hospitalPlan)
app.use('/auth/api/hospital', disputeManagement)

app.use((error, req, res, next) => {
    console.log(error)
    res.status(505).json({
        message: error.message
    })
})
app.listen(4000, () => console.log('server started at port : 5000'));