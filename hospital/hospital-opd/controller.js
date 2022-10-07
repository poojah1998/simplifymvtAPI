const Opd = require('./opd.model')
const Send = require('./send.model')
const Group = require('../hospital-groups/group.model')
const mongoose = require('mongoose');
const Hospital = require('../hospital-auth/auth.model')
const { ObjectId } = require('mongodb');
var express = require('express')
const Patient = require('../hospital-patients/patient.model')
const CompanyFac = require('../../app/company-details/company.model')
const HospitalDetails = require('../hospital-details/details.model')
const HospitalProfile = require('../hospital-profile/profile.model')
const HospitalBank = require('../hospital-details/bank.model')
const sendEmail = require('../sendmail/sendmail')
const removeMd = require('remove-markdown');
const Doctorcms = require('../../app/patient/cms.doctor.model')
const Doctorimg = require('../../app/patient/cms.doctorimg.model')
var moment = require('moment-timezone');
const HospitalUserRole = require('../hospital-auth/userole.model')
const jwt_decode = require('jwt-decode');
// AddOpinon
const HospitalPartner = require('../hospital-refferalpartner/refferal.model')

exports.postAddOpd = async(req, res, next) => {
    try {
        console.log(req.body)
        const { patientid } = req.params;

        const opd = new Opd();
        opd.hospitalName = req.body.hospitalName;
        opd.hospitalEmail = req.body.hospitalEmail;
        opd.linkStatus = req.body.linkStatus;
        opd.hospitalId = req.body.hospitalId;
        opd.date = req.body.date;
        if (req.body.meetingLink == "") {
            opd.meetingLink = "NIL";

        } else {
            opd.meetingLink = req.body.meetingLink;

        }
        if (req.body.paymentLink == "") {
            opd.paymentLink = "NIL";

        } else {
            opd.paymentLink = req.body.paymentLink;

        }
        opd.doctorName = req.body.doctorName;


        const patient = await Patient.findById(patientid)


        opd.patient = patient._id
        await opd.save()
        date = moment(req.body.date).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        // sendEmail.opdreceived(patient, opd, date)

        patient.hospitalOpdAdded.push(opd)

        await patient.save()

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getAddOpdGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalOpdAdded",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalOpdAdded)
        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalOpdAdded",
                match: {
                    "hospitalId": {
                        $in: partner.hospitalVisiblity
                    },
                }
            })
            res.send(patient.hospitalOpdAdded)
        } else {
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate('hospitalOpdAdded')
            res.send(patient.hospitalOpdAdded)
        }

    } catch (err) {
        next(err);
    }

}

exports.getAddOpdUnit = async(req, res) => {


    Opd.findOne({ "patient": req.params.patientid, "hospitalId": req.params.hospitalid })
        .then(data => {

            if (data) {

                res.send(data);
            }
            // res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}
exports.sendOpd = async(req, res, next) => {
    try {
        console.log(req.body)

        const { patientid } = req.params;
        qry = req.body

        var hospitalid = req.body.hospital
        const send = new Send();
        send.hospitalName = req.body.hospitalName;
        send.hospitalId = req.body.hospitalId;
        send.paymentLink = req.body.paymentLink;
        send.meetingLink = req.body.meetingLink;
        send.doctorName = req.body.doctorName;
        send.date = req.body.date;

        const patient = await Patient.findById(patientid)


        send.patient = patient._id
        await send.save()
        date = moment(req.body.date).tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm A');

        patient.hospitalOpdSent.push(send)
        await patient.save()

        ccSend = []
        emailcc = req.body.emailCc
        emailcc.forEach(element => {
            ccSend.push(element.emailcc)
        });
        if (patient.refferalpartner != "NAN") {
            if (patient.refferalpartner.type == "prefilled Partner") {
                send.emailTo = patient.refferalpartner.emailid
                const companyfac = await CompanyFac.findOne({ "user": patient.refferalpartner._id })
                send.companyName = companyfac.name
                sendEmail.sendHospitalOpdFac(patient, send, hospitalid, ccSend, date, req)
            } else {
                send.emailTo = patient.emailid
                sendEmail.sendHospitalOpdPatient(patient, send, hospitalid, ccSend, date, req)
            }

        } else {
            send.emailTo = patient.emailid
            sendEmail.sendHospitalOpdPatient(patient, send, hospitalid, ccSend, date, req)

        }

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}