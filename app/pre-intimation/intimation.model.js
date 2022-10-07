const mongoose = require('mongoose');
const Schema = mongoose.Schema

var preintimation = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',
    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',
    },
    aggregator: {
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
    patientremarks: {
        type: String,
        required: 'patientremarks is required',
    },

    email: {
        type: Object,
        required: 'email is required',

    },
    sent: {
        type: Boolean,
        default: false,
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

module.exports = mongoose.model('preintimation', preintimation, 'preintimation');