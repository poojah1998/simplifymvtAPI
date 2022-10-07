const axios = require('axios');
const cron = require('node-cron');
const Zoho = require('./model');
var uniqid = require('uniqid');
const Facilitator = require('../facilitator-register/facilitator.model');
const Hospital = require('../../hospital/hospital-auth/auth.model');


cron.schedule('*/40 * * * *', async() => {
    try {
        data = {
            refresh_token: process.env.ZOHO_REFRESH_TOKEN,
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET
        }
        const token = await axios.post(`https://accounts.zoho.in/oauth/v2/token?refresh_token=${data.refresh_token}&client_id=${data.client_id}&client_secret=${data.client_secret}&grant_type=refresh_token`)
        deleteAllToken = await Zoho.deleteMany();
        const zoho = new Zoho()
        zoho.data = token.data
        await zoho.save()
        console.log('token saved')
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})

exports.postPlan = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        console.log('token', token)
        data = {
            plan_code: uniqid('plan-'),
            name: `${req.body.name} - ${req.body.interval_unit}`,
            recurring_price: req.body.recurring_price,
            interval: req.body.interval,
            interval_unit: req.body.interval_unit,
            product_id: '685751000000013541',
            custom_fields: [{
                    label: 'query_limit',
                    value: req.body.query_limit,
                },
                {
                    label: 'user_limit',
                    value: req.body.user_limit,
                },
                {
                    label: 'partner_limit',
                    value: req.body.partner_limit,
                },
                {
                    label: 'myHospitalVisibility',
                    value: req.body.myHospitalVisibility,
                },
                {
                    label: 'hospitalVisibility',
                    value: req.body.hospitalVisibility,
                },
                {
                    label: 'doctorVisibility',
                    value: req.body.doctorVisibility,
                },
                {
                    label: 'myDoctorVisibility',
                    value: req.body.myDoctorVisibility,
                },
                {
                    label: 'zoneVisibility',
                    value: req.body.zoneVisibility,
                },
                {
                    label: 'myZoneVisibility',
                    value: req.body.myZoneVisibility,
                },
                {
                    label: 'source',
                    value: req.body.source,
                }
            ],
        }

        const plan = await axios.post('https://subscriptions.zoho.in/api/v1/plans', data, { headers: { "Authorization": `Bearer ${token}` } })
        res.send({ message: 'success' })
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}
exports.getAllPlanFac = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const plan = await axios.get('https://subscriptions.zoho.in/api/v1/plans', { headers: { "Authorization": `Bearer ${token}` } })
        const result = plan.data.plans.filter(plan => plan.custom_fields[plan.custom_fields.length - 1].value == 'Facilitator');
        res.send(result)
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}
exports.getAllPlanHos = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const plan = await axios.get('https://subscriptions.zoho.in/api/v1/plans', { headers: { "Authorization": `Bearer ${token}` } })
        const result = plan.data.plans.filter(plan => plan.custom_fields[plan.custom_fields.length - 1].value == 'Hospital');
        res.send(result)
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}

exports.zohoPutPlan = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        data = {
            plan_code: req.body.plan_code,
            name: `${req.body.name} - ${req.body.interval_unit}`,
            recurring_price: req.body.recurring_price,
            interval: req.body.interval,
            interval_unit: req.body.interval_unit,
            product_id: '685751000000013541',
            custom_fields: [{
                    label: 'query_limit',
                    value: req.body.query_limit,
                },
                {
                    label: 'user_limit',
                    value: req.body.user_limit,
                },
                {
                    label: 'partner_limit',
                    value: req.body.partner_limit,
                },
                {
                    label: 'myHospitalVisibility',
                    value: req.body.myHospitalVisibility,
                },
                {
                    label: 'hospitalVisibility',
                    value: req.body.hospitalVisibility,
                },
                {
                    label: 'doctorVisibility',
                    value: req.body.doctorVisibility,
                },
                {
                    label: 'myDoctorVisibility',
                    value: req.body.myDoctorVisibility,
                },
                {
                    label: 'zoneVisibility',
                    value: req.body.zoneVisibility,
                },
                {
                    label: 'myZoneVisibility',
                    value: req.body.myZoneVisibility,
                },
                {
                    label: 'source',
                    value: req.body.source,
                }
            ],
        }
        const plan = await axios.put(`https://subscriptions.zoho.in/api/v1/plans/${req.params.planCode}`, data, { headers: { "Authorization": `Bearer ${token}` } })
        res.send({ message: 'success' })
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}
exports.zohoDelPlan = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token

        const plan = await axios.delete(`https://subscriptions.zoho.in/api/v1/plans/${req.params.planCode}`, { headers: { "Authorization": `Bearer ${token}` } })
        res.send({ message: 'success' })
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}

exports.zohoSubscription = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        data = {
            customer_id: `${req.body.customer_id}`,
            plan: req.body.plan,
            auto_collect: false
        }
        const subscription = await axios.post('https://subscriptions.zoho.in/api/v1/subscriptions', data, { headers: { "Authorization": `Bearer ${token}` } })

        const fac = await Facilitator.findOne({ customer_id: req.body.customer_id })
        const hos = await Hospital.findOne({ customer_id: req.body.customer_id })

        if (fac) {
            fac.subscription_id = subscription.data.subscription.subscription_id
            await fac.save()
        } else if (hos) {
            hos.subscription_id = subscription.data.subscription.subscription_id
            await hos.save()
        }
        res.send({ message: 'success' })
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}
exports.getAllZohoSubscription = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const subscription = await axios.get('https://subscriptions.zoho.in/api/v1/subscriptions', { headers: { "Authorization": `Bearer ${token}` } })
        res.send(subscription.data)
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}
exports.getAllZohoPlan = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const plan = await axios.get('https://subscriptions.zoho.in/api/v1/plans', { headers: { "Authorization": `Bearer ${token}` } })
        res.send(plan.data)
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}
exports.getAllZohoCustomers = async(req, res, next) => {
    try {
        const tokenData = await Zoho.find({})
        const token = tokenData[tokenData.length - 1].data.access_token
        const customer = await axios.get('https://subscriptions.zoho.in/api/v1/customers', { headers: { "Authorization": `Bearer ${token}` } })
        res.send(customer.data)
    } catch (err) {
        if (err.response) {
            next(err.response.data)

        } else {
            next(err)

        }
    }
}