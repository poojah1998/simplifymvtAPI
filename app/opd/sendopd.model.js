const mongoose = require('mongoose');
const Schema = mongoose.Schema

var opdsent = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',
    },
    date: {
        type: String,
        required: 'villetter is required',
    },

    meetinglink: {
        type: String,
        required: 'villetter is required',
    },
    paymentlink: {
        type: String,
        required: 'villetter is required',
    },
    doctorname: {
        type: String,
        required: 'villetter is required',
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('opdsent', opdsent, 'opdsent');