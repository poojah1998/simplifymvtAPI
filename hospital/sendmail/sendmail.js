var nodemailer = require('nodemailer');
const Hospital = require('../hospital-auth/auth.model')
const Credential = require('./credentials.model')
const HospitalDetails = require('../hospital-details/details.model')
const HospitalProfile = require('../hospital-profile/profile.model')
const Facilitator = require('../../app/facilitator-register/facilitator.model')
const Company = require('../../app/company-details/company.model')
const HospitalBank = require('../hospital-details/bank.model')
const Designation = require('../hospital-profile/profile.model')
const jwt_decode = require('jwt-decode');

const Promise = require('bluebird');
const { ObjectId } = require('mongodb');

imgurl = "https://devoperation.s3.ap-south-1.amazonaws.com/"

const baseLink = "https://portal.simplifymvt.com/#/opinion/hospitalopinion/";
const opdlink = "https://portal.simplifymvt.com/#/OPDrequest/hospitalOPDrequest/";
const pilink = "https://portal.simplifymvt.com/#/PIrequest/hospitalPIrequest/";

const baseLinkdoc = "https://portal.simplifymvt.com/#/opinion/doctoropinion/";
// const website = "localhost:4200/#/authentication/signin";
const website = "https://portal.simplifymvt.com/#/authentication/partners";
const reffetalHospital = "https://portal.simplifymvt.com/#/authentication/hospital/partner";
doctorLink = "https://portal.simplifymvt.com/#/hospital/doctor-opinion/"
    // imgurl = "https://operationfile.s3.ap-south-1.amazonaws.com/"

var fs = require('fs');
var pdf = require('html-pdf');
var mustache = require('mustache');
const { request } = require('http');
require('dotenv').config()
var aws = require('aws-sdk')

const s3 = new aws.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECERETACCESSKEY,
    region: process.env.REGION,
});
module.exports.sendHospitalVil = async function(attachments, hospitalid, patient, facilitator, hospitalname, emailccsend, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const company = await Company.findOne({ "user": facilitator._id })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var arrayItems = "";
    details[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });


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



    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${facilitator.email}`,
        cc: `${emailccsend}`,
        subject: `Visa Invitation letter for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,
        html: `<p>Dear ${company.name}, <br/><br/>
        Greetings from ${hospitalname}<br/><br/>
        Kindly find Visa invitation letter attached for your reference for the patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment}.<br/><br/>
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${arrayItems}

        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
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
module.exports.sendHospitalVilMail = async function(attachments, hospitalid, patient, facilitator, hospitalname, emailccsend, email, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const company = await Company.findOne({ "user": facilitator._id })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var arrayItems = "";
    details[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });

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



    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${email}`,
        subject: `Visa Invitation letter for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,
        html: `<p>Dear ${company.name}, <br/><br/>
        Greetings from ${hospitalname}<br/><br/>
        Kindly find Visa invitation letter attached for your reference for the patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment}.<br/><br/>
        
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${arrayItems}

        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
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
module.exports.sendHospitalVilToEmbassy = async function(attachments, hospitalid, patient, facilitator, hospitalname, emailccsend, doctorname, embassyEmailTo, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const company = await Company.findOne({ "user": facilitator._id })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var arrayItems = "";
    details[0].address.forEach(element => {
        arrayItems += `${element.point1} <br/>`;

    });


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



    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${embassyEmailTo}`,
        cc: `${emailccsend}`,
        subject: `Visa Invitation letter for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,
        html: `<p>Respected Excellency, <br/><br/>
        Greetings from ${hospitalname}<br/><br/>
        Please find attached Visa invite for the ${patient.name} who is looking for Medical treatment at 
        our hospital under ${doctorname}.<br/><br/>        
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${arrayItems}

        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>    
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

module.exports.sendOpinionToFacilitator = async function(patient, received, emailCcSend, emailTo, hospitalid, type, res, req, userid) {
    var userid = userid

    const user = await Facilitator.find({ "_id": userid });
    const company = await Company.find({ "user": userid });
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
    const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
    const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
    const hospitalBank = await HospitalBank.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });

    received.hospitalLogo = hospital.logosize1
    received.patientName = patient.name
    received.patientCountry = patient.country
    received.patientTreatment = patient.treatment
    received.mhid = patient.mhid
    received.address = hospital.address
    received.companyEmail = hospital.companyemail
    received.hospitalUsername = hospitalUsername.name['name']
    received.signName = decoded['name']

    received.hospitalUserDesignation = designation[0].designation
    received.hospitalUserSignature = designation[0].documentSignature['key']

    received.beneficiaryName = hospitalBank.beneficiaryName
    received.accountNo = hospitalBank.accountNo
    received.accountType = hospitalBank.accountType
    received.bankName = hospitalBank.bankName
    received.branch = hospitalBank.branch
    received.bankAaddress = hospitalBank.address
    received.city = hospitalBank.city
    received.state = hospitalBank.state
    received.ifscCode = hospitalBank.ifscCode
    received.branchCode = hospitalBank.branchCode
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
    if (received.hospitalid == '5ce78bb866261379f15e8467') {
        html = fs.readFileSync(__dirname + '/templates/manipal-fac.html', 'utf8');
        var htmlContent = mustache.render(html, { "dataObj": received });
    } else {
        html = fs.readFileSync(__dirname + '/templates/opinionhospital.html', 'utf8');
        var htmlContent = mustache.render(html, { "dataObj": received });

    }

    var attachments = [];
    var options = {
        // format: 'letter',
        // orientation: "potrait",
        format: 'A4',
        width: "11in",
        height: "15.596in"
    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    attachments.push({
        filename: `Opinion ${patient.name}` + '.pdf',
        content: bufferResult,
        contentType: 'application/pdf'
    })

    var arrayItems = "";

    received.treatment.forEach(element => {
        arrayItems += ` <br> Treatment Name: ${element.name} <br/> Type of room: ${element.roomType} <br/> Minimum cost ${element.minCost} USD<br/> Maximum cost ${element.maxCost} USD </br>`;

    });
    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailTo.email1}`,
        cc: `${emailCcSend}`,
        replyTo: `${hospitalEmail.email1}`,
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

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}

        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
       
        </p>`,
        attachments: attachments

    };
    if (type == 'Download') {
        filename = encodeURIComponent('Opinion') + '.pdf'
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
        res.setHeader('Content-type', 'application/pdf')
        res.send(bufferResult);
    } else {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("error", error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    }


}



module.exports.sendPreIntimation = async function(pre, patient, emaailCcSend, emailTo, req, userid) {
    var userid = userid
    const user = await Facilitator.find({ "_id": userid });
    const company = await Company.find({ "user": userid });
    const hospitalEmail = await Credential.findOne({ "hospital": pre.hospital })
    const details = await HospitalDetails.find({ "hospital": pre.hospital })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });


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



    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailTo.email1}`,
        cc: `${emaailCcSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Acknowledgement of Pre intimation for ${patient.name} ${patient.country} `,
        html: `<p>Dear ${company[0].name}, <br/><br/>
        
        We have recieved your Intimation for ${patient.name} from ${patient.country}.<br/><br/>

        Thank you for showing trust and choosing our hospital for treatment.<br/><br/>

        <strong>Kindly note:</strong> This mail is not acceptance of patient as your patient, as it depends on other factors and we have not cross checked.<br/><br/>

        We are waiting for Opinion or passport details for further communication<br/><br/>

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}

        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
       
        </p>`,

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.opdSent = async function(patient, opd, date, emailCcSend, emailTo, hospital, req, userid) {
    var userid = userid
    const user = await Facilitator.find({ "_id": userid });
    const company = await Company.find({ "user": userid });
    const hospitalEmail = await Credential.findOne({ "hospital": hospital })
    const details = await HospitalDetails.find({ "hospital": hospital })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });

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

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailTo.email1}`,
        cc: `${emailCcSend}`,
        replyTo: `${hospitalEmail.email1}`,
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

     

<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>

${details[0].name}<br/>

${address}

<span>Email:</span> ${decoded.email}<br/>
        
<span>Contact:</span>${decoded.mobile}<br/>   
        
        </p>`,




    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}


module.exports.sendProformaInvoice = async function(patient, pi, emailCcSend, emailTo, attachments, hospitalid, req, userid) {
    var userid = userid

    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const company = await Company.findOne({ "user": userid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });

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

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailTo.email1}`,
        cc: `${emailCcSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Proforma Invoice for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${company.name}, <br/><br/>
        
        Kindly find the attached proforma invoice as per your request. In case of VIL, kindly send the 
        passport copies of patient and attendant/donor at earliest.<br/><br/>

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
        
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

module.exports.approvedPatient = async function(approved, patient, emailCcSend, emailTo, hospitalid, req, userid) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const company = await Company.findOne({ "user": userid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
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

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailTo.email1}`,
        cc: `${emailCcSend}`,
        replyTo: `${hospitalEmail.email1}`,

        subject: `Patient ${patient.name} from ${patient.country} is approved `,
        html: `<p>Dear ${company.name}, <br/><br/>

        We thank you for choosing our hospital for your valued patients. <br/><br/>

        Patient ${patient.name} from ${patient.country} is MAPPED under you at the moment and we would be glad to register the patient on his arrival. <br/><br/>


        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   

        </p>`,



    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}


module.exports.assignHospital = async function(patient, queryassign, emailsto, emailscc, hospital, groupName, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospital })
    const details = await HospitalDetails.find({ "hospital": hospital })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    var transporter = nodemailer.createTransport({
        host: `${hospitalEmail.host}`,
        port: 587, // port for secure SMTPs
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

    patient.patientProfile.forEach(element => {

        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailsto}`,
        cc: `${emailscc}`,
        subject: `Query Assign for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,
        html: `Kindly find the reports attached for patient that we have added in the platform. <br/><br/>

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>  
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
module.exports.hospitalOpinionDoctor = async function(patient, hospitalopinion, req) {
    let token = req.headers.authorization.split(' ')[1]

    var decoded = jwt_decode(token);

    const hospitalEmail = await Credential.findOne({ "hospital": decoded.id })
    const details = await HospitalDetails.find({ "hospital": decoded.id })
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    var transporter = nodemailer.createTransport({
        host: `${hospitalEmail.host}`,
        port: 587, // port for secure SMTPs
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

    patient.patientProfile.forEach(element => {

        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });


    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${hospitalopinion.emailId}`,
        subject: `Opinion required for Patient ${patient.name} ${patient.country}`,
        html: `<p>Dear ${hospitalopinion.doctorName}, <br/><br/>
    
            Greetings from ${details[0].name} !!<br/><br/>
            
            We have attached medical reports & History of Patient <strong> ${patient.name} </strong> from ${patient.country} basis of medical reports kindly send us your opinion and quotation as per below <br/><br/>
         
            Please <a href=${doctorLink}${hospitalopinion._id}>click here </a> and you can submit your opinion <br/><br/>
            
            if you cant click please copy below url and paste in browser <br/>
            <code>${doctorLink}${hospitalopinion._id}<br/><br/></code>

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
            
            <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
            ${decoded.name}<br/>
            ${designation[0].designation}<br/></br>
            <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
            
            ${details[0].name}<br/>
            
            ${address}
            
            <span>Email:</span> ${decoded.email}<br/>
                    
            <span>Contact:</span>${decoded.mobile}<br/>  
            <br><br>


            
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
module.exports.opinionDoctor = async function(hospitalopinion, doctoropinion) {


    const hospitalEmail = await Credential.findOne({ "hospital": hospitalopinion.hospital })
    const details = await HospitalDetails.find({ "hospital": hospitalopinion.hospital })

    var transporter = nodemailer.createTransport({
        host: `${hospitalEmail.host}`,
        port: 587, // port for secure SMTPs
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
        from: `${hospitalEmail.email1}`,
        to: `${hospitalopinion.emailId}`,
        subject: `Thanks for submitting Opinion for Patient ${hospitalopinion.patientId.name} ${hospitalopinion.patientId.country}`,
        html: `<p>Dear ${doctoropinion.doctorName}, <br/><br/>

        Greetings from ${details[0].name} !!<br/><br/>
        
        Thanks for submitting your opinion for <strong> ${hospitalopinion.patientId.name} </strong> from ${hospitalopinion.patientId.country}.<br/><br/>
        
        <strong>Stay in Country: </strong><br/>
        ${doctoropinion.stayInCountry} ${doctoropinion.countryDuration}<br/><br/>
        
        <strong>Stay in Hospital: </strong><br/>
        ${doctoropinion.stayInHospital} ${doctoropinion.hospitalDuration}<br/><br/>    
        
        <strong>Diagnosis: </strong><br/>
        ${doctoropinion.diagnosis} <br/><br/>    

        <strong>Treatment Plan: </strong><br/>
        ${doctoropinion.treatmentPlan} <br/><br/>    

        <strong>Initial Evaluation Minimum Cost: </strong><br/>
        ${doctoropinion.initialEvaluationMinimum} USD<br/><br/>  

        <strong>Initial Evaluation Maximum Cost: </strong><br/>
        ${doctoropinion.initialEvaluationMaximum} USD<br/><br/> 

        <strong>Treatment: </strong><br/>
        ${arrayItems}<br/><br/> 

        <strong>remarks: </strong><br/>
        ${doctoropinion.remarks} <br/><br/> 

        Thanks <br/><br/>
        
        Team ${details[0].name}
        
        </p>`



    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}
module.exports.assignHospitalRefferal = async function(patient, queryassign, emailsto, emailscc, hospital, decoded, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospital })
    const details = await HospitalDetails.find({ "hospital": hospital })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
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

    patient.patientProfile.forEach(element => {

        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailsto}`,
        cc: `${emailscc}`,
        subject: `Opinion required for patient ${patient.name} from country ${patient.country} by ${decoded.partnerName} `,
        html: `
        Dear ${queryassign.hospitalName},<br><br>
        Greetings from ${decoded.partnerName} !!<br><br>
       
        We have attached medical reports & History of Patient ${patient.name} from ${patient.country}. On basis of medical reports kindly send us your opinion and quotation along with Success rate as per below. <br/><br/>

        <strong>Medical History:</strong> ${patient.medicalhistory}<br><br>
        <strong>Remarks:</strong> ${patient.remarks}<br><br>
        Reports Attached<br><br>
        Kindly do the needful.<br><br>
        
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
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
module.exports.sendHospitalOpinionFac = async function(patient, send, hospitalid, ccSend, doctorProfile, res, req) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    send.signName = decoded['name']

    send.hospitalUserDesignation = designation[0].designation
    send.hospitalUserSignature = designation[0].documentSignature['key']

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



    if (send.hospitalId == '5ce78bb866261379f15e8467') {
        html = fs.readFileSync(__dirname + '/templates/manipal.html', 'utf8');
        var htmlContent = mustache.render(html, { "dataObj": send });
    } else {
        html = fs.readFileSync(__dirname + '/templates/hos-added-opinion.html', 'utf8');
        var htmlContent = mustache.render(html, { "dataObj": send });

    }
    var attachments = [];
    var options = {
        // format: 'letter',
        // orientation: "potrait",
        format: 'A4',
        width: "11in",
        height: "15.596in"
    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    attachments.push({
        filename: `Opinion ${patient.name}` + '.pdf',
        content: bufferResult,
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
        await s3.upload(params, async function(err, data) {
            send.opnionPdf.push(data.Location)
            await send.save();

        });

    })
    doctorProfilePDF = fs.readFileSync(__dirname + '/templates/doctorprofile.html', 'utf8');
    var options = { format: 'Letter' };
    var i;

    if (doctorProfile.length) {
        for (i = 0; i < doctorProfile.length; i++) {
            const htmlDoctorProfile = mustache.render(doctorProfilePDF, { "dataObj": doctorProfile[i] })
            const rest1 = await pdf.create(htmlDoctorProfile, options)
            let pdfToBuffer1 = Promise.promisify(rest1.__proto__.toBuffer, { context: rest1 });
            let bufferResult1 = await pdfToBuffer1();
            var params = {
                Bucket: process.env.BUCKETNAME,
                Key: new Date().toISOString().replace(/:/g, '-') + `${doctorProfile[i].doctorname}.pdf`,
                Body: bufferResult1,
                ACL: 'public-read',
                ContentType: "application/pdf'"
            };
            await s3.upload(params, async function(err, data) {
                send.doctorPdf.push(data.Location)
                await send.save();

            });
            attachments.push({
                filename: `${doctorProfile[i].doctorname}` + ".pdf",
                content: bufferResult1,
                contentType: 'application/pdf'
            })



        }
    }
    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${send.emailTo}`,
        cc: `${ccSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Opinion for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${send.companyName}, <br/><br/>
        
        Greetings from ${send.hospitalName} <br/><br/>

        We are thankful to you for choosing our hospital for your Patient. <br/><br/>
        Kindly find attached opinion from our Medical team along with the profile. <br/><br/>

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
       
        </p>`,
        attachments: attachments

    };
    if (send.type == 'Download') {
        filename = encodeURIComponent('Opinion') + '.pdf'
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
        res.setHeader('Content-type', 'application/pdf')
            // res.write(rest);
        res.send(bufferResult);
    } else {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("error", error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    }


}

module.exports.sendHospitalOpinionPatient = async function(req, patient, send, hospitalid, ccSend, doctorProfile) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    send.signName = decoded['name']

    send.hospitalUserDesignation = designation[0].designation
    send.hospitalUserSignature = designation[0].documentSignature['key']
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
    if (send.hospitalId == '5ce78bb866261379f15e8467') {
        html = fs.readFileSync(__dirname + '/templates/manipal.html', 'utf8');
        var htmlContent = mustache.render(html, { "dataObj": send });
    } else {
        html = fs.readFileSync(__dirname + '/templates/hos-added-opinion.html', 'utf8');
        var htmlContent = mustache.render(html, { "dataObj": send });

    }
    var htmlContent = mustache.render(html, { "dataObj": send });
    var attachments = [];
    var options = {
        // format: 'letter',
        // orientation: "potrait",
        format: 'A4',
        width: "11in",
        height: "15.596in"
    };

    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    attachments.push({
        filename: `Opinion ${patient.name}` + '.pdf',
        content: bufferResult,
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
        await s3.upload(params, async function(err, data) {
            send.opnionPdf.push(data.Location)
            await send.save();

        });

    })
    doctorProfilePDF = fs.readFileSync(__dirname + '/templates/doctorprofile.html', 'utf8');
    var options = { format: 'Letter' };
    var i;

    if (doctorProfile.length) {
        for (i = 0; i < doctorProfile.length; i++) {
            const htmlDoctorProfile = mustache.render(doctorProfilePDF, { "dataObj": doctorProfile[i] })
            const rest1 = await pdf.create(htmlDoctorProfile, options)
            let pdfToBuffer1 = Promise.promisify(rest1.__proto__.toBuffer, { context: rest1 });
            let bufferResult1 = await pdfToBuffer1();
            var params = {
                Bucket: process.env.BUCKETNAME,
                Key: new Date().toISOString().replace(/:/g, '-') + `${doctorProfile[i].doctorname}.pdf`,
                Body: bufferResult1,
                ACL: 'public-read',
                ContentType: "application/pdf'"
            };
            await s3.upload(params, async function(err, data) {
                send.doctorPdf.push(data.Location)
                await send.save();

            });
            attachments.push({
                filename: `${doctorProfile[i].doctorname}` + ".pdf",
                content: bufferResult1,
                contentType: 'application/pdf'
            })



        }
    }
    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${send.emailTo}`,
        cc: `${ccSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Opinion for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear Sir / Madam, <br/><br/>
        
        Greetings from ${send.hospitalName} <br/><br/>

        We are thankful to you for showing trust and choosing us for your treatment. <br/><br/>

        Kindly find attached medical opinion which is reviewed by our Senior Medical Team. Doctor 
        profile is also attached for your reference. <br/><br/>

        We have also attached our hospital brochure which can help you to know more about us. <br/><br/>

        In case you have any query, feel free to Call or email the undersigned. <br/><br/>

        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>   
       
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

module.exports.assignHospitalOpd = async function(patient, opd, emailsto, emailscc, hospital, groupName, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospital })
    const details = await HospitalDetails.find({ "hospital": hospital })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
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

    patient.patientProfile.forEach(element => {

        attachments.push({
            filename: `${element.originalname}`,
            path: `${imgurl}${element.key}`
        })
    });

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailsto}`,
        cc: `${emailscc}`,
        subject: `Query for OPD request for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,
        html: `Kindly find the reports attached for patient that we have added in the platform. <br/><br/>
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>    
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

module.exports.sendHospitalOpdFac = async function(patient, send, hospitalid, ccSend, date, req) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
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

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${send.emailTo}`,
        cc: `${ccSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Confirmation for OPD Request for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear ${send.companyName}, <br/><br/>
        Greetings from ${send.hospitalName} <br/><br/>

        We are glad to confirm you the OPD consultation time for ${patient.name} from Dr ${send.doctorName} <br/><br/>
        Dr ${send.doctorName} would consult him on ${date} at Indian Standard time. Kindly ask
        your patient to verify once again as it is Indian standard time.<br/><br/>       
        Patient can login through the given link as below <br/>
        Link: ${send.meetingLink}<br/><br/>
        Please note that there could be waiting or some delay in case doctor is busy. However Patient is
advised to login on exact same time. If any changes, will be advised to your team before hand.<br/><br/> 
        
Kindly also note that Payment Link for the said consultation is ${send.paymentLink}. <br/><br/>
   
<strong>Please note - Blank link means we already have given you link as per requirement or payment is not needed.</strong><br/><br/>
<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>

${details[0].name}<br/>

${address}

<span>Email:</span> ${decoded.email}<br/>
        
<span>Contact:</span>${decoded.mobile}<br/>    
       
        </p>`

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.sendHospitalOpdPatient = async function(patient, send, hospitalid, ccSend, date, req) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
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

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${send.emailTo}`,
        cc: `${ccSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Confirmation for OPD Request for Patient ${patient.name} ${patient.country} `,
        html: `<p>Dear Sir / Madam, <br/><br/>
        Greetings from ${send.hospitalName} <br/><br/>

        We are glad to confirm you the OPD consultation time for ${patient.name} from Dr ${send.doctorName} <br/><br/>
        Dr ${send.doctorName} would consult him on ${date} at Indian Standard time. Kindly ask
        your patient to verify once again as it is Indian standard time.<br/><br/>       
        Patient can login through the given link as below <br/>
        Link: ${send.meetingLink}<br/><br/>
        Please note that there could be waiting or some delay in case doctor is busy. However Patient is
advised to login on exact same time. If any changes, will be advised to your team before hand.<br/><br/> 
        
Kindly also note that Payment Link for the said consultation is ${send.paymentLink}. <br/><br/>
   
<strong>Please note - Blank link means we already have given you link as per requirement or payment is not needed.</strong><br/><br/>
<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>

${details[0].name}<br/>

${address}

<span>Email:</span> ${decoded.email}<br/>
        
<span>Contact:</span>${decoded.mobile}<br/>    
       
        </p>`

    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.assignHospitalVil = async function(patient, vil, emailsto, emailscc, hospital, groupName, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospital })
    const details = await HospitalDetails.find({ "hospital": hospital })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
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

    var attachments = [];
    for (let i = 0; i < vil.passports.length; i++) {
        attachments.push({
            filename: `${vil.passports[i].originalname}`,
            path: `${imgurl}${vil.passports[i].key}`

        })
    }
    var html = fs.readFileSync(__dirname + '/templates/request-vil.html', 'utf8');
    var options = { format: 'Letter' };
    var htmlContent = mustache.render(html, { "vil": vil });
    htmlContent += `<h2 style="color:#2596be;">Thanks & Best Regards,</h2>
${decoded.name}<br/>
${designation[0].designation}<br/></br>
<img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>

${details[0].name}<br/>

${address}

<span>Email:</span> ${decoded.email}<br/>
        
<span>Contact:</span>${decoded.mobile}<br/>    `
    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailsto}`,
        cc: `${emailscc}`,
        subject: ` VIL required for Patient ${vil.patientName} ${vil.country}`,
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

module.exports.sendHospitalVilToFac = async function(send, hospitalid, patient, ccSend, req) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    send.signName = decoded['name']

    send.hospitalUserDesignation = designation[0].designation
    send.hospitalUserSignature = designation[0].documentSignature['key']
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
    html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');

    var htmlContent = mustache.render(html, { "dataObj": send });
    var attachments = [];
    var options = {
        format: 'letter',
        orientation: "potrait",
    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    attachments.push({
        filename: `Visa Invite ${patient.name}` + '.pdf',
        content: bufferResult,
        contentType: 'application/pdf'
    })
    attachments.forEach(async element => {
        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `vil-letter.pdf`,
            Body: element.content,
            ACL: 'public-read',
            ContentType: "application/pdf'"
        };
        await s3.upload(params, async function(err, data) {
            send.vilLetter.push(data.Location)
            await send.save();

        });

    })
    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${send.emailTo}`,
        cc: `${ccSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Visa Invitation letter for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,

        html: `<p>Dear ${send.companyName}, <br/><br/>
        Greetings from ${send.hospitalName}<br/><br/>
        Kindly find Visa invitation letter attached for your reference for the patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment}.<br/><br/>
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>
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
module.exports.sendHospitalVilToPatient = async function(send, hospitalid, patient, ccSend, req) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    send.signName = decoded['name']

    send.hospitalUserDesignation = designation[0].designation
    send.hospitalUserSignature = designation[0].documentSignature['key']
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
    html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');

    var htmlContent = mustache.render(html, { "dataObj": send });
    var attachments = [];
    var options = {
        format: 'letter',
        orientation: "potrait",
    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    attachments.push({
        filename: `Visa Invite ${patient.name}` + '.pdf',
        content: bufferResult,
        contentType: 'application/pdf'
    })
    attachments.forEach(async element => {
        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `vil-letter.pdf`,
            Body: element.content,
            ACL: 'public-read',
            ContentType: "application/pdf'"
        };
        await s3.upload(params, async function(err, data) {
            send.vilLetter.push(data.Location)
            await send.save();

        });

    })
    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${send.emailTo}`,
        cc: `${ccSend}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Visa Invitation letter for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,

        html: `<p>Dear Sir / Madam, <br/><br/>
        Greetings from ${send.hospitalName}<br/><br/>
        Kindly find Visa invitation letter attached for your reference for the patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment}.<br/><br/>
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>  
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
module.exports.sendHospitalVilToMail = async function(send, hospitalid, patient, ccSend, email, req) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    send.signName = decoded['name']

    send.hospitalUserDesignation = designation[0].designation
    send.hospitalUserSignature = designation[0].documentSignature['key']
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
    html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');

    var htmlContent = mustache.render(html, { "dataObj": send });
    var attachments = [];
    var options = {
        format: 'letter',
        orientation: "potrait",
    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    attachments.push({
        filename: `Visa Invite ${patient.name}` + '.pdf',
        content: bufferResult,
        contentType: 'application/pdf'
    })

    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${email}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Visa Invitation letter for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,

        html: `<p>Dear Sir / Madam, <br/><br/>
        Greetings from ${send.hospitalName}<br/><br/>
        Kindly find Visa invitation letter attached for your reference for the patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment}.<br/><br/>
        
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>  
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
module.exports.sendHospitalVilToEmbassy = async function(send, hospitalid, patient, embassyEmailTo, embassyEmailCc, req) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospitalid })
    const details = await HospitalDetails.find({ "hospital": hospitalid })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
    send.signName = decoded['name']

    send.hospitalUserDesignation = designation[0].designation
    send.hospitalUserSignature = designation[0].documentSignature['key']
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
    html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');

    var htmlContent = mustache.render(html, { "dataObj": send });
    var attachments = [];
    var options = {
        format: 'letter',
        orientation: "potrait",
    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    attachments.push({
        filename: `Visa Invite ${patient.name}` + '.pdf',
        content: bufferResult,
        contentType: 'application/pdf'
    })
    attachments.forEach(async element => {
        var params = {
            Bucket: process.env.BUCKETNAME,
            Key: new Date().toISOString().replace(/:/g, '-') + `vil-letter.pdf`,
            Body: element.content,
            ACL: 'public-read',
            ContentType: "application/pdf'"
        };
        await s3.upload(params, async function(err, data) {
            send.vilLetter.push(data.Location)
            await send.save();

        });

    })
    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${embassyEmailTo}`,
        cc: `${embassyEmailCc}`,
        replyTo: `${hospitalEmail.email1}`,
        subject: `Visa Invitation letter for patient ${patient.name} from country ${patient.country} for treatment ${patient.treatment} `,

        html: `<p>Respected Excellency, <br/><br/>
        Greetings from ${send.hospitalName}<br/><br/>
        Please find attached Visa invite for the ${patient.name} who is looking for Medical treatment at 
        our hospital under ${send.doctorName}.<br/><br/>        
        <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
        ${decoded.name}<br/>
        ${designation[0].designation}<br/></br>
        <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
        
        ${details[0].name}<br/>
        
        ${address}
        
        <span>Email:</span> ${decoded.email}<br/>
                
        <span>Contact:</span>${decoded.mobile}<br/>  
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

module.exports.downloadHospitalVil = async function(send, res, req) {


    html = fs.readFileSync(__dirname + '/templates/hospitalvil.html', 'utf8');
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";

    send.signName = decoded['name']

    send.hospitalUserDesignation = designation[0].designation
    send.hospitalUserSignature = designation[0].documentSignature['key']
    var htmlContent = mustache.render(html, { "dataObj": send });
    var attachments = [];
    var options = {
        format: 'letter',
        orientation: "potrait",
    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult = await pdfToBuffer();
    filename = encodeURIComponent('VIL') + '.pdf'
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
    res.setHeader('Content-type', 'application/pdf')
        // res.write(rest);
    res.send(bufferResult);


}

module.exports.assignHospitalConfirmation = async function(patient, conf, emailsto, emailscc, hospital, groupName, arrivaldate, coordinatorTime, req) {

    const hospitalEmail = await Credential.findOne({ "hospital": hospital })
    const details = await HospitalDetails.find({ "hospital": hospital })
    let token = req.headers.authorization.split(' ')[1]
    var decoded = jwt_decode(token);
    const designation = await Designation.find({ "hospital": decoded.userid });
    var address = "";
    details[0].address.forEach(element => {
        address += `${element.point1} <br/>`;

    });
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



    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${emailsto}`,
        cc: `${emailscc}`,
        subject: `Confirmation for patient ${patient.name} from ${patient.country}`,
        html: `
        Kindly note the intimation and arrival details of the patient ${patient.name} 
        from ${patient.country} will be coming for Treatment. Request you to arrange the cab for the pick-up.<br/><br/> 

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
        <td style="border: 1px solid black;border-collapse: collapse;  padding: 5px; text-align: left;">${arrivaldate}</td>
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
    <h2 style="color:#2596be;">Thanks & Best Regards,</h2>
    ${decoded.name}<br/>
    ${designation[0].designation}<br/></br>
    <img width="225px" height="100px" src="${imgurl}${details[0].logosize1}"><br/><br>
    
    ${details[0].name}<br/>
    
    ${address}
    
    <span>Email:</span> ${decoded.email}<br/>
            
    <span>Contact:</span>${decoded.mobile}<br/>    
        </p>`,

        attachments: { // utf-8 string as an attachment
            filename: `${conf.ticket['originalname']}`,
            path: `${imgurl}${conf.ticket['key']}`
        },

    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

module.exports.autoHospitalGroupReportsDaily = async function(data, emailTo, hospitalDetails, unitReports) {


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
    html = fs.readFileSync(__dirname + '/templates/hospital-group-reports.html', 'utf8');
    var htmlContent = mustache.render(html, { "dataObj": data });
    var attachments = [];
    var options = {

        format: 'letter',
        orientation: "potrait",

    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer1 = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult1 = await pdfToBuffer1();

    attachments.push({
        filename: `Daily Report ${data.dailyDate} ${hospitalDetails.name}` + '.pdf',
        content: bufferResult1,
        contentType: 'application/pdf'
    })
    htmlUnit = fs.readFileSync(__dirname + '/templates/hospital-unit-report.html', 'utf8');

    if (unitReports.length) {
        for (i = 0; i < unitReports.length; i++) {
            if (unitReports[i].company != null) {
                const htmlReports = mustache.render(htmlUnit, { "dataObj": unitReports[i] })
                const rest2 = await pdf.create(htmlReports, options)
                let pdfToBuffer = Promise.promisify(rest2.__proto__.toBuffer, { context: rest2 });
                let bufferResult = await pdfToBuffer();
                attachments.push({
                    filename: `Daily Report ${unitReports[i].dailyDate} ${unitReports[i].company.name}` + '.pdf',
                    content: bufferResult,
                    contentType: 'application/pdf'
                })
            }
        }
    }

    var mailOptions = {
        from: 'reports@simplifymvt.com',
        to: `${emailTo}`,
        subject: `Daily Reports ${data.dailyDate} ${hospitalDetails.name}`,
        html: `<p>Dear ${hospitalDetails.name}, <br/><br/>

        
        Kindly find the daily report attached for your reference. <br/><br/>
        Also find attached reports for current month and current financial year data for reference. <br/><br/>

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
module.exports.autoHospitalUnitReportsDaily = async function(data, emailTo, hospitalDetails) {


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
    html = fs.readFileSync(__dirname + '/templates/hospital-unit-report.html', 'utf8');
    var htmlContent = mustache.render(html, { "dataObj": data });
    var attachments = [];
    var options = {

        format: 'letter',
        orientation: "potrait",

    };
    const rest = await pdf.create(htmlContent, options)
    let pdfToBuffer1 = Promise.promisify(rest.__proto__.toBuffer, { context: rest });
    let bufferResult1 = await pdfToBuffer1();

    attachments.push({
        filename: `Daily Report ${data.dailyDate} ${hospitalDetails.name}` + '.pdf',
        content: bufferResult1,
        contentType: 'application/pdf'
    })


    var mailOptions = {
        from: 'reports@simplifymvt.com',
        to: `${emailTo}`,
        subject: `Daily Reports ${data.dailyDate} ${hospitalDetails.name}`,
        html: `<p>Dear ${hospitalDetails.name}, <br/><br/>

        
        Kindly find the daily report attached for your reference. <br/><br/>
        Also find attached reports for current month and current financial year data for reference. <br/><br/>

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

// Refferal Login

module.exports.refferalLogin = async function(refferal, password) {
    const hospitalEmail = await Credential.findOne({ "hospital": refferal.associatedHospital.id })

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


    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${refferal.emailid}`,
        subject: `Refferal Partner Login Credentials`,
        html: `<p>Dear ${refferal.name}, <br/><br/>
        Greetings from  ${refferal.associatedHospital.name} !!<br/><br/>

        Welcome to the family of ${refferal.associatedHospital.name}.<br/><br/>
      
      
        Kindly find your Login Credentials as below <br/><br/>

        Login Link: <code>${reffetalHospital}</code><br/>
        Email id: ${refferal.emailid}<br/>
        Password: ${password}<br/><br/>

        On your first login, find a reset password link at bottom left of your menu and reset as per your convenience.<br/><br/>

        In case of any query, feel free to contact us at ${hospitalEmail.email1} <br/><br/>

        Looking forward to work with you for long term. <br/><br/>
        Thanks & Regards<br/>
        ${refferal.associatedHospital.name}
        </p>`,



    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}

// Hospital User Login

module.exports.userLogin = async function(user, password, hospital) {
    const hospitalEmail = await Credential.findOne({ "hospital": hospital._id })

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


    var mailOptions = {
        from: `${hospitalEmail.email1}`,
        to: `${user.email}`,
        subject: `New Employee Login Created - Query management tool Simplifymvt.com`,
        html: `<p>Dear ${user.name}, <br/><br/>
        Greetings from  ${hospital.name.name} !!<br/><br/>      
      
        Kindly find your Login Credentials as below <br/><br/>

        Login Link: <code>${reffetalHospital}</code><br/>
        Email id: ${user.email}<br/>
        Password: ${password}<br/><br/>

        Kindly login and set up your profile.<br/><br/>

        Thanks & Regards<br/><br/>
        ${hospital.name.name}
        </p>`,



    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log("error", error);
        }
        console.log('Message sent: %s', info.messageId);
    });

}