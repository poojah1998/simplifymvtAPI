const mongoose = require('mongoose');
const Schema = mongoose.Schema

var addFacOpinion = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',

    },
    hospitalcity: {
        type: String,
        required: 'hospitalcity is required',

    },
    diagnosis: {
        type: String,
        required: 'diagnosis is required',
    },
    accreditations: {
        type: Object,
        required: 'accreditations is required',

    },
    hospitalemail: {
        type: Object,
        required: 'hospitalemail is required',

    },

    opinionid: {
        type: String,
        required: 'opinionid is required',

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',
    },
    stayincountry: {
        type: String,
        required: 'stayincountry is required',

    },
    countryduration: {
        type: String,
        required: 'countryduration is required',

    },
    stayinhospital: {
        type: String,
        required: 'stayinhospital is required',

    },
    hospitalduration: {
        type: String,
        required: 'hospitalduration is required',

    },
    treatment: {
        type: Array,
        required: true
    },
    doctorid: {
        type: String,
        required: 'doctorid is required',

    },
    doctorname: {
        type: String,
        required: 'doctorname is required',

    },
    doctorprofile: {
        type: Array,

    },
    treatmentplan: {
        type: String,
        required: 'treatmentplan is required',

    },
    initialevaluationminimum: {
        type: String,
        required: 'initialevaluationminimum is required',

    },
    initialevaluationmaximum: {
        type: String,
        required: 'initialevaluationmaximum is required',

    },
    remarks: {
        type: String,
        required: 'remarks is required',

    },
    approved: { type: Boolean, default: false },

    request: {
        type: Schema.Types.ObjectId,
        ref: "request"
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('addFacOpinion', addFacOpinion, 'addFacOpinion');