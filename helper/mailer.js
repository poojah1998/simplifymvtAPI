// import cron from 'node-cron';
const nodemailer = require('nodemailer');
require('dotenv').config();

let sendMail = async function (to, subject, message) {
    // console.log("111111111111111111");
    const smtpConfig = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_PASS
        }
       
    };
    console.log(process.env.GMAIL_ID);
    console.log(process.env.GMAIL_PASS);


    let transporter = nodemailer.createTransport(smtpConfig);
    let mailOptions = {
        from: `simplify MVT <${process.env.GMAIL_ID}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: message // html body
    };
    try {
        let info = await transporter.sendMail(mailOptions)
        console.log(info,"yessssssssss")
    } catch (error) {
        console.log(error);
    }

}

module.exports = sendMail;