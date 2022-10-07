const mongoose = require('mongoose');
const Schema = mongoose.Schema

var opdrequest = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',
    },
    doctorname: {
        type: String,
    },
    patientname: {
        type: String,
        required: 'patientname is required',
    },
    countryname: {
        type: String,
        required: 'countryname is required',
    },
    aggregator: {
        type: String,

    },
    email: {
        type: Object,
        required: 'email is required',

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',

    },
    doctors: {
        type: Array,

    },
    linkstatus: {
        type: String,
        required: 'linkstatus is required',
        default: 'active'

    },
    medicalhistory: {
        type: Object,
        required: 'medicalhistory is required',

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
    date: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('opdrequest', opdrequest, 'opdrequest');