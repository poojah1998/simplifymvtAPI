// import cron from 'node-cron';
const nodemailer = require('nodemailer');

// var cron = require('node-cron');

// cron.schedule('*/10 * * * *', () => {
//   console.log('running a task every 10 minutes');
// });
const express = require('express');
app = express();

let sendMail = async function (to, subject, message) {
    const smtpConfig = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_PASS
        }
    };

    let transporter = nodemailer.createTransport(smtpConfig);
    let mailOptions = {
        from: '"simplify MVT" <info@simply.com>', // sender address
        to: [to,], // list of receivers
        subject: subject, // Subject line
        html: message // html body
    };
    try {
        let info = await transporter.sendMail(mailOptions)
        console.log(info)
    } catch (error) {
        console.log(error);
    }

}