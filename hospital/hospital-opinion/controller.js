const Added = require('./response.model')
const Send = require('./send.model')
const Edit = require('./opinion-edit.model')

const Counter = require('../../app/patient/counter.model')
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
const Request = require('../hospital-patients/queryassign.model')
const HospitalUserRole = require('../hospital-auth/userole.model')
const jwt_decode = require('jwt-decode');
// AddOpinon
const HospitalPartner = require('../hospital-refferalpartner/refferal.model')
const HospitalOpinion = require('./hospital-opnion.model')
const DoctorOpinion = require('./doctor-opinion.model')

exports.postAddOpinion = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        qry = req.body;
        console.log(qry)
        const added = new Added();

        added.hospitalName = qry.hospitalName
        added.hospitalCity = qry.hospitalCity
        added.doctorName = qry.doctorName
        added.doctorId = qry.doctorId
        added.accreditations = qry.accreditations
        added.hospitalEmail = qry.hospitalEmail
        added.linkStatus = qry.linkStatus
        added.hospitalId = qry.hospitalId
        added.stayInCountry = qry.stayInCountry
        added.countryDuration = qry.countryDuration
        added.stayInHospital = qry.stayInHospital
        added.hospitalDuration = qry.hospitalDuration
        added.diagnosis = qry.diagnosis
        added.treatmentPlan = qry.treatmentPlan
        added.initialEvaluationMinimum = qry.initialEvaluationMinimum
        added.initialEvaluationMaximum = qry.initialEvaluationMaximum
        added.treatment = qry.treatment

        added.remarks = qry.remarks

        const patient = await Patient.findById(patientid)
        added.patient = patient._id
        await added.save()


        patient.hospitalOpinionsAdded.push(added)
        await patient.save()
        request = await Request.findOne({ "patient": patientid, "hospitalId": qry.hospitalId })
        console.log(request)

        request.history.push({
            'status': 'SUBMIT',
            'info': `Opinion Sent`,
            'date': new Date()
        })
        request.save()
            // sendEmail.assignHospital(patient, queryassign, emailsto, emailscc, qry.hospital)


        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }
}
exports.postEditOpinion = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        qry = req.body;
        const edit = new Edit();

        edit.hospitalName = qry.hospitalName
        edit.hospitalCity = qry.hospitalCity
        edit.doctorName = qry.doctorName
        edit.doctorId = qry.doctorId
        edit.accreditations = qry.accreditations
        edit.hospitalEmail = qry.hospitalEmail
        edit.linkStatus = qry.linkStatus
        edit.hospitalId = qry.hospitalId
        edit.stayInCountry = qry.stayInCountry
        edit.countryDuration = qry.countryDuration
        edit.stayInHospital = qry.stayInHospital
        edit.hospitalDuration = qry.hospitalDuration
        edit.treatmentPlan = qry.treatmentPlan
        edit.diagnosis = qry.diagnosis

        edit.initialEvaluationMinimum = qry.initialEvaluationMinimum
        edit.initialEvaluationMaximum = qry.initialEvaluationMaximum
        edit.treatment = qry.treatment

        edit.remarks = qry.remarks
        const patient = await Patient.findById(patientid)
        edit.patient = patient._id
        await edit.save()


        // sendEmail.assignHospital(patient, queryassign, emailsto, emailscc, qry.hospital)


        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }
}
exports.getAddOpinionGroup = async(req, res, next) => {
    try {
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);


        if (decoded.Role == 'Group Manager' || decoded.Role == 'Group Executive' || decoded.Role == 'Group Query Manager') {
            userRole = await HospitalUserRole.findOne({ _id: decoded.userid })
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalOpinionsAdded",
                match: {
                    "hospitalId": {
                        $in: userRole.hospitalVisiblity
                    },
                }
            })

            edit = await Edit.find({
                "patient": req.params.patientid,
                "hospitalId": {
                    $in: userRole.hospitalVisiblity
                },
            })

            if (edit.length) {
                res.send(patient.hospitalOpinionsAdded.concat(edit))

            } else {
                res.send(patient.hospitalOpinionsAdded)
            }

        } else if (decoded.Role == 'Group Refferal Partner') {
            partner = await HospitalPartner.findOne({ _id: decoded.refferalid })
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate({
                "path": "hospitalOpinionsAdded",
                match: {
                    "hospitalId": {
                        $in: partner.hospitalVisiblity
                    },
                }
            })
            edit = await Edit.find({
                "patient": req.params.patientid,
                "hospitalId": {
                    $in: partner.hospitalVisiblity
                },
            })

            if (edit.length) {
                res.send(patient.hospitalOpinionsAdded.concat(edit))

            } else {
                res.send(patient.hospitalOpinionsAdded)
            }
        } else {
            const { patientid } = req.params;
            const patient = await Patient.findById(patientid).populate('hospitalOpinionsAdded')
            edit = await Edit.find({ "patient": req.params.patientid })

            if (edit.length) {
                res.send(patient.hospitalOpinionsAdded.concat(edit))

            } else {
                res.send(patient.hospitalOpinionsAdded)
            }
        }

    } catch (err) {
        next(err);
    }

}

exports.getAddOpinionUnit = async(req, res) => {


    Added.find({ "patient": req.params.patientid, "hospitalId": req.params.hospitalid })
        .then(async data => {
            if (data) {

                edit = await Edit.find({ "patient": req.params.patientid, "hospitalId": req.params.hospitalid })

                if (edit.length) {
                    res.send(data.concat(edit))

                } else {
                    res.send(data)
                }
            }

        }).catch(err => {
            console.log(err)
            res.status(500).send({
                message: "Some error occurred while searching"
            });

        });
}


exports.sendOpinion = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        qry = req.body
        qry.forEach(async element => {
            var hospitalid = element.hospital
            const send = new Send();
            send.hospitalName = element.hospitalName
            send.hospitalCity = element.hospitalCity
            send.doctorName = element.doctorName
            send.linkStatus = element.linkStatus
            send.hospitalId = element.hospitalId
            send.diagnosis = element.diagnosis
            send.stayInCountry = element.stayInCountry
            send.countryDuration = element.countryDuration
            send.stayInHospital = element.stayInHospital
            send.hospitalDuration = element.hospitalDuration
            send.treatmentPlan = element.treatmentPlan
            send.initialEvaluationMinimum = element.initialEvaluationMinimum
            send.initialEvaluationMaximum = element.initialEvaluationMaximum
            send.treatment = element.treatment
            send.remarks = element.remarks

            const patient = await Patient.findById(patientid)
            send.patient = patient._id
            await send.save()


            patient.hospitalOpinionsSent.push(send)
            await patient.save()


            const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
            const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
            const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
            const hospitalBank = await HospitalBank.findOne({ "hospital": hospitalid })


            send.hospitalLogo = hospital.logosize1
            send.address = hospital.address
            send.companyEmail = hospital.companyemail
            send.hospitalUsername = hospitalUsername.name['name']
            send.hospitalUserDesignation = hospitalProfile.designation
            send.hospitalUserSignature = hospitalProfile.documentSignature['key']
            send.patientName = patient.name
            send.patientCountry = patient.country
            send.patientTreatment = patient.treatment
            send.mhid = patient.mhid
            send.beneficiaryName = hospitalBank.beneficiaryName
            send.hospitalDuration = element.hospitalDuration
            send.accountNo = hospitalBank.accountNo
            send.accountType = hospitalBank.accountType
            send.bankName = hospitalBank.bankName
            send.branch = hospitalBank.branch
            send.bankAaddress = hospitalBank.address
            send.city = hospitalBank.city
            send.state = hospitalBank.state
            send.ifscCode = hospitalBank.ifscCode
            send.branchCode = hospitalBank.branchCode
            send.date = element.todayDate
            send.type = element.type
            send.doctorId = element.doctorId

            ccSend = []
            emailcc = element.emailCc
            emailcc.forEach(element => {
                ccSend.push(element.emailcc)
            });

            var doctorProfile = []
            if (element.hospitalName) {
                if (element.doctorId != undefined && element.doctorId != 'NAN') {
                    var doctorId = await Doctorcms.findById(element.doctorId)
                    if (doctorId != null) {
                        doctorId = JSON.parse(JSON.stringify(doctorId))
                        zoneQuery = {
                            "related.ref": ObjectId(element.doctorId),
                            "related.field": 'image'
                        };

                        var doctorImage = await Doctorimg.findOne(zoneQuery)
                        doctorImage = JSON.parse(JSON.stringify(doctorImage))


                        doctorProfile.push({
                            doctorname: doctorId['name'],
                            hospitalname: element.hospitalName,
                            designation: doctorId['designation'],
                            qualification: doctorId['qualification'],
                            expertise: removeMd(doctorId['expertise']),
                            serviceoffered: removeMd(doctorId['serviceoffered']),
                            experience: removeMd(doctorId['experience']),
                            image: doctorImage['url'],
                            companyname: hospital.name,
                            address: hospital.address,
                            companyemail: hospital.companyemail,
                            logo: hospital.logosize1,

                        })
                    }

                }

            }

            if (send.type == "Send") {


                if (patient.refferalpartner != "NAN") {
                    if (patient.refferalpartner.type == "prefilled Partner") {
                        send.emailTo = patient.refferalpartner.emailid
                        const companyfac = await CompanyFac.findOne({ "user": patient.refferalpartner._id })
                        send.companyName = companyfac.name
                        sendEmail.sendHospitalOpinionFac(patient, send, hospitalid, ccSend, doctorProfile, res, req)
                    } else {
                        send.emailTo = patient.emailid
                        sendEmail.sendHospitalOpinionPatient(req, patient, send, hospitalid, ccSend, doctorProfile)
                    }
                } else {
                    send.emailTo = patient.emailid
                    sendEmail.sendHospitalOpinionPatient(req, patient, send, hospitalid, ccSend, doctorProfile)

                }
            } else if (send.type == "Email") {

                if (patient.refferalpartner != "NAN") {
                    if (patient.refferalpartner.type == "prefilled Partner") {
                        send.emailTo = element.emailid
                        const companyfac = await CompanyFac.findOne({ "user": patient.refferalpartner._id })
                        send.companyName = companyfac.name
                        sendEmail.sendHospitalOpinionFac(patient, send, hospitalid, ccSend, doctorProfile, res, req)
                    } else {
                        send.emailTo = element.emailid
                        sendEmail.sendHospitalOpinionPatient(req, patient, send, hospitalid, doctorProfile)
                    }

                } else {
                    send.emailTo = element.emailid
                    sendEmail.sendHospitalOpinionPatient(req, patient, send, hospitalid, doctorProfile)

                }
            }

        });
        res.status(201).send({ message: "success" })


    } catch (err) {
        next(err);
    }
}
exports.downloadOpinion = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        qry = req.body
        qry.forEach(async element => {
            var hospitalid = element.hospital
            const send = new Send();
            send.hospitalName = element.hospitalName
            send.hospitalCity = element.hospitalCity
            send.doctorName = element.doctorName
            send.linkStatus = element.linkStatus
            send.hospitalId = element.hospitalId
            send.stayInCountry = element.stayInCountry
            send.countryDuration = element.countryDuration
            send.stayInHospital = element.stayInHospital
            send.hospitalDuration = element.hospitalDuration
            send.diagnosis = element.diagnosis

            send.treatmentPlan = element.treatmentPlan
            send.initialEvaluationMinimum = element.initialEvaluationMinimum
            send.initialEvaluationMaximum = element.initialEvaluationMaximum

            send.remarks = element.remarks
            send.treatment = element.treatment

            const patient = await Patient.findById(patientid)
            send.patient = patient._id
            patient.hospitalOpinionsSent.push(send)
            const hospitalProfile = await HospitalProfile.findOne({ "hospital": hospitalid })
            const hospitalUsername = await Hospital.findOne({ "_id": hospitalid })
            const hospital = await HospitalDetails.findOne({ "hospital": hospitalid })
            const hospitalBank = await HospitalBank.findOne({ "hospital": hospitalid })
            send.hospitalLogo = hospital.logosize1
            send.address = hospital.address
            send.companyEmail = hospital.companyemail
            send.hospitalUsername = hospitalUsername.name['name']
            send.hospitalUserDesignation = hospitalProfile.designation
            send.hospitalUserSignature = hospitalProfile.documentSignature['key']
            send.patientName = patient.name
            send.patientCountry = patient.country
            send.patientTreatment = patient.treatment
            send.mhid = patient.mhid

            send.beneficiaryName = hospitalBank.beneficiaryName
            send.accountNo = hospitalBank.accountNo
            send.accountType = hospitalBank.accountType
            send.bankName = hospitalBank.bankName
            send.branch = hospitalBank.branch
            send.bankAaddress = hospitalBank.address
            send.city = hospitalBank.city
            send.state = hospitalBank.state
            send.ifscCode = hospitalBank.ifscCode
            send.branchCode = hospitalBank.branchCode
            send.date = element.todayDate
            send.type = element.type
            ccSend = []
            doctorProfile = []
            sendEmail.sendHospitalOpinionFac(patient, send, hospitalid, ccSend, doctorProfile, res, req)

        });


    } catch (err) {
        next(err);
    }
}

exports.postHospitalOpinion = async(req, res, next) => {
    try {
        const { opinionid } = req.params;
        let token = req.headers.authorization.split(' ')[1]

        var decoded = jwt_decode(token);
        const hospitalopinion = new HospitalOpinion();
        hospitalopinion.opinionId = opinionid;
        hospitalopinion.doctorName = req.body.doctorName;
        hospitalopinion.emailId = req.body.emailId;
        hospitalopinion.patientId = req.body.patientId;
        hospitalopinion.hospital = decoded.id;

        await hospitalopinion.save()

        patient = await Patient.findOne({ _id: req.body.patientId })

        patient.hospitalOpinionOwn = hospitalopinion
        patient.save()
        sendEmail.hospitalOpinionDoctor(patient, hospitalopinion, req)

        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }
}
exports.getHospitalOpinion = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        console.log(req.params.hospitalid)
        const data = await HospitalOpinion.find({ "patientId": patientid, "hospital": req.params.hospitalid }).populate('DoctorOpinionAdded')
        console.log(data)
        res.send(data)

    } catch (err) {
        next(err);
    }


}
exports.getHospitalOpinionGroup = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        console.log(req.params.hospitalid)
        const data = await HospitalOpinion.find({ "patientId": patientid }).populate('DoctorOpinionAdded')
        console.log(data)
        res.send(data)

    } catch (err) {
        next(err);
    }


}
exports.getHospitalOpinionPatient = async(req, res, next) => {
    try {
        const data = await HospitalOpinion.findById(req.params.id).populate({ path: 'patientId', model: Patient })

        res.send(data)
    } catch (err) {
        next(err);
    }

}
exports.postDoctorOpinion = async(req, res, next) => {
    try {

        const { hospitalopinionid } = req.params;

        const doctoropinion = new DoctorOpinion();
        doctoropinion.doctorName = req.body.doctorName;
        doctoropinion.linkStatus = req.body.linkStatus;
        doctoropinion.diagnosis = req.body.diagnosis;
        doctoropinion.stayInCountry = req.body.stayInCountry;
        doctoropinion.stayInHospital = req.body.stayInHospital;
        doctoropinion.countryDuration = req.body.countryDuration;
        doctoropinion.hospitalDuration = req.body.hospitalDuration;
        doctoropinion.treatmentPlan = req.body.treatmentPlan;
        doctoropinion.initialEvaluationMinimum = req.body.initialEvaluationMinimum;
        doctoropinion.initialEvaluationMaximum = req.body.initialEvaluationMaximum;
        doctoropinion.treatment = req.body.treatment;
        doctoropinion.remarks = req.body.remarks;
        doctoropinion.hospitalName = req.body.hospitalName;
        doctoropinion.linkStatus = true


        const hospitalopinion = await HospitalOpinion.findById(hospitalopinionid).populate({ path: 'patientId', model: Patient })




        doctoropinion.hospitalOpinionOwn = hospitalopinion
        await doctoropinion.save()
        hospitalopinion.DoctorOpinionAdded = doctoropinion
        await hospitalopinion.save()

        patient = await Patient.findOne({ _id: hospitalopinion.patientId })

        patient.DoctorOpinionAdded = doctoropinion
        patient.save()
        doctoropinion.treatment.forEach(element => {
            if (element.roomType == '') {
                element.roomType = 'NIL'
            }
            if (element.maxCost == null) {
                element.maxCost = 'NIL'

            }
        });
        sendEmail.opinionDoctor(hospitalopinion, doctoropinion);


        res.send({ message: "success" })

    } catch (err) {
        next(err);
    }

}

exports.getDoctorByIdOpinion = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });

    DoctorOpinion.findOne({ hospitalOpinionOwn: req.params.id }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in retrieving the documents' }); }
    })

}