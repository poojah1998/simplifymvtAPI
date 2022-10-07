var nodemailer = require('nodemailer');
const Credential = require('./credentials.model')
const Company = require('../company-details/company.model')
const Requestopinion = require('../opinion-request/request.model')
const Facilitator = require('../facilitator-register/facilitator.model')
const Patient = require('../patient/patient.model')
const Designation = require('../profile/model')
const CredentialHospital = require('../../hospital/sendmail/credentials.model')

const Emailcc = require('../send-email/emailcc.model')
const Promise = require('bluebird');
var companyemail
var companypass
    // const baseLink = "localhost:4200/#/opinion/hospitalopinion/";
    // const baseLinkdoc = "localhost:4200/#/opinion/doctoropinion/";
    // const opdlink = "localhost:4200/#/OPDrequest/hospitalOPDrequest/";

// const pilink = "localhost:4200/#/PIrequest/hospitalPIrequest/";
imgurl = "https://devoperation.s3.ap-south-1.amazonaws.com/"

const baseLink = "https://portal.simplifymvt.com/#/opinion/hospitalopinion/";
const opdlink = "https://portal.simplifymvt.com/#/OPDrequest/hospitalOPDrequest/";
const pilink = "https://portal.simplifymvt.com/#/PIrequest/hospitalPIrequest/";
const jwt_decode = require('jwt-decode');

const patientCommentLink = "https://portal.simplifymvt.com/#/comment/add-comment/"
const baseLinkdoc = "https://portal.simplifymvt.com/#/opinion/doctoropinion/";
// const website = "localhost:4200/#/authentication/signin";
const website = "https://portal.simplifymvt.com/#/authentication/partners";

// imgurl = "https://operationfile.s3.ap-south-1.amazonaws.com/"
require('dotenv').config()
var aws = require('aws-sdk')

const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
var fs = require('fs');
var pdf = require('html-pdf');
var mustache = require('mustache');
const { request } = require('http');

module.exports.patientadmin = async function(patient, user, req) {
    var userid = user._id

    const company = await Company.find({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1

    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        logger: true,
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }


    });
    attachments = []
    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });
    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: `${user.email}`,
            cc: `${emailccsend[0].email}`,
            subject: 'New Patient has been added',
            html: `<h1> New Patient Created</h1>
            <ul>
            <li> <strong>Patient Name:</strong> ${patient.name} </li>
            <li> <strong>Gender:</strong> ${patient.gender} </li>
            <li> <strong>Country:</strong> ${patient.country} </li>
            <li> <strong>Age:</strong> ${patient.age} ${patient.ageduration} </li>
            <li> <strong>Contact No:</strong> ${patient.contact} </li>
            <li> <strong>Emailid:</strong> ${patient.emailid} </li>
            <li> <strong>Treatment:</strong> ${patient.treatment} </li>
            <li> <strong>MHID:</strong> ${company[0].uhidcode}${patient.mhid} </li>
            <li> <strong>Refferal Partner:</strong> ${patient.refferalpartner.name} </li>
            <li> <strong>Medical History:</strong> ${patient.medicalhistory} </li><br><br>
            Attachments: ${linkSend}<br/><br/>
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            </ul>`,
        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: `${user.email}`,
            cc: `${emailccsend[0].email}`,
            subject: 'New Patient has been added',
            html: `<h1> New Patient Created</h1>
            <ul>
            <li> <strong>Patient Name:</strong> ${patient.name} </li>
            <li> <strong>Gender:</strong> ${patient.gender} </li>
            <li> <strong>Country:</strong> ${patient.country} </li>
            <li> <strong>Age:</strong> ${patient.age} ${patient.ageduration} </li>
            <li> <strong>Contact No:</strong> ${patient.contact} </li>
            <li> <strong>Emailid:</strong> ${patient.emailid} </li>
            <li> <strong>Treatment:</strong> ${patient.treatment} </li>
            <li> <strong>MHID:</strong> ${company[0].uhidcode}${patient.mhid} </li>
            <li> <strong>Refferal Partner:</strong> ${patient.refferalpartner.name} </li>
            <li> <strong>Medical History:</strong> ${patient.medicalhistory} </li>
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            </ul>`,
            attachments: attachments
        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("Error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.hospitalopinion = async function(patient, request, user, emailsto, emailccconcat, req) {
    var userid = user._id
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []
    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
            Please click here and you can submit your opinion <br/>
            
            <a href=${baseLink}${request._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${baseLink}${request._id} <br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Remarks : ${patient.remarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}
            
            </p>`,

        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
            Please click here and you can submit your opinion <br/>
            
            <a href=${baseLink}${request._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${baseLink}${request._id} <br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Remarks : ${patient.remarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,
            attachments: attachments
        };
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.hospitalopinionlimited = async function(patient, request, user, emailsto, emailccconcat, req) {
    var userid = user._id
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []
    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Remarks : ${patient.remarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}
            
            </p>`,

        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
                            
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Remarks : ${patient.remarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,
            attachments: attachments
        };
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.aggregatorHospitalOpinion = async function(patient, request, user, emailsto, emailccconcat, req) {
    var userid = user
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    var decoded = await Facilitator.findById(userid);
    const designation = await Designation.find({ "user": userid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []
    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
            Please click here and you can submit your opinion <br/>
            
            <a href=${baseLink}${request._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${baseLink}${request._id} <br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Remarks : ${patient.remarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}
            
            </p>`,

        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
            Please click here and you can submit your opinion <br/>
            
            <a href=${baseLink}${request._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${baseLink}${request._id} <br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Remarks : ${patient.remarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,
            attachments: attachments
        };
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendIntimation = async function(patient, intimation, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Pre Intimation for ${patient.name} ,${patient.gender} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${intimation.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            Kindly note the intimation for patient ${patient.name} from ${patient.country} who will be coming to hospital soon for suitable treatment. <br/> Please see remark for more details regarding patient<br/><br/>
            Remarks : ${intimation.patientremarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            Please map the patient under ${company[0].name}<br/><br/>
    
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}

            </p>`,

        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Pre Intimation for ${patient.name} ,${patient.gender} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${intimation.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            Kindly note the intimation for patient ${patient.name} from ${patient.country} who will be coming to hospital soon for suitable treatment. <br/> Please see remark for more details regarding patient<br/><br/>
            Remarks : ${intimation.patientremarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            Please map the patient under ${company[0].name}<br/><br/>
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,
            attachments: attachments

        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendIntimationAggegator = async function(patient, intimation, emailsto, emailccconcat, req, user) {
    var userid = user
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    var decoded = await Facilitator.findById(userid);
    const designation = await Designation.find({ "user": userid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Pre Intimation for ${patient.name} ,${patient.gender} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${intimation.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            Kindly note the intimation for patient ${patient.name} from ${patient.country} who will be coming to hospital soon for suitable treatment. <br/> Please see remark for more details regarding patient<br/><br/>
            Remarks : ${intimation.patientremarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            Please map the patient under ${company[0].name}<br/><br/>
    
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}

            </p>`,

        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Pre Intimation for ${patient.name} ,${patient.gender} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${intimation.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
            Kindly note the intimation for patient ${patient.name} from ${patient.country} who will be coming to hospital soon for suitable treatment. <br/> Please see remark for more details regarding patient<br/><br/>
            Remarks : ${intimation.patientremarks}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            Please map the patient under ${company[0].name}<br/><br/>
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}

                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,
            attachments: attachments

        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendOPDRequest = async function(patient, opd, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `OPD Consultation Request for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${opd.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
    
       We have attached medical reports & History of Patient ${patient.name} from ${patient.country}.<br/><br/>
       Patient wants to do the OPD consultation with ${opd.doctorname} or any similar speciality doctor to clarify his/
       her doubts or to know about tentative costs before the travel.<br/><br/>
            <a href=${opdlink}${opd._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${opdlink}${opd._id} <br/><br/>
    
    <strong>Please go through the reports before the OPD if possible, which will enable us to do faster
    consultations 
    </strong><br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            <strong>Kindly confirm us the doctor name, OPD date and time schedule along with the Meeting link which we can
    share with the Patient or our office.</strong><br/><br/>      
    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
    ${decoded.name}<br/>
    ${designation[0].designation}<br/></br>
    <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
    
    ${company[0].name}<br/>
    
    ${arrayItems}

        
    <span>Email:</span>  ${ company[0].companyemail}<br/>
            
    
            Attachments: ${linkSend}
            
            </p>`,



        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `OPD Consultation Request for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${opd.hospitalname}</strong>, <br/><br/>

        Greetings from ${company[0].name} !!<br/><br/>


   We have attached medical reports & History of Patient ${patient.name} from ${patient.country}.<br/><br/>
   Patient wants to do the OPD consultation with ${opd.doctorname} or any similar speciality doctor to clarify his/
   her doubts or to know about tentative costs before the travel.<br/><br/>
        <a href=${opdlink}${opd._id} > Open Report </a>
        
         if you cant click please copy below url and paste in browser
        
        ${opdlink}${opd._id} <br/><br/>

<strong>Please go through the reports before the OPD if possible, which will enable us to do faster
consultations 
</strong><br/><br/>

        <strong>Medical History:</strong><br/>

        ${patient.medicalhistory}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
        <strong>Reports Attached</strong>
        <br/>
        <br/>
        
        <strong>Kindly confirm us the doctor name, OPD date and time schedule along with the Meeting link which we can
share with the Patient or our office.</strong><br/><br/>      
<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>

${company[0].name}<br/>

${arrayItems}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        

        
        </p>`,
            attachments: attachments



        };
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendOPDRequestLimited = async function(patient, opd, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `OPD Consultation Request for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${opd.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
    
       We have attached medical reports & History of Patient ${patient.name} from ${patient.country}.<br/><br/>
       Patient wants to do the OPD consultation with ${opd.doctorname} or any similar speciality doctor to clarify his/
       her doubts or to know about tentative costs before the travel.<br/><br/>
                
    <strong>Please go through the reports before the OPD if possible, which will enable us to do faster
    consultations 
    </strong><br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            <strong>Kindly confirm us the doctor name, OPD date and time schedule along with the Meeting link which we can
    share with the Patient or our office.</strong><br/><br/>      
    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
    ${decoded.name}<br/>
    ${designation[0].designation}<br/></br>
    <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
    
    ${company[0].name}<br/>
    
    ${arrayItems}

        
    <span>Email:</span>  ${ company[0].companyemail}<br/>
            
    
            Attachments: ${linkSend}
            
            </p>`,



        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `OPD Consultation Request for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${opd.hospitalname}</strong>, <br/><br/>

        Greetings from ${company[0].name} !!<br/><br/>


   We have attached medical reports & History of Patient ${patient.name} from ${patient.country}.<br/><br/>
   Patient wants to do the OPD consultation with ${opd.doctorname} or any similar speciality doctor to clarify his/
   her doubts or to know about tentative costs before the travel.<br/><br/>
                
<strong>Please go through the reports before the OPD if possible, which will enable us to do faster
consultations 
</strong><br/><br/>

        <strong>Medical History:</strong><br/>

        ${patient.medicalhistory}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
        <strong>Reports Attached</strong>
        <br/>
        <br/>
        
        <strong>Kindly confirm us the doctor name, OPD date and time schedule along with the Meeting link which we can
share with the Patient or our office.</strong><br/><br/>      
<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>

${company[0].name}<br/>

${arrayItems}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        

        
        </p>`,
            attachments: attachments



        };
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendOPDRequestAggegator = async function(patient, opd, emailsto, emailccconcat, req, user) {
    var userid = user
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    var decoded = await Facilitator.findById(userid);
    const designation = await Designation.find({ "user": userid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `OPD Consultation Request for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${opd.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
    
       We have attached medical reports & History of Patient ${patient.name} from ${patient.country}.<br/><br/>
       Patient wants to do the OPD consultation with ${opd.doctorname} or any similar speciality doctor to clarify his/
       her doubts or to know about tentative costs before the travel.<br/><br/>
            <a href=${opdlink}${opd._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${opdlink}${opd._id} <br/><br/>
    
    <strong>Please go through the reports before the OPD if possible, which will enable us to do faster
    consultations 
    </strong><br/><br/>
    
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            <strong>Kindly confirm us the doctor name, OPD date and time schedule along with the Meeting link which we can
    share with the Patient or our office.</strong><br/><br/>      
    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
    ${decoded.name}<br/>
    ${designation[0].designation}<br/></br>
    <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
    
    ${company[0].name}<br/>
    
    ${arrayItems}

        
    <span>Email:</span>  ${ company[0].companyemail}<br/>
            
    
            Attachments: ${linkSend}
            
            </p>`,



        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `OPD Consultation Request for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${opd.hospitalname}</strong>, <br/><br/>

        Greetings from ${company[0].name} !!<br/><br/>


   We have attached medical reports & History of Patient ${patient.name} from ${patient.country}.<br/><br/>
   Patient wants to do the OPD consultation with ${opd.doctorname} or any similar speciality doctor to clarify his/
   her doubts or to know about tentative costs before the travel.<br/><br/>
        <a href=${opdlink}${opd._id} > Open Report </a>
        
         if you cant click please copy below url and paste in browser
        
        ${opdlink}${opd._id} <br/><br/>

<strong>Please go through the reports before the OPD if possible, which will enable us to do faster
consultations 
</strong><br/><br/>

        <strong>Medical History:</strong><br/>

        ${patient.medicalhistory}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
        <strong>Reports Attached</strong>
        <br/>
        <br/>
        
        <strong>Kindly confirm us the doctor name, OPD date and time schedule along with the Meeting link which we can
share with the Patient or our office.</strong><br/><br/>      
<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>

${company[0].name}<br/>

${arrayItems}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        

        
        </p>`,
            attachments: attachments



        };
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.opdreceived = async function(patient, opd, date, req, userid) {
    var userid = userid
    const user = await Facilitator.find({ "_id": userid });
    const emailccsend = await Emailcc.find({ "user": userid });

    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var mailOptions = {
        from: `${companyemail}`,
        to: `${companyemail}`,
        cc: `${emailccsend[0].email}`,

        replyTo: `${companyemail}`,
        subject: `Confirmation for OPD Request for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${company[0].name}, <br/><br/>
        
        We are glad to confirm you the OPD consultation time for ${patient.name} from Dr ${opd.doctorname} <br/><br/>
        Dr ${opd.doctorname} would consult him on ${date} at Indian Standard time. Kindly ask
        your patient to verify once again as it is Indian standard time.<br/><br/>       
        Patient can login through the given link as below <br/>
        Link: ${opd.meetinglink}<br/><br/>
        Please note that there could be waiting or some delay in case doctor is busy. However Patient is
advised to login on exact same time. If any changes, will be advised to your team before hand.<br/><br/> 
        
Kindly also note that Payment Link for the said consultation is ${opd.paymentlink}. <br/><br/>
   
<strong>Please note - Blank link means we already have given you link as per requirement or payment is not needed.</strong><br/><br/>
${opd.hospitalname}<br/><br/>


<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>

${company[0].name}<br/>

${arrayItems}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        

                
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.aggregatorMail = async function(userFac, facilitator, req) {
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    userid = decoded.id
    const user = await Facilitator.find({ "_id": userid });
    const emailccsend = await Emailcc.find({ "user": userid });

    const company = await Company.find({ "user": userid });
    const companyAgg = await Company.find({ "user": userFac._id });

    const getemail = await Credential.findOne({ "user": userid });

    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });



    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: 'support@simplifymvt.com',
            pass: 'RmvMag@123'
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var mailOptions = {
        from: `support@simplifymvt.com`,
        to: `${userFac.email}`,
        replyTo: `support@simplifymvt.com`,
        subject: `Request for Allowing Partner to Map Queries through ${companyAgg[0].name}`,
        html: `<p>Dear Admin and Management Team<br/>
        ${companyAgg[0].name}, <br/><br/>
        
        Kindly note that, We have recently added new Partner ${facilitator.name}. <br/><br/>
        They have requested to add you as a mapping partner and in future some of the queries could be sent in your name. Any query that will be sent through you, email will be sent from your email address to hospital and you all will be kept in CC for response.<br/><br/>
        Kindly find partner details as below.<br/<br/>
        ${facilitator.name}<br/>
        ${facilitator.mobile}<br/><br/>


<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>

${company[0].name}<br/>

${arrayItems}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        

                
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.opdSent = async function(patient, opd, date, req) {
    var userid = patient.user
    const user = await Facilitator.find({ "_id": userid });
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    companyemail = getemail.email2
    companypass = getemail.password2

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var mailOptions = {
        from: `${companyemail}`,
        to: `${patient.emailid}`,
        cc: `${emailccsend[0].email}`,
        subject: ` OPD Consultation schedule for ${patient.name} ${company[0].uhidcode}${patient.mhid} `,
        html: `<p>Dear ${patient.name}, <br/><br/>
        Greetings from ${company[0].name}

        We are glad to confirm you the OPD consultation with ${opd.doctorname} from ${opd.hospitalname} <br/><br/>

        OPD Consultation is planned on ${date}. This time is as per Indian Standard time and kindly 
confirm time as per your time zone.<br/><br/>

Please note that mostly doctor will be on time but however sometimes due to emergency, this 
schedule may change. We will try to inform you in advance if there is any major change or else some 
delay can be expected.<br/><br/>


Please ensure that you login on the exact time. Our team will coordinate with you in advance for 
better arrangement.<br/><br/>

Kindly find meeting link as below <br/>
Link: ${opd.meetinglink}<br/><br/>

Also find online payment link for your reference<br/>
Link: ${opd.paymentlink}<br/><br/>

   
In case you have paid it to our office, kindly ignore this and if you have not, once you pay the 
amount, kindly send us the details on ${companyemail}<br/><br/>
<strong>Note: If the link is blank, which means either our office will send you a link before the day of OPD for Consultation and payment both. It Could also mean that you may not require payment link if you have paid it at our office or it is free.
</strong><br/><br/>

<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>

${company[0].name}<br/>

${arrayItems}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        

        
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendOpdPiRequest = async function(patient, pi, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })

        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the Teleconsultation done for the patient.
            Kindly find the remarks from the patient after the consultation.<br/><br/>
    
            Remark: ${pi.remark}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            On the basis of this remarks and your consultation, Kindly send us proforma invoice on 
            hospitals letter head with the treatment plan and detailed cost which will help the patient to plan 
            further on their treatment.<strong> Please ensure you also have your Bank details which may be needed 
            for patient to transfer the fund.</strong><br/><br/>
    
            You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
            <a href=${pilink}${pi._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${pilink}${pi._id} <br/><br/>
    
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}

            </p>`,



        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the Teleconsultation done for the patient.
            Kindly find the remarks from the patient after the consultation.<br/><br/>
    
            Remark: ${pi.remark}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            On the basis of this remarks and your consultation, Kindly send us proforma invoice on 
            hospitals letter head with the treatment plan and detailed cost which will help the patient to plan 
            further on their treatment.<strong> Please ensure you also have your Bank details which may be needed 
            for patient to transfer the fund.</strong><br/><br/>
    
            You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
            <a href=${pilink}${pi._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${pilink}${pi._id} <br/><br/>
    
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,

            attachments: attachments


        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendOpdPiRequestLimited = async function(patient, pi, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })

        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the Teleconsultation done for the patient.
            Kindly find the remarks from the patient after the consultation.<br/><br/>
    
            Remark: ${pi.remark}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            On the basis of this remarks and your consultation, Kindly send us proforma invoice on 
            hospitals letter head with the treatment plan and detailed cost which will help the patient to plan 
            further on their treatment.<strong> Please ensure you also have your Bank details which may be needed 
            for patient to transfer the fund.</strong><br/><br/>
                    
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}

            </p>`,



        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the Teleconsultation done for the patient.
            Kindly find the remarks from the patient after the consultation.<br/><br/>
    
            Remark: ${pi.remark}<br/><br/>
    
            On the basis of this remarks and your consultation, Kindly send us proforma invoice on 
            hospitals letter head with the treatment plan and detailed cost which will help the patient to plan 
            further on their treatment.<strong> Please ensure you also have your Bank details which may be needed 
            for patient to transfer the fund.</strong><br/><br/>
    
            
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,

            attachments: attachments


        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendOpinionPiRequest = async function(patient, pi, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the detailed opinion for the Patient.<br/><br/>
    
            Patient is in need of proforma invoice on hospital letter head for further plan. This may be 
            needed for either fund raise, office submission or insurance purposes to be submitted to 
            concerned authorities for treatment progress. We request you to kindly assist us with the same at 
            earliest.<strong>Please send detailed treatment plan along with cost and your bank 
            details.</strong><br/><br/>
             
            Kindly find remarks of the patient if any as below<br/><br/>
     
            Remark: ${pi.remark}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
    
    
            You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
            <a href=${pilink}${pi._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${pilink}${pi._id} <br/><br/>
    
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
    
            For your information, you have given us the opinion as below<br/><br/>
    
            Opinion that was given for that patient by that hospital<br/><br/>
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}

            
            </p>`,



        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the detailed opinion for the Patient.<br/><br/>
    
            Patient is in need of proforma invoice on hospital letter head for further plan. This may be 
            needed for either fund raise, office submission or insurance purposes to be submitted to 
            concerned authorities for treatment progress. We request you to kindly assist us with the same at 
            earliest.<strong>Please send detailed treatment plan along with cost and your bank 
            details.</strong><br/><br/>
             
            Kindly find remarks of the patient if any as below<br/><br/>
     
            Remark: ${pi.remark}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
    
    
            You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
            <a href=${pilink}${pi._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${pilink}${pi._id} <br/><br/>
    
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
    
            For your information, you have given us the opinion as below<br/><br/>
    
            Opinion that was given for that patient by that hospital<br/><br/>
    
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,

            attachments: attachments


        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendOpinionPiRequestLimited = async function(patient, pi, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the detailed opinion for the Patient.<br/><br/>
    
            Patient is in need of proforma invoice on hospital letter head for further plan. This may be 
            needed for either fund raise, office submission or insurance purposes to be submitted to 
            concerned authorities for treatment progress. We request you to kindly assist us with the same at 
            earliest.<strong>Please send detailed treatment plan along with cost and your bank 
            details.</strong><br/><br/>
             
            Kindly find remarks of the patient if any as below<br/><br/>
            Remark: ${pi.remark}<br/><br/>

            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
    
            For your information, you have given us the opinion as below<br/><br/>
    
            Opinion that was given for that patient by that hospital<br/><br/>
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            

            Attachments: ${linkSend}

            
            </p>`,



        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Request for Proforma Invoice for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            We are thankful to you for the detailed opinion for the Patient.<br/><br/>
    
            Patient is in need of proforma invoice on hospital letter head for further plan. This may be 
            needed for either fund raise, office submission or insurance purposes to be submitted to 
            concerned authorities for treatment progress. We request you to kindly assist us with the same at 
            earliest.<strong>Please send detailed treatment plan along with cost and your bank 
            details.</strong><br/><br/>
             
            Kindly find remarks of the patient if any as below<br/><br/>
            Remark: ${pi.remark}<br/><br/>

            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            Remark: ${pi.remark}<br/><br/>

    
            Looking forward to have proforma invoice at the earliest.<br/><br/>
    
            
            <strong> Note: In case doctor has advised for only prescription for the new tests to be done, kindly 
            attach the prescription and send us the same.</strong><br/><br/>      
    
            For your information, you have given us the opinion as below<br/><br/>
    
            Opinion that was given for that patient by that hospital<br/><br/>
    
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            </p>`,

            attachments: attachments


        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendDirectPiAndIntimation = async function(patient, pi, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: ` Preintimation & Proforma Invoice request for ${patient.name} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Kindly note the intimation and issue the PI for ${patient.name} from ${patient.country} who will be coming to hospital soon for the suitable treatment. </strong><br/><br/>
    
            Kindly find the Pre intimation for ${patient.name} from ${patient.country}.<br/><br/>
    
    
          <strong>Also Kindly send us Proforma invoice for the Patient for ${patient.treatment}</strong><br/><br/>
             
          You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
          <a href=${pilink}${pi._id} > Open Report </a>
          
           if you cant click please copy below url and paste in browser
          
          ${pilink}${pi._id} <br/><br/>
    
          Please check remarks for specific notes:
          <br/><br/>
     
        Remark: ${pi.remark}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
      
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        

            Attachments: ${linkSend}

            </p>`,



        };

    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: ` Preintimation & Proforma Invoice request for ${patient.name} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Kindly note the intimation and issue the PI for ${patient.name} from ${patient.country} who will be coming to hospital soon for the suitable treatment. </strong><br/><br/>
    
            Kindly find the Pre intimation for ${patient.name} from ${patient.country}.<br/><br/>
    
    
          <strong>Also Kindly send us Proforma invoice for the Patient for ${patient.treatment}</strong><br/><br/>
             
          You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
          <a href=${pilink}${pi._id} > Open Report </a>
          
           if you cant click please copy below url and paste in browser
          
          ${pilink}${pi._id} <br/><br/>
    
          Please check remarks for specific notes:
          <br/><br/>
     
        Remark: ${pi.remark}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
      
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        
            
            </p>`,
            attachments: attachments



        };

    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendDirectPiAndIntimationLimited = async function(patient, pi, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: ` Preintimation & Proforma Invoice request for ${patient.name} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Kindly note the intimation and issue the PI for ${patient.name} from ${patient.country} who will be coming to hospital soon for the suitable treatment. </strong><br/><br/>
    
            Kindly find the Pre intimation for ${patient.name} from ${patient.country}.<br/><br/>
    
    
          <strong>Also Kindly send us Proforma invoice for the Patient for ${patient.treatment}</strong><br/><br/>
        
    
          Please check remarks for specific notes:
          <br/><br/>
     
        Remark: ${pi.remark}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
      
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        

            Attachments: ${linkSend}

            </p>`,



        };

    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: ` Preintimation & Proforma Invoice request for ${patient.name} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Kindly note the intimation and issue the PI for ${patient.name} from ${patient.country} who will be coming to hospital soon for the suitable treatment. </strong><br/><br/>
    
            Kindly find the Pre intimation for ${patient.name} from ${patient.country}.<br/><br/>
    
    
          <strong>Also Kindly send us Proforma invoice for the Patient for ${patient.treatment}</strong><br/><br/>
             
    
          Please check remarks for specific notes:
          <br/><br/>
     
        Remark: ${pi.remark}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
      
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        
            
            </p>`,
            attachments: attachments



        };

    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendDirectPiAndIntimationAggegator = async function(patient, pi, emailsto, emailccconcat, req, user) {
    var userid = user
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    var decoded = await Facilitator.findById(userid);
    const designation = await Designation.find({ "user": userid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: ` Preintimation & Proforma Invoice request for ${patient.name} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Kindly note the intimation and issue the PI for ${patient.name} from ${patient.country} who will be coming to hospital soon for the suitable treatment. </strong><br/><br/>
    
            Kindly find the Pre intimation for ${patient.name} from ${patient.country}.<br/><br/>
    
    
          <strong>Also Kindly send us Proforma invoice for the Patient for ${patient.treatment}</strong><br/><br/>
             
          You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
          <a href=${pilink}${pi._id} > Open Report </a>
          
           if you cant click please copy below url and paste in browser
          
          ${pilink}${pi._id} <br/><br/>
    
          Please check remarks for specific notes:
          <br/><br/>
     
        Remark: ${pi.remark}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
      
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        

            Attachments: ${linkSend}

            </p>`,



        };

    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: ` Preintimation & Proforma Invoice request for ${patient.name} from ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${pi.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Kindly note the intimation and issue the PI for ${patient.name} from ${patient.country} who will be coming to hospital soon for the suitable treatment. </strong><br/><br/>
    
            Kindly find the Pre intimation for ${patient.name} from ${patient.country}.<br/><br/>
    
    
          <strong>Also Kindly send us Proforma invoice for the Patient for ${patient.treatment}</strong><br/><br/>
             
          You can Send the proforma invoice / prescription by uploading it to the link below:<br/>
          <a href=${pilink}${pi._id} > Open Report </a>
          
           if you cant click please copy below url and paste in browser
          
          ${pilink}${pi._id} <br/><br/>
    
          Please check remarks for specific notes:
          <br/><br/>
     
        Remark: ${pi.remark}<br/><br/>
        Passport Number : ${patient.passportNumber}<br/><br/>
        country : ${patient.country}<br/><br/>
      
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        
            
            </p>`,
            attachments: attachments



        };

    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.pireceived = async function(patient, pi, req, userid) {
    var userid = userid
    const user = await Facilitator.find({ "_id": userid });
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var mailOptions = {
        from: `${companyemail}`,
        to: `${companyemail}`,
        cc: `${emailccsend[0].email}`,
        replyTo: `${companyemail}`,
        subject: `Proforma Invoice for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${company[0].name}, <br/><br/>
        
        Kindly find the attached proforma invoice as per your request. In case of VIL, kindly send the 
        passport copies of patient and attendant/donor at earliest.<br/><br/>
        ${pi.hospitalname}<br/><br/>
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        

        
        </p>`,
        attachments: {
            filename: `${pi.proformainvoice.originalname}`,
            path: `${imgurl}${pi.proformainvoice.key}`
        }

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.piSent = async function(patient, pi, req) {
    var userid = patient.user
    const user = await Facilitator.find({ "_id": userid });
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email2
    companypass = getemail.password2

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var mailOptions = {
        from: `${companyemail}`,
        to: `${patient.emailid}`,
        cc: `${emailccsend[0].email}`,
        replyTo: `${companyemail}`,
        subject: `Proforma Invoice is ready to view from ${pi.hospitalname}. Regards, ${company[0].name} `,
        html: `<p>Dear ${patient.name}, <br/><br/>
        
        Greetings from ${company[0].name}<br/><br/>

        Kindly find attached proforma invoice as per your request.<br/><br/>

        In case of any further query, please feel free to email us on ${companyemail}.<br/><br/>
        ${pi.hospitalname}<br/><br/>

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        
        ${company[0].name}<br/>
        
        ${arrayItems}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        
        
        
        </p>`,
        attachments: {
            filename: `${pi.proformainvoice.originalname}`,
            path: `${imgurl}${pi.proformainvoice.key}`
        }

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.resendHospitalOpinion = async function(patient, request, user, emailsto, emailccconcat, remarks, req) {
    var userid = user._id
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for Patient ${patient.name} ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Remarks:</strong> ${remarks} <br/><br/>
    
    
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
            Please click here and you can submit your opinion<br/>
            
            <a href=${baseLink}${request._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${baseLink}${request._id} <br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
    
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
       
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            Attachments: ${linkSend}

            
            </p>`,


        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for Patient ${patient.name} ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Remarks:</strong> ${remarks} <br/><br/>
    
    
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
            Please click here and you can submit your opinion<br/>
            
            <a href=${baseLink}${request._id} > Open Report </a>
            
             if you cant click please copy below url and paste in browser
            
            ${baseLink}${request._id} <br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
    
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
      
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            
            </p>`,
            attachments: attachments




        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.resendHospitalOpinionLimited = async function(patient, request, user, emailsto, emailccconcat, remarks, req) {
    var userid = user._id
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for Patient ${patient.name} ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Remarks:</strong> ${remarks} <br/><br/>
    
    
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
                
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
            Kindly do the needful.<br/><br/>
       
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            Attachments: ${linkSend}

            
            </p>`,


        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: emailsto,
            cc: emailccconcat,
            subject: `Opinion required for Patient ${patient.name} ${patient.country} ${company[0].uhidcode}${patient.mhid}`,
            html: `<p><strong>Dear ${request.hospitalname}</strong>, <br/><br/>
    
            Greetings from ${company[0].name} !!<br/><br/>
    
            <strong>Remarks:</strong> ${remarks} <br/><br/>
    
    
            We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation <strong>along with Success rate</strong> as per below. <br/><br/>
                
            <strong>Medical History:</strong><br/>
    
            ${patient.medicalhistory}<br/><br/>
            Passport Number : ${patient.passportNumber}<br/><br/>
            country : ${patient.country}<br/><br/>
            <strong>Reports Attached</strong>
            <br/>
            <br/>
            
      
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
            
            
            ${company[0].name}<br/>
            
            ${arrayItems}
            
                
            <span>Email:</span>  ${ company[0].companyemail}<br/>
                    
            
            
            
            </p>`,
            attachments: attachments




        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.opinionemployee = async function(patient, emails, req) {
    var userid = patient[0].user
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var arrayItems = "";
    company[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var html = fs.readFileSync(__dirname + '/templates/opinionemployee.html', 'utf8');
    var options = { format: 'Letter' };
    var htmlContent = mustache.render(html, { "patient": patient });
    htmlContent += `<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>


${company[0].name}<br/>

${arrayItems}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        
`
    var mailOptions = {
        from: `${companyemail}`,
        to: emails,
        subject: `Hospital Assigned for Patient ${patient[0].patientname} from ${patient[0].patientcountry}`,
        html: htmlContent,

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.hospitalopiniondoctor = async function(patient, hospitalopinion, userid) {
    var userid = userid
    const company = await Company.find({ "user": userid });
    const hospitalname = await Requestopinion.findById(hospitalopinion.opinionid);
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: `${hospitalopinion.emailid}`,
            cc: `${emailccsend[0].email}`,
            subject: `Opinion required for Patient ${patient.name} ${patient.country}`,
            html: `<p>Dear ${hospitalopinion.doctorname}, <br/><br/>
    
            Greetings from ${hospitalname.hospitalname} !!<br/><br/>
            
            We have attached medical reports & History of Patient <strong> ${patient.name} </strong> from ${patient.country} basis of medical reports kindly send us your opinion and quotation as per below <br/><br/>
            
            Please <a href=${baseLinkdoc}${hospitalopinion._id}>click here </a> and you can submit your opinion <br/><br/>
            
            if you cant click please copy below url and paste in browser <br/>
            <code>${baseLinkdoc}${hospitalopinion._id}<br/><br/></code>
            
            <strong>Medical History: </strong><br/>
            ${patient.medicalhistory}<br/><br/>
            
            <strong>Reports Attached</strong><br/>
            
            <strong>Opinion format</strong><br/><br/>
            
            Diagnosis in detailed <br/>
            Length of Stay in Country<br/>
            Length of Stay in Hospital<br/>
            Cost of Initial Evaluation<br/>
            Cost of Treatment<br/>
            
            Kindly do the needful.<br/><br/>
            
            Thanks <br/><br/>
            
            Team ${company[0].name}
            <br><br>

            Attachments: ${linkSend}

            
            </p>`,


        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: `${hospitalopinion.emailid}`,
            cc: `${emailccsend[0].email}`,
            subject: `Opinion required for Patient ${patient.name} ${patient.country}`,
            html: `<p>Dear ${hospitalopinion.doctorname}, <br/><br/>
    
            Greetings from ${hospitalname.hospitalname} !!<br/><br/>
            
            We have attached medical reports & History of Patient <strong> ${patient.name} </strong> from ${patient.country} basis of medical reports kindly send us your opinion and quotation as per below <br/><br/>
            
            Please <a href=${baseLinkdoc}${hospitalopinion._id}>click here </a> and you can submit your opinion <br/><br/>
            
            if you cant click please copy below url and paste in browser <br/>
            <code>${baseLinkdoc}${hospitalopinion._id}<br/><br/></code>
            
            <strong>Medical History: </strong><br/>
            ${patient.medicalhistory}<br/><br/>
            
            <strong>Reports Attached</strong><br/>
            
            <strong>Opinion format</strong><br/><br/>
            
            Diagnosis in detailed <br/>
            Length of Stay in Country<br/>
            Length of Stay in Hospital<br/>
            Cost of Initial Evaluation<br/>
            Cost of Treatment<br/>
            
            Kindly do the needful.<br/><br/>
            
            Thanks <br/><br/>
            
            Team ${company[0].name}
            
            </p>`,
            attachments: attachments


        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.hospitalOpinionDoctorHospitalSide = async function(patient, hospitalopinion, hospital) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const hospitalname = await Requestopinion.findById(hospitalopinion.opinionid);
    const hospitalEmail = await CredentialHospital.findOne({ "hospital": hospital })
    var transporter = nodemailer.createTransport({
        host: `${hospitalEmail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: `${hospitalEmail.email1}`,
            pass: `${hospitalEmail.password1}`

        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    attachments = []

    fileSize = 0
    patient.patientProfile.forEach(element => {
        fileSize += element.size
        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    fileSizeMb = (fileSize / 1000000).toFixed(2)
    linkSend = []
    if (fileSizeMb > 15) {
        attachments.forEach(element => {
            linkSend.push(`<a href="${element.path}">${element.path}</a><br>`)
        })
        var mailOptions = {
            from: `${companyemail}`,
            to: `${hospitalopinion.emailid}`,
            subject: `Opinion required for Patient ${patient.name} ${patient.country}`,
            html: `<p>Dear ${hospitalopinion.doctorname}, <br/><br/>
    
            Greetings from ${hospitalname.hospitalname} !!<br/><br/>
            
            We have attached medical reports & History of Patient <strong> ${patient.name} </strong> from ${patient.country} basis of medical reports kindly send us your opinion and quotation as per below <br/><br/>
            
            Please <a href=${baseLinkdoc}${hospitalopinion._id}>click here </a> and you can submit your opinion <br/><br/>
            
            if you cant click please copy below url and paste in browser <br/>
            <code>${baseLinkdoc}${hospitalopinion._id}<br/><br/></code>
            
            <strong>Medical History: </strong><br/>
            ${patient.medicalhistory}<br/><br/>
            
            <strong>Reports Attached</strong><br/>
            
            <strong>Opinion format</strong><br/><br/>
            
            Diagnosis in detailed <br/>
            Length of Stay in Country<br/>
            Length of Stay in Hospital<br/>
            Cost of Initial Evaluation<br/>
            Cost of Treatment<br/>
            
            Kindly do the needful.<br/><br/>
            
            Thanks <br/><br/>
            
            Team ${company[0].name}
            <br><br>

            Attachments: ${linkSend}

            
            </p>`,


        };
    } else {
        var mailOptions = {
            from: `${companyemail}`,
            to: `${hospitalopinion.emailid}`,
            subject: `Opinion required for Patient ${patient.name} ${patient.country}`,
            html: `<p>Dear ${hospitalopinion.doctorname}, <br/><br/>
    
            Greetings from ${hospitalname.hospitalname} !!<br/><br/>
            
            We have attached medical reports & History of Patient <strong> ${patient.name} </strong> from ${patient.country} basis of medical reports kindly send us your opinion and quotation as per below <br/><br/>
            
            Please <a href=${baseLinkdoc}${hospitalopinion._id}>click here </a> and you can submit your opinion <br/><br/>
            
            if you cant click please copy below url and paste in browser <br/>
            <code>${baseLinkdoc}${hospitalopinion._id}<br/><br/></code>
            
            <strong>Medical History: </strong><br/>
            ${patient.medicalhistory}<br/><br/>
            
            <strong>Reports Attached</strong><br/>
            
            <strong>Opinion format</strong><br/><br/>
            
            Diagnosis in detailed <br/>
            Length of Stay in Country<br/>
            Length of Stay in Hospital<br/>
            Cost of Initial Evaluation<br/>
            Cost of Treatment<br/>
            
            Kindly do the needful.<br/><br/>
            
            Thanks <br/><br/>
            
            Team ${company[0].name}
            
            </p>`,
            attachments: attachments


        };
    }


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.opiniondoctor = async function(patient, doctoropinion, userid) {
    var userid = userid
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });

    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var arrayItems = "";

    doctoropinion.treatment.forEach(element => {
        arrayItems += ` <br> Treatment Name: ${element.name} <br/> Type of room: ${element.roomType} <br/> Minimum cost ${element.minCost} USD<br/> Maximum cost ${element.maxCost} USD </br>`;

    });


    var mailOptions = {
        from: `${companyemail}`,
        to: `${doctoropinion.emailid}`,
        cc: `${emailccsend[0].email}`,

        subject: `Thanks for submitting Opinion for Patient ${patient.name} ${patient.country}`,
        html: `<p>Dear ${doctoropinion.doctorname}, <br/><br/>

        Greetings from ${company[0].name} !!<br/><br/>
        
        Thanks for submitting your opinion for <strong> ${patient.name} </strong> from ${patient.country}.<br/><br/>
        
        <strong>Stay in Country: </strong><br/>
        ${doctoropinion.stayincountry} ${doctoropinion.countryduration}<br/><br/>
        
        <strong>Stay in Hospital: </strong><br/>
        ${doctoropinion.stayinhospital} ${doctoropinion.hospitalduration}<br/><br/>    
        
        <strong>Diagnosis: </strong><br/>
        ${doctoropinion.diagnosis} <br/><br/>    

        <strong>Treatment Plan: </strong><br/>
        ${doctoropinion.treatmentplan} <br/><br/>    

        <strong>Initial Evaluation Minimum Cost: </strong><br/>
        ${doctoropinion.initialevaluationminimum} USD<br/><br/>  

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${doctoropinion.initialevaluationmaximum} USD<br/><br/> 

        <strong>Treatment: </strong><br/>
        ${arrayItems}<br/><br/> 

        <strong>remarks: </strong><br/>
        ${doctoropinion.remarks} <br/><br/> 

        Thanks <br/><br/>
        
        Team ${company[0].name}
        
        </p>`



    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.doctortohospital = async function(patient, request, doctoropinion, emailsto, emailccconcat, userid) {
    var userid = userid
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });

    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var arrayItems = "";

    doctoropinion.treatment.forEach(element => {
        arrayItems += ` <br> Treatment Name: ${element.name} <br/> Type of room: ${element.roomType} <br/> Minimum cost ${element.minCost} USD<br/> Maximum cost ${element.maxCost} USD </br>`;

    });
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        replyTo: `${doctoropinion.emailid}`,
        subject: `Opinion submitted for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${doctoropinion.hospitalname}, <br/><br/>
        
        kindly find my opinion as below or you can check the below link for the same.<br/>
        Please <a href=${baseLink}${request._id}> click here</a> and you can read my opinion<br/><br/>
        if you cant click please copy below url and paste in browser<br/>
        <code>${baseLink}${request._id}<br/><br/></code>
        Opinion<br/>
        <strong>Stay in Country: </strong><br/>
        ${doctoropinion.stayincountry} ${doctoropinion.countryduration}<br/><br/>
        
        <strong>Stay in Hospital: </strong><br/>
        ${doctoropinion.stayinhospital} ${doctoropinion.hospitalduration}<br/><br/>    

        <strong>Diagnosis: </strong><br/>
        ${doctoropinion.diagnosis} <br/><br/>    

        <strong>Treatment Plan: </strong><br/>
        ${doctoropinion.treatmentplan} <br/><br/>    


        <strong>Initial Evaluation Minimum Cost: </strong><br/>
        ${doctoropinion.initialevaluationminimum} USD<br/><br/>  

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${doctoropinion.initialevaluationmaximum} USD<br/><br/> 

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${doctoropinion.initialevaluationmaximum} USD<br/><br/> 

        <strong>Treatment: </strong><br/>
        ${arrayItems}<br/><br/> 


        <strong>remarks: </strong><br/>
        ${doctoropinion.remarks} <br/><br/> 

        Thanks <br/><br/>
        
        ${doctoropinion.doctorname}
        
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.doctorToHospitalOwn = async function(patient, request, doctoropinion, emailsto, emailccconcat, hospital) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const hospitalEmail = await CredentialHospital.findOne({ "hospital": hospital })
    var transporter = nodemailer.createTransport({
        host: `${hospitalEmail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: `${hospitalEmail.email1}`,
            pass: `${hospitalEmail.password1}`

        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var arrayItems = "";

    doctoropinion.treatment.forEach(element => {
        arrayItems += ` <br> Treatment Name: ${element.name} <br/> Type of room: ${element.roomType} <br/> Minimum cost ${element.minCost} USD<br/> Maximum cost ${element.maxCost} USD </br>`;

    });
    var mailOptions = {
        from: `${companyemail}`,
        to: `${companyemail}`,
        replyTo: `${doctoropinion.emailid}`,
        subject: `Opinion submitted for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${doctoropinion.hospitalname}, <br/><br/>
        
        kindly find my opinion as below or you can check the below link for the same.<br/>
        Please <a href=${baseLink}${request._id}> click here</a> and you can read my opinion<br/><br/>
        if you cant click please copy below url and paste in browser<br/>
        <code>${baseLink}${request._id}<br/><br/></code>
        Opinion<br/>
        <strong>Stay in Country: </strong><br/>
        ${doctoropinion.stayincountry} ${doctoropinion.countryduration}<br/><br/>
        
        <strong>Stay in Hospital: </strong><br/>
        ${doctoropinion.stayinhospital} ${doctoropinion.hospitalduration}<br/><br/>    

        <strong>Diagnosis: </strong><br/>
        ${doctoropinion.diagnosis} <br/><br/>    

        <strong>Treatment Plan: </strong><br/>
        ${doctoropinion.treatmentplan} <br/><br/>    


        <strong>Initial Evaluation Minimum Cost: </strong><br/>
        ${doctoropinion.initialevaluationminimum} USD<br/><br/>  

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${doctoropinion.initialevaluationmaximum} USD<br/><br/> 

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${doctoropinion.initialevaluationmaximum} USD<br/><br/> 

        <strong>Treatment: </strong><br/>
        ${arrayItems}<br/><br/> 


        <strong>remarks: </strong><br/>
        ${doctoropinion.remarks} <br/><br/> 

        Thanks <br/><br/>
        
        ${doctoropinion.doctorname}
        
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.opinionreceived = async function(patient, received, userid) {
    var userid = userid
    const user = await Facilitator.find({ "_id": userid });

    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var arrayItems = "";

    received.treatment.forEach(element => {
        arrayItems += `<br> Treatment Name: ${element.name} <br/> Type of room: ${element.roomType} <br/> Minimum cost ${element.minCost} USD<br/> Maximum cost ${element.maxCost} USD </br>`;

    });

    var mailOptions = {
        from: `${companyemail}`,
        to: `${companyemail}`,
        cc: `${emailccsend[0].email}`,
        replyTo: `${companyemail}`,
        subject: `Opinion received for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${company[0].name}, <br/><br/>
        
        Thank you for your valuable query and trusting us for your patient.<br/><br/>
        These reports are reviewed by ${received.doctorname} and his opinion is as below and same is attached<br/><br/>
        
        <strong>Opinion</strong><br/><br/>
        <strong>Stay in Country: </strong><br/>
        ${received.stayincountry} ${received.countryduration}<br/><br/>
        
        <strong>Stay in Hospital: </strong><br/>
        ${received.stayinhospital} ${received.hospitalduration}<br/><br/>    

        <strong>Diagnosis: </strong><br/>
        ${received.diagnosis} <br/><br/>  
        
        <strong>Treatment Plan: </strong><br/>
        ${received.treatmentplan} <br/><br/>    

        <strong>Initial Evaluation Minimum Cost: </strong><br/>
        ${received.initialevaluationminimum} USD<br/><br/>  

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${received.initialevaluationmaximum} USD<br/><br/> 

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${received.initialevaluationmaximum} USD<br/><br/> 

        <strong>Treatment: </strong><br/>
        ${arrayItems}<br/><br/> 

        <strong>remarks: </strong><br/>
        ${received.remarks} <br/><br/> 

        In case you have any query, please feel free to contact the undersigned <br/><br/> 

        Thanks <br/><br/>
        
        ${received.hospitalname}
        
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.opinionApproved = async function(received, req) {
    const patient = await Patient.find({ "_id": received.patient });
    const userid = patient[0].user
    const user = await Facilitator.find({ "_id": userid });
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1

    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var arrayItems = "";

    received.treatment.forEach(element => {
        arrayItems += ` <br> Treatment Name: ${element.name} <br/> Type of room: ${element.roomType} <br/> Minimum cost ${element.minCost} USD<br/> Maximum cost ${element.maxCost} USD </br>`;

    });
    var mailOptions = {
        from: `${companyemail}`,
        to: `${patient[0]['role'].email}`,
        cc: `${emailccsend[0].email}`,
        replyTo: `${companyemail}`,
        subject: `Opinion received for Patient ${patient[0].name} ${patient[0].country} `,
        html: `<p>Dear ${patient[0]['role'].name}, <br/><br/>
        
        Kindly find opinion for ${patient[0].name} From ${patient[0].country} for treatment ${patient[0].treatment} which is eligible to send. <br/><br/>
        
        <strong>Opinion</strong><br/><br/>
        <strong>Stay in Country: </strong><br/>
        ${received.stayincountry} ${received.countryduration}<br/><br/>
        
        <strong>Stay in Hospital: </strong><br/>
        ${received.stayinhospital} ${received.hospitalduration}<br/><br/>    
        
        <strong>Treatment Plan: </strong><br/>
        ${received.treatmentplan} <br/><br/>    

        <strong>Initial Evaluation Minimum Cost: </strong><br/>
        ${received.initialevaluationminimum} USD<br/><br/>  

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${received.initialevaluationmaximum} USD<br/><br/> 

        <strong>Treatment: </strong><br/>
        ${arrayItems}<br/><br/> 

        <strong>remarks: </strong><br/>
        ${received.remarks} <br/><br/> 

        Kindly verify it and send it to the patient from your login <br/><br/> 

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        
        ${company[0].name}<br/>
        
        ${address}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sendreportstopatient = async function(patient, filename, patient1, user, doctorprofile, res, trans, opiniondata, eng, ccsend, req, sentopinion) {
    var userid = user._id
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    // const emailccsend = await Emailcc.find({ "user": userid });
    if (req != undefined) {

        let token = req.headers.authorization.split(' ')[1]
        var decoded = jwt_decode(token);
        var designation = await Designation.find({ "user": decoded.branchid });
        var address = "";
        company[0].address.forEach(element => {
            address += `${element.point1} <br/>`;

        });
    }


    companyemail = getemail.email2
    companypass = getemail.password2
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 465,
        secure: true, // true for 465, false for other ports
        logger: true,
        secureConnection: false,
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var html
    if (opiniondata == "NIL") {
        if (patient1.branchoffice == 'NAN') {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportnotrans-format2.html', 'utf8');

                }
            });

        } else {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans-format2.html', 'utf8');

                }
            });
        }
    } else {
        if (patient1.branchoffice == 'NAN') {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreport.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreport-format2.html', 'utf8');

                }
            });

        } else {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranch.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranch-format2.html', 'utf8');

                }
            });
        }

    }
    if (eng == "NIL") {
        if (patient1.branchoffice == 'NAN') {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html1 = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportnotrans-format2.html', 'utf8');

                }

            });

        } else {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html1 = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans-format2.html', 'utf8');

                }

            });
        }
    }
    var options = {

        format: 'letter',
        orientation: "potrait",

    };

    var htmlContent = mustache.render(html, { "dataObj": trans });
    if (opiniondata != "NIL" && eng == "NIL") {
        var htmlContenteng = mustache.render(html1, { "dataObj": opiniondata });

    }

    var attachments = [];
    if (opiniondata != "NIL" && eng == "NIL") {
        const rest1 = await pdf.create(htmlContenteng, options)
        let pdfToBuffer1 = Promise.promisify(rest1.__proto__.toBuffer, { context: rest1 });
        let bufferResult1 = await pdfToBuffer1();

        attachments.push({
            filename: 'patientreportenglish' + '.pdf',
            content: bufferResult1,
            contentType: 'application/pdf'
        })

    }

    pdf.create(htmlContent, options).toBuffer(async function(err, rest) {

        attachments.push({
            filename: filename + '.pdf',
            content: rest,
            contentType: 'application/pdf'
        })
        attachments.forEach(async element => {
            var params = {
                Bucket: process.env.BUCKETNAME,
                Key: new Date().toISOString().replace(/:/g, '-') + `opinion.pdf`,
                Body: element.content,
                ACL: 'public-read',
                ContentType: "application/pdf'"
            };
            if (!patient[0].download) {
                await s3.upload(params, async function(err, data) {
                    sentopinion.opnionPdf.push(data.Location)
                    await sentopinion.save();

                });
            }


        })

        docotorProfilePDF = fs.readFileSync(__dirname + '/templates/doctorprofile.html', 'utf8');
        var options = { format: 'Letter' };
        var i;

        if (doctorprofile.length) {
            for (i = 0; i < doctorprofile.length; i++) {
                if (doctorprofile[i].source == 'prehospital') {
                    const htmldcotorProfile = mustache.render(docotorProfilePDF, { "dataObj": doctorprofile[i] })
                    const rest2 = await pdf.create(htmldcotorProfile, options)
                    let pdfToBuffer = Promise.promisify(rest2.__proto__.toBuffer, { context: rest2 });
                    let bufferResult = await pdfToBuffer();
                    var params = {
                        Bucket: process.env.BUCKETNAME,
                        Key: new Date().toISOString().replace(/:/g, '-') + `${doctorprofile[i].doctorname}.pdf`,
                        Body: bufferResult,
                        ACL: 'public-read',
                        ContentType: "application/pdf'"
                    };
                    await s3.upload(params, async function(err, data) {
                        sentopinion.doctorPdf.push(data.Location)
                        await sentopinion.save();

                    });
                    attachments.push({
                        filename: `${doctorprofile[i].doctorname}` + ".pdf",
                        content: bufferResult,
                        contentType: 'application/pdf'
                    })
                } else if (doctorprofile[i].source == 'myhospital') {
                    if (doctorprofile[i].doctorprofile != "NAN" && doctorprofile[i].doctorprofile != undefined) {
                        attachments.push({
                            filename: doctorprofile[i].doctorprofile.originalname,
                            path: `${imgurl}${doctorprofile[i].doctorprofile.key}`,
                            contentType: `${doctorprofile[i].doctorprofile.mimetype}`
                        })
                    }
                }


            }
        }

        if (req != undefined) {

            var mailOptions = {
                from: `${companyemail}`,
                to: `${patient1.emailid}`,
                cc: `${ccsend}`,
                subject: `Opinion for ${patient1.name} / ${patient1.country} is ready to view. Regards: ${company[0].name}`,
                html: `<p>Dear ${patient1.name}, <br/><br/>
            
                    Greetings from ${company[0].name} !!<br/><br/>
                    
                    Kindly find attached opinion and doctors profile for your medical reports  <br/><br/>
                    In case you have any query please feel free to contact us on  <a href="mailto:${companyemail}">${companyemail}</a> <br/>
            
            
                    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
                    ${decoded.name}<br/>
                    ${designation[0].designation}<br/></br>
                    <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
                    
                    
                    ${company[0].name}<br/>
                    
                    ${address}
                    
                        
                    <span>Email:</span>  ${ company[0].companyemail}<br/>
                            
                    
                    
                    </p>`,
                attachments: attachments

            };
        }
        if (patient[0].download) {
            filename = encodeURIComponent(filename) + '.pdf'
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
            res.setHeader('Content-type', 'application/pdf')
                // res.write(rest);
            res.send(rest);
        } else {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log("error", error);
                }
                console.log('Message sent: %s', info.messageId);
            });

        }
    });



}
module.exports.downloadDoctorProfile = async function(doctorprofile, res) {
    docotorProfilePDF = fs.readFileSync(__dirname + '/templates/doctorprofile.html', 'utf8');
    var options = { format: 'Letter' };
    if (doctorprofile.length) {
        for (i = 0; i < doctorprofile.length; i++) {
            const htmldcotorProfile = mustache.render(docotorProfilePDF, { "dataObj": doctorprofile[i] })
            const rest2 = await pdf.create(htmldcotorProfile, options)
            let pdfToBuffer = Promise.promisify(rest2.__proto__.toBuffer, { context: rest2 });
            let bufferResult = await pdfToBuffer();

            filename = encodeURIComponent('doctor') + '.pdf'
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
            res.setHeader('Content-type', 'application/pdf')
            res.send(bufferResult);
        }
    }
}

module.exports.sendreportstoaddpatient = async function(patient, filename, patient1, user, doctorprofile, res, trans, opiniondata, eng, ccsend, req) {
    var userid = user._id
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    // const emailccsend = await Emailcc.find({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email2
    companypass = getemail.password2
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 465,
        secure: true, // true for 465, false for other ports
        logger: true,
        secureConnection: false,
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var html
    if (opiniondata == "NIL") {
        if (patient1.branchoffice == 'NAN') {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportnotrans-format2.html', 'utf8');

                }
            });

        } else {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans-format2.html', 'utf8');

                }
            });
        }
    } else {
        if (patient1.branchoffice == 'NAN') {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreport.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreport-format2.html', 'utf8');

                }
            });

        } else {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranch.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html = fs.readFileSync(__dirname + '/templates/patientreportbranch-format2.html', 'utf8');

                }
            });
        }

    }
    if (eng == "NIL") {
        if (patient1.branchoffice == 'NAN') {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html1 = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportnotrans-format2.html', 'utf8');

                }

            });

        } else {
            patient.forEach(element => {
                if (element.model == 'Format 3') {
                    html1 = fs.readFileSync(__dirname + '/templates/format3.html', 'utf8');
                } else if (element.model == 'Format 1 - Only Medical Comparison') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans.html', 'utf8');

                } else if (element.model == 'Format 2 - Detail with Other information') {
                    html1 = fs.readFileSync(__dirname + '/templates/patientreportbranchnotrans-format2.html', 'utf8');

                }

            });
        }
    }
    var options = {

        format: 'letter',
        orientation: "potrait",

    };

    var htmlContent = mustache.render(html, { "dataObj": trans });
    if (opiniondata != "NIL") {
        var htmlContenteng = mustache.render(html1, { "dataObj": opiniondata });

    }

    var attachments = [];
    if (opiniondata != "NIL") {
        const rest1 = await pdf.create(htmlContenteng, options)
        let pdfToBuffer1 = Promise.promisify(rest1.__proto__.toBuffer, { context: rest1 });
        let bufferResult1 = await pdfToBuffer1();

        attachments.push({
            filename: 'patientreportenglish' + '.pdf',
            content: bufferResult1,
            contentType: 'application/pdf'
        })

    }


    pdf.create(htmlContent, options).toBuffer(async function(err, rest) {

        attachments.push({
            filename: filename + '.pdf',
            content: rest,
            contentType: 'application/pdf'
        })
        docotorProfilePDF = fs.readFileSync(__dirname + '/templates/doctorprofile.html', 'utf8');
        var options = { format: 'Letter' };
        var i;

        if (doctorprofile.length) {
            for (i = 0; i < doctorprofile.length; i++) {
                if (doctorprofile[i].source == 'prehospital') {
                    const htmldcotorProfile = mustache.render(docotorProfilePDF, { "dataObj": doctorprofile[i] })
                    const rest2 = await pdf.create(htmldcotorProfile, options)
                    let pdfToBuffer = Promise.promisify(rest2.__proto__.toBuffer, { context: rest2 });
                    let bufferResult = await pdfToBuffer();
                    attachments.push({
                        filename: `${doctorprofile[i].doctorname}` + ".pdf",
                        content: bufferResult,
                        contentType: 'application/pdf'
                    })
                } else if (doctorprofile[i].source == 'myhospital') {
                    if (doctorprofile[i].doctorprofile != "NAN" && doctorprofile[i].doctorprofile != undefined) {
                        attachments.push({
                            filename: doctorprofile[i].doctorprofile.originalname,
                            path: `${imgurl}${doctorprofile[i].doctorprofile.key}`,
                            contentType: `${doctorprofile[i].doctorprofile.mimetype}`
                        })
                    }
                }


            }
        }

        var mailOptions = {
            from: `${companyemail}`,
            to: `${patient[0].email}`,
            cc: `${ccsend}`,

            subject: `Opinion for ${patient1.name} / ${patient1.country} is ready to view. Regards: ${company[0].name}`,
            html: `<p>Dear ${patient1.name}, <br/><br/>
            
                    Greetings from ${company[0].name} !!<br/><br/>
                    
                    Kindly find attached opinion and doctors profile for your medical reports  <br/><br/>
                    In case you have any query please feel free to contact us on  <a href="mailto:${companyemail}">${companyemail}</a> <br/>
            
                    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
                    ${decoded.name}<br/>
                    ${designation[0].designation}<br/></br>
                    <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
                    
                    
                    ${company[0].name}<br/>
                    
                    ${address}
                    
                        
                    <span>Email:</span>  ${ company[0].companyemail}<br/>
                            
                    
                    
                    </p>`,
            attachments: attachments

        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("error", error);
            }
            console.log('Message sent: %s', info.messageId);
        });


    });



}
module.exports.requestvil = async function(vil, patient, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        secure: true, // use SSL
        logger: true,

        port: 465, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var attachments = [];
    for (let i = 0; i < vil.passports.length; i++) {
        attachments.push({
            filename: `${vil.passports[i].originalname}`,
            path: `${imgurl}${vil.passports[i].key}`

        })
    }
    var html = fs.readFileSync(__dirname + '/templates/requestvil.html', 'utf8');
    var options = { format: 'Letter' };
    var htmlContent = mustache.render(html, { "vil": vil });
    htmlContent += `<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>


${company[0].name}<br/>

${address}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        
`
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        replyTo: `${companyemail}`,
        subject: `VIL required  for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
        html: htmlContent,
        attachments: attachments

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.requestvilresend = async function(vil, patient, emailsto, emailccconcat, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var attachments = [];
    for (let i = 0; i < vil.passports.length; i++) {
        attachments.push({
            filename: `${vil.passports[i].originalname}`,
            path: `${imgurl}${vil.passports[i].key}`

        })
    }
    var html = fs.readFileSync(__dirname + '/templates/requestvilresend.html', 'utf8');
    var options = { format: 'Letter' };
    var htmlContent = mustache.render(html, { "vil": vil });
    var htmlContent = mustache.render(html, { "vil": vil });
    htmlContent += `<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>


${company[0].name}<br/>

${address}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        
`
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        replyTo: `${companyemail}`,
        subject: `VIL required  for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
        html: htmlContent,
        attachments: attachments

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.requestdirectvil = async function(vil, patient, emailsto, emailccconcat, req) {

    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var attachments = [];
    for (let i = 0; i < vil.passports.length; i++) {
        attachments.push({
            filename: `${vil.passports[i].originalname}`,
            path: `${imgurl}${vil.passports[i].key}`

        })
    }
    for (let i = 0; i < patient.patientProfile.length; i++) {
        attachments.push({
            filename: `${patient.patientProfile[i].originalname}`,
            path: `${imgurl}${patient.patientProfile[i].key}`

        })
    }
    var html = fs.readFileSync(__dirname + '/templates/requestvildirect.html', 'utf8');
    var options = { format: 'Letter' };
    var htmlContent = mustache.render(html, { "vil": vil });
    htmlContent += `<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>


${company[0].name}<br/>

${address}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        
`
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        replyTo: `${companyemail}`,
        subject: `VIL required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
        html: htmlContent,
        attachments: attachments

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.requestdirectvilAggegator = async function(vil, patient, emailsto, emailccconcat, req, user) {

    var userid = user
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    var decoded = await Facilitator.findById(userid);
    const designation = await Designation.find({ "user": userid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var attachments = [];
    for (let i = 0; i < vil.passports.length; i++) {
        attachments.push({
            filename: `${vil.passports[i].originalname}`,
            path: `${imgurl}${vil.passports[i].key}`

        })
    }
    for (let i = 0; i < patient.patientProfile.length; i++) {
        attachments.push({
            filename: `${patient.patientProfile[i].originalname}`,
            path: `${imgurl}${patient.patientProfile[i].key}`

        })
    }
    var html = fs.readFileSync(__dirname + '/templates/requestvildirect.html', 'utf8');
    var options = { format: 'Letter' };
    var htmlContent = mustache.render(html, { "vil": vil });
    htmlContent += `<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>


${company[0].name}<br/>

${address}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        
`
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        replyTo: `${companyemail}`,
        subject: `VIL required for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
        html: htmlContent,
        attachments: attachments

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.requestdirectvilresend = async function(vil, patient, emailsto, emailccconcat, req) {

    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    var attachments = [];
    for (let i = 0; i < vil.passports.length; i++) {
        attachments.push({
            filename: `${vil.passports[i].originalname}`,
            path: `${imgurl}${vil.passports[i].key}`

        })
    }
    for (let i = 0; i < vil.patientProfile.length; i++) {
        attachments.push({
            filename: `${vil.patientProfile[i].originalname}`,
            path: `${imgurl}${vil.patientProfile[i].key}`

        })
    }
    var html = fs.readFileSync(__dirname + '/templates/requestvildirectresend.html', 'utf8');

    var options = { format: 'Letter' };
    var htmlContent = mustache.render(html, { "vil": vil });
    htmlContent += `<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>


${company[0].name}<br/>

${address}

    
<span>Email:</span>  ${ company[0].companyemail}<br/>
        
`
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        replyTo: `${companyemail}`,
        subject: ` VIL required for Patient ${vil.patientname} ${vil.country}`,
        html: htmlContent,
        attachments: attachments

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.sentvil = async function(sentvil, patient, ccsend, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    const emailccsend = await Emailcc.find({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    ccsend.push(emailccsend[0].email)
    companyemail = getemail.email2
    companypass = getemail.password2
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });

    var mailOptions = {
        from: `${companyemail}`,
        to: `${patient.emailid}`,
        cc: `${ccsend}`,

        subject: `Visa Invitation letter from ${sentvil.hospitalname}`,
        html: `<p>Dear ${patient.name}, <br/><br/>

        Greetings from ${company[0].name} !!<br/><br/>
        
        Kindly find Attached Visa Invitation Letter from<strong> ${sentvil.hospitalname} </strong>.<br/><br/>
        
        Same has been sent to <strong>embassy of India</strong> and kindly carry the print out for your visa document submission.<br/><br>
        
        In case of any assistance, Kindly do email us on ${companyemail} <br/><br/>

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        
        ${company[0].name}<br/>
        
        ${address}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        
        </p>`,

        attachments: [{ // utf-8 string as an attachment
                filename: `${sentvil.villetter.originalname}`,
                path: `${imgurl}${sentvil.villetter.key}`
            },

        ]

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.patientconfirmation = async function(conf, patient, emailsto, emailccconcat, date, coordinatorTime, req) {
    var userid = patient.user
    const company = await Company.find({ "user": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    conf.ticket.forEach(element => {

        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });
    if (conf.villette != undefined) {
        attachments.push({ // utf-8 string as an attachment
            filename: `${conf.villetter['originalname']}`,
            path: `${imgurl}${conf.villetter['key']}`
        })
    }
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        subject: `Arrival Information for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
        html: `
        <p>Dear ${conf.hospitalname}, <br/><br/>

        Greetings from ${company[0].name} !!<br/><br/>

        Kindly note the intimation and arrival details of the patient ${patient.name} 
        from ${patient.country} will be coming for Treatment. Request you to arrange the cab for the pick-up of Patient & Our Coordinator as well in-case coordinator is coming.<br/><br/> 

        <strong>Patient Details</strong><br/><br/>

        <table style="width:40%; border: 1px solid black;border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Patient Name</th>
          <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${patient.name}</td>
        </tr>
        <tr>
          <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Treatment</th>
          <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${patient.treatment}</td>
        </tr>
        <tr>
          <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Country:</th>
          <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${patient.country}</td>
        </tr>
        <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">No. of cabs required</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.cabs}</td>
      </tr>
      </table><br/></br/>

      <strong>Flight Details</strong><br/><br/>

      <table style="width:40%; border: 1px solid black;border-collapse: collapse;">
      <tr>
      <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Flight Name</th>
      <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.flightName}</td>
    </tr>
      <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Flight No.</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.flightNo}</td>
      </tr>
      <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Date & Time of Arrival</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${date}</td>
      </tr>
      <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Contact Person</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.contactPerson}</td>
      </tr>
      <tr>
      <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Contact No.</th>
      <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.contactPersonNo}</td>
    </tr>
    <tr>
    <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Coordinator Address</th>
    <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.coordinatorAddress}</td>
  </tr>
  <tr>
  <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Coordinator Pick up time</th>
  <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${coordinatorTime}</td>
</tr>
    </table><br/></br/>
<strong>Remarks:</strong> ${conf.remarks}<br/></br/>

    Please do the needful and map the patient, donor and attendant under ${company[0].name}. Any consultation, investigation, treatment taken by any member should be mapped under ${company[0].name}. <br/> <br/>
    
    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
    ${decoded.name}<br/>
    ${designation[0].designation}<br/></br>
    <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
    
    
    ${company[0].name}<br/>
    
    ${address}
    
        
    <span>Email:</span>  ${ company[0].companyemail}<br/>
            
    
        
        </p>`,

        attachments: attachments

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.patientconfirmationAggegator = async function(conf, patient, emailsto, emailccconcat, date, coordinatorTime, req, user) {
    var userid = user
    const company = await Company.find({ "user": userid });

    const getemail = await Credential.findOne({ "user": userid });
    companyemail = getemail.email1
    companypass = getemail.password1
    var decoded = await Facilitator.findById(userid);
    const designation = await Designation.find({ "user": userid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    attachments = []

    conf.ticket.forEach(element => {

        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });
    if (conf.villette != undefined) {
        attachments.push({ // utf-8 string as an attachment
            filename: `${conf.villetter['originalname']}`,
            path: `${imgurl}${conf.villetter['key']}`
        })
    }
    var mailOptions = {
        from: `${companyemail}`,
        to: emailsto,
        cc: emailccconcat,
        subject: `Arrival Information for ${patient.name}, ${patient.gender}, ${patient.age} ${patient.ageduration} from ${patient.country} for ${patient.treatment} ${company[0].uhidcode}${patient.mhid}`,
        html: `
        <p>Dear ${conf.hospitalname}, <br/><br/>

        Greetings from ${company[0].name} !!<br/><br/>

        Kindly note the intimation and arrival details of the patient ${patient.name} 
        from ${patient.country} will be coming for Treatment. Request you to arrange the cab for the pick-up of Patient & Our Coordinator as well in-case coordinator is coming.<br/><br/> 

        <strong>Patient Details</strong><br/><br/>

        <table style="width:40%; border: 1px solid black;border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Patient Name</th>
          <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${patient.name}</td>
        </tr>
        <tr>
          <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Treatment</th>
          <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${patient.treatment}</td>
        </tr>
        <tr>
          <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Country:</th>
          <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${patient.country}</td>
        </tr>
        <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">No. of cabs required</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.cabs}</td>
      </tr>
      </table><br/></br/>

      <strong>Flight Details</strong><br/><br/>

      <table style="width:40%; border: 1px solid black;border-collapse: collapse;">
      <tr>
      <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Flight Name</th>
      <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.flightName}</td>
    </tr>
      <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Flight No.</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.flightNo}</td>
      </tr>
      <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Date & Time of Arrival</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${date}</td>
      </tr>
      <tr>
        <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Contact Person</th>
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.contactPerson}</td>
      </tr>
      <tr>
      <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Contact No.</th>
      <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.contactPersonNo}</td>
    </tr>
    <tr>
    <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Coordinator Address</th>
    <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${conf.coordinatorAddress}</td>
  </tr>
  <tr>
  <th style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">Coordinator Pick up time</th>
  <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${coordinatorTime}</td>
</tr>
    </table><br/></br/>
<strong>Remarks:</strong> ${conf.remarks}<br/></br/>

    Please do the needful and map the patient, donor and attendant under ${company[0].name}. Any consultation, investigation, treatment taken by any member should be mapped under ${company[0].name}. <br/> <br/>
    
    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
    ${decoded.name}<br/>
    ${designation[0].designation}<br/></br>
    <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
    
    
    ${company[0].name}<br/>
    
    ${address}
    
        
    <span>Email:</span>  ${ company[0].companyemail}<br/>
            
    
        
        </p>`,

        attachments: attachments

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.refferalLogin = async function(refferal, userid, username, password, req) {

    const company = await Company.find({ "user": userid });
    const user = await Facilitator.find({ "_id": userid });
    const getemail = await Credential.findOne({ "user": userid });
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "user": decoded.branchid });
    var address = "";
    company[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    companyemail = getemail.email1
    companypass = getemail.password1
    var transporter = nodemailer.createTransport({
        host: `${getemail.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: companyemail,
            pass: companypass
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });


    var mailOptions = {
        from: `${companyemail}`,
        to: `${refferal.emailid}`,
        subject: `Refferal Partner Login Credentials`,
        html: `<p>Dear ${refferal.name}, <br/><br/>
        Greetings from  ${company[0].name} !!<br/><br/>

        Welcome aboard. We at ${company[0].name} are keen to support the patients who seek better and affordable medical care, we are sure that you will play a big role in assisting people around you.<br/><br/>

        We believe in transparency and we know that everyones health deserves more and that is why we are focussed on assuring better healthcare for Patients. We hope that you will strive on the same vision that we carry to assist as many people as possible.<br/><br/>        
      
        Kindly find your Login Credentials as below <br/><br/>

        Website: <code>${website}</code><br/>
        Email id: ${refferal.emailid}<br/>
        Password: ${password}<br/><br/>

        On your first login, you will be asked to reset the password and kindly do so for better security.<br/><br/>

        In case of any query, feel free to contact us at support@magnusmedi.com <br/><br/>

        Looking forward to see you soon in person <br/><br/>
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        
        ${company[0].name}<br/>
        
        ${address}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
                
        
        
        </p>`,



    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.autoReportsDaily = async function(rp, company, emailccsend, getemail, user) {

    companyemail = getemail.email2
    companypass = getemail.password2
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587, // port for secure SMTP
        auth: {
            user: 'reports@simplifymvt.com',
            pass: 'RmvMag@123'

        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    html = fs.readFileSync(__dirname + '/templates/dailyreports.html', 'utf8');
    var htmlContent = mustache.render(html, { "dataObj": rp });
    htmlEmail = fs.readFileSync(__dirname + '/templates/daily-email-reports.html', 'utf8');
    var htmlContentEmail = mustache.render(htmlEmail, { "dataObj": rp });
    var attachments = [];
    var options = {

        format: 'letter',
        orientation: "potrait",

    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer1 = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult1 = await pdfToBuffer1();

    attachments.push({
        filename: `Daily Report ${rp.dailydate} ${company[0].name}` + '.pdf',
        content: bufferResult1,
        contentType: 'application/pdf'
    })


    var mailOptions = {
        from: 'reports@simplifymvt.com',
        to: `${user.email}`,
        cc: `${emailccsend}`,
        subject: `Daily Reports ${rp.dailydate} ${company[0].name}`,
        html: `<p>Dear ${company[0].name}, <br/><br/>

        
        Kindly find the daily report attached for your reference. <br/><br/>
        Also find attached reports for current month and current financial year data for reference. <br/><br/>
${htmlContentEmail}
        Thanks <br/><br/>
                
        </p>`,

        attachments: attachments

    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.autoReportsDailyBranch = async function(rp, company, emailccsend, user) {


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587, // port for secure SMTP
        auth: {
            user: 'reports@simplifymvt.com',
            pass: 'RmvMag@123'

        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    html = fs.readFileSync(__dirname + '/templates/dailyreports.html', 'utf8');
    var htmlContent = mustache.render(html, { "dataObj": rp });
    htmlEmail = fs.readFileSync(__dirname + '/templates/daily-email-reports.html', 'utf8');
    var htmlContentEmail = mustache.render(htmlEmail, { "dataObj": rp });
    var attachments = [];
    var options = {

        format: 'letter',
        orientation: "potrait",

    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer1 = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult1 = await pdfToBuffer1();

    attachments.push({
        filename: `Daily Report ${rp.dailydate} ${user.name}-${company[0].name}` + '.pdf',
        content: bufferResult1,
        contentType: 'application/pdf'
    })


    var mailOptions = {
        from: 'reports@simplifymvt.com',
        to: `${user.email}`,
        cc: `${emailccsend}`,
        subject: `Daily Reports ${rp.dailydate} ${user.name}-${company[0].name}`,
        html: `<p>Dear ${user.name}, <br/><br/>

        
        Kindly find the daily report attached for your reference. <br/><br/>
        Also find attached reports for current month and current financial year data for reference. <br/><br/>
        ${htmlContentEmail}

        Thanks <br/><br/>
                
        </p>`,

        attachments: attachments

    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.autoReportsDailyRefferal = async function(rp, company, emailccsend, user) {


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587, // port for secure SMTP
        auth: {
            user: 'reports@simplifymvt.com',
            pass: 'RmvMag@123'

        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });
    html = fs.readFileSync(__dirname + '/templates/dailyreports.html', 'utf8');
    var htmlContent = mustache.render(html, { "dataObj": rp });
    htmlEmail = fs.readFileSync(__dirname + '/templates/daily-email-reports.html', 'utf8');
    var htmlContentEmail = mustache.render(htmlEmail, { "dataObj": rp });
    var attachments = [];
    var options = {

        format: 'letter',
        orientation: "potrait",

    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer1 = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult1 = await pdfToBuffer1();

    attachments.push({
        filename: `Daily Report ${rp.dailydate} ${user.name}-${company[0].name}` + '.pdf',
        content: bufferResult1,
        contentType: 'application/pdf'
    })


    var mailOptions = {
        from: 'reports@simplifymvt.com',
        to: `${user.emailid}`,
        cc: `${emailccsend}`,
        subject: `Daily Reports ${rp.dailydate} ${user.name}-${company[0].name}`,
        html: `<p>Dear ${user.name}, <br/><br/>

        
        Kindly find the daily report attached for your reference. <br/><br/>
        Also find attached reports for current month and current financial year data for reference. <br/><br/>
        ${htmlContentEmail}

        Thanks <br/><br/>
                
        </p>`,

        attachments: attachments

    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.facilitatorAdminOtp = async function(otp, username, email) {
    const generatedotp = otp
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'support@simplifymvt.com', // generated ethereal user
            pass: 'RmvMag@123', // generated ethereal password
        },
    });
    var mailOptions = {
        from: 'support@simplifymvt.com',
        to: `${email}`,
        subject: `Forgot Password`,
        html: `<p>Dear ${username}, <br/><br/>
    
            
        We understand that you have forgotten your password. <br/><br/>
        We are here to assist you, Kindly verify <br>the OTP No:<b style = "fontsize : 24px"> ${otp} </b>and reset the password.<br/><br/>
    
        Always Happy to Help<br>
        Team SimplifyMVT <br/><br/>
                
        </p>`,
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}

module.exports.updatedFacilitatorPassword = async function(username, pass, email) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'support@simplifymvt.com', // generated ethereal user
            pass: 'RmvMag@123', // generated ethereal password
        },
    });
    var mailOptions = {
        from: 'support@simplifymvt.com',
        to: `${email}`,
        subject: `Password Updated Sucessfully`,
        html: `<p>Dear ${username}, <br/><br/>


        Kindly note that your password has been successfully reset <br><br>
        
        New password is: <b> ${pass} </b> <br><br>
        
        Kindly do not share with anyone. <br><br>
        
       <b> Note: Incase you have not done this reset, kindly send email to support@simplifyMVT.com</b> <br><br>
        
        Thanks <br>
        Team SimplifyMVT
                
        </p>`,



    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.reminderVil = async function(user, hospital, patient, hospitalCred, requestvil, res, emailcc) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: `${hospitalCred.email1}`, // generated ethereal user
            pass: `${hospitalCred.password1}`, // generated ethereal password
        },
    });
    var mailOptions = {
        from: `${hospitalCred.email1}`,
        to: `${user.email}`,
        cc: `${emailcc}`,
        subject: `Status for Visa Application for ${patient.name} from ${patient.country}`,
        html: `<p>Dear ${patient.companyname}, <br/><br/>

        Greetings from ${hospital.name.name}<br/><br/>

        We once again thank you for choosing our hospital for your Patient.<br/><br/>

        We have sent you a Visa invitation letter for ${patient.name} under ${requestvil.doctorname} on ${res.createdAt}. Kindly find the VIL attached once again for your reference.<br/><br/>

        Kindly let us know the Visa Status for the patient, Have they applied for the Visa?<br><br>
    
        Let us know in case we need to push it from the embassy. <br><br>

        Please reply your comment on this patient on below link - <a href=${patientCommentLink}${patient._id}> Add Comment</a>  <br/><br/>
      

        Thanks <br>
                
        </p>`,



    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.reminderOpinion = async function name(user, hospital, patient, hospitalCred, res, emailcc) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: `${hospitalCred.email1}`, // generated ethereal user
            pass: `${hospitalCred.password1}`, // generated ethereal password
        },
    });
    var arrayItems = "";

    res.treatment.forEach(element => {
        arrayItems += ` <br> Treatment Name: ${element.name} <br/> Type of room: ${element.roomType} <br/> Minimum cost ${element.minCost} USD<br/> Maximum cost ${element.maxCost} USD </br>`;

    });
    var mailOptions = {
        from: `${hospitalCred.email1}`,
        to: `${user.email}`,
        cc: `${emailcc}`,
        subject: `Status for ${patient.name} from ${patient.country}`,
        html: `<p>Dear ${patient.companyname}, <br/><br/>

        Greetings from ${hospital.name.name}<br/><br/>

        We have sent you a opinion for ${patient.name} from ${patient.country} under ${res.doctorname} on ${res.createdAt}. Kindly find opinion once again attached for your reference.<br/><br/>

        Kindly let us know how we can assist you further and by when we will get the passport copies for Visa Invitation Letter.<br><br>

        Please reply your comment on this patient on below link - <a href=${patientCommentLink}${patient._id}> Add Comment</a><br/><br/>
      
        <strong>Opinion</strong><br/><br/>
        <strong>Stay in Country: </strong><br/>
        ${res.stayincountry} ${res.countryduration}<br/><br/>
        
        <strong>Stay in Hospital: </strong><br/>
        ${res.stayinhospital} ${res.hospitalduration}<br/><br/>    

        <strong>Diagnosis: </strong><br/>
        ${res.diagnosis} <br/><br/>  
        
        <strong>Treatment Plan: </strong><br/>
        ${res.treatmentplan} <br/><br/>    

        <strong>Initial Evaluation Minimum Cost: </strong><br/>
        ${res.initialevaluationminimum} USD<br/><br/>  

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${res.initialevaluationmaximum} USD<br/><br/> 

        <strong>Treatment: </strong><br/>
        ${arrayItems} USD<br/><br/> 

        <strong>remarks: </strong><br/>
        ${res.remarks} <br/><br/> 
        Thanks <br>
                
        </p>`,



    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.autoMatedBackup = async function(buffer, email, name, date, designation, company, address, credential) {


    var transporter = nodemailer.createTransport({
        host: `${credential.host}`,
        port: 587, // port for secure SMTP
        auth: {
            user: credential.email1,
            pass: credential.password1
        },
        tls: {
            rejectUnauthorized: false
        },
        dkim: {
            domainName: 'simplifymvt.com',
            keySelector: 'default',
            privateKey: process.env.DKIMKEY,
        }

    });


    var mailOptions = {
        from: `${credential.email1}`,
        to: `${email}`,
        subject: `Back up of SimplifyMVT till ${date}`,
        html: `<p> Dear ${name}, <br/><br/>

        Kindly find your Back up Till ${date}<br/><br/>


        Thanks <br/><br/>
        ${name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${company[0].logosize1}"><br/><br>
        
        
        ${company[0].name}<br/>
        
        ${address}
        
            
        <span>Email:</span>  ${ company[0].companyemail}<br/>
        </p>`,

        attachments: {
            filename: `SimplifyMVT-Backup-${date}.xlsx`,
            content: buffer
        },


    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}