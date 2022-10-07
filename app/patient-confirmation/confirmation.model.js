const mongoose = require('mongoose');
const Schema = mongoose.Schema

var confirmation = new mongoose.Schema({
    hospitalname: {
        type: String,
        required: 'hospitalname is required',

    },
    hospitalemail: {
        type: Object,
        required: 'hospitalemail is required',

    },
    aggregator: {
        type: String,

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',

    },


    arrivaldate: {
        type: Date,
        required: 'arrivaldate is required',

    },

    ticket: {
        type: Array,
        required: 'ticket is required',
    },

    villetter: {
        type: Object,

    },
    approved: {
        type: Boolean,
        default: false,

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
    remarks: {
        type: String,
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

}, {
    timestamps: true
});
module.exports = mongoose.model('confirmation', confirmation, 'confirmation');