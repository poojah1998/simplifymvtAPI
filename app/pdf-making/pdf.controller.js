const Pdf = require('./pdf.model')
const mongoose = require('mongoose');
const Patient = require('../patient/patient.model')
const { ObjectId } = require('mongodb');


exports.postPdfData = async(req, res, next) => {
    try {
        const { patientid } = req.params;
        const pdf = new Pdf();
        pdf.model = req.body.model
        pdf.date = req.body.date
        pdf.queryno = req.body.queryno
        pdf.doctorcategory = req.body.doctorcategory
        pdf.diagnosispara1 = req.body.diagnosispara1
        pdf.diagnosispara2 = req.body.diagnosispara2
        pdf.evaluations = req.body.evaluations
        pdf.treatmentplan = req.body.treatmentplan
        pdf.hospitaldata = req.body.hospitaldata
        pdf.inclusion = req.body.inclusion
        pdf.exclusion = req.body.exclusion

        const patient = await Patient.findById(patientid)
        pdf.patient = patient
        await pdf.save()

        patient.pdfdataopinions.push(pdf)
        await patient.save()

        res.status(201).send({ message: 'success' })


    } catch (err) {
        next(err);
    }
}

exports.getPdfData = async(req, res, next) => {
    try {
        const { patientid } = req.params;

        const patient = await Patient.findById(patientid).populate('pdfdataopinions')

        res.send(patient.pdfdataopinions)
    } catch (err) {
        next(err);
    }

}
exports.putPdfData = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send({ message: `No record with given id : ${req.params.id}` });
    var pdf = {
        model: req.body.model,
        date: req.body.date,
        queryno: req.body.queryno,
        doctorcategory: req.body.doctorcategory,
        diagnosispara1: req.body.diagnosispara1,
        diagnosispara2: req.body.diagnosispara2,
        evaluations: req.body.evaluations,
        treatmentplan: req.body.treatmentplan,
        hospitaldata: req.body.hospitaldata,
        inclusion: req.body.inclusion,
        exclusion: req.body.exclusion

    };
    Pdf.findByIdAndUpdate(req.params.id, { $set: pdf }, { new: true }, (err, doc) => {
        if (!err) {
            res.send(doc);
        } else { return res.status(400).send({ message: 'error in update the documents' }); }
    });
}