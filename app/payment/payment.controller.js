const mongoose = require('mongoose');
const Patient = require('../patient/patient.model')
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay')
const shortid = require('shortid');
const crypto = require('crypto')
const secret_key = 'gfdhdfgsfdgsdfgsfasdfsdfgdfgsdfsdfsdfsdfs'
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET
})

exports.order = async(req, res, next) => {
    console.log(req.body)
    const options = {
        amount: (req.body.amount) * 100,
        currency: 'INR',
        receipt: shortid.generate(), //any unique id
        payment_capture: 1

    }
    try {
        const response = await razorpay.orders.create(options)
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: (response.amount) * 100,

        })

    } catch (err) {
        next(err);
    }
}
exports.orderVerify = async(req, res, next) => {
    try {
        const data = crypto.createHmac('sha256', process.env.PAYMENTSECRET)
        data.update(JSON.stringify(req.body))
        const digest = data.digest('hex')
        if (digest === req.headers['x-razorpay-signature']) {
            console.log('request is legit')

            //we can store detail in db and send the response
            res.status(200).json({
                status: 'Success'
            })
        } else {
            res.status(400).send('Invalid signature');
        }


    } catch (err) {
        next(err);
    }
}