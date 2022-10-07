const mongoose = require('mongoose');
const Schema = mongoose.Schema

var addFacOpd = new mongoose.Schema({


    hospitalname: {
        type: String,
        required: 'hospitalname is required',

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',

    },
    hospitalemail: {
        type: Object,
        required: 'hospitalemail is required',

    },
    linkstatus: {
        type: String,
        required: 'linkstatus is required',

    },
    opdid: {
        type: String,
        required: 'opdid is required',

    },
    date: {
        type: String,
        required: 'date is required',

    },

    meetinglink: {
        type: String,

    },
    paymentlink: {
        type: String,

    },
    doctorname: {
        type: String,
        required: 'doctorname is required',

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('addFacOpd', addFacOpd, 'addFacOpd');