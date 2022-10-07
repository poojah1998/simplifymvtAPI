const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalOpdSent = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: 'hospitalname is required',

    },

    hospitalId: {
        type: String,
        required: 'hospitalId is required',

    },
    date: {
        type: String,
        required: 'date is required',

    },
    meetingLink: {
        type: String,

    },
    paymentLink: {
        type: String,

    },
    doctorName: {
        type: String,
        required: 'doctorname is required',

    },

    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('hospitalOpdSent', hospitalOpdSent, 'hospitalOpdSent');