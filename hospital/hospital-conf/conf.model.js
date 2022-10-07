const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalConfirmationAssign = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: true
    },
    hospitalId: {
        type: String,
        required: true

    },
    hospitalEmail: {
        type: Object,
        required: true

    },
    linkStatus: {
        type: String,
        required: 'linkstatus is required',
        default: 'active'

    },
    arrivalDate: {
        type: String,
        required: 'arrivaldate is required',

    },

    ticket: {
        type: Object,
        required: 'ticket is required',
    },

    cabs: {
        type: String,
    },
    flightName: {
        type: String,

    },
    flightNo: {
        type: String,

    },

    contactPerson: {
        type: String,

    },
    contactPersonNo: {
        type: String,

    },
    coordinatorAddress: {
        type: String,

    },
    coordinatorTime: {
        type: String,
    },
    arrivalDate: {
        type: Date,
        required: 'arrivaldate is required',

    },

    ticket: {
        type: Object,
        required: 'ticket is required',
    },

    cabs: {
        type: String,
    },
    flightName: {
        type: String,

    },
    flightNo: {
        type: String,

    },

    contactPerson: {
        type: String,

    },
    contactPersonNo: {
        type: String,

    },
    coordinatorAddress: {
        type: String,

    },
    coordinatorTime: {
        type: String,
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },

}, {
    timestamps: true
});


module.exports = mongoose.model('hospitalConfirmationAssign', hospitalConfirmationAssign, 'hospitalConfirmationAssign');