const mongoose = require('mongoose');
const Schema = mongoose.Schema

var request = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',

    },
    hospitalcity: {
        type: String,
        required: 'hospitalcity is required',

    },
    accreditations: {
        type: Array,
        required: 'accreditations is required',

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',

    },
    email: {
        type: Object,
        required: 'email is required',

    },
    doctors: {
        type: Array,

    },
    employee: {
        type: Array,

    },

    history: {
        type: Array,
    },
    hospitalreviewed: {
        type: Boolean,
        default: false
    },
    linkstatus: {
        type: String,
        required: 'linkstatus is required',
        default: 'active'

    },
    read: { type: Boolean, default: false },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
    aggregator: {
        type: String,

    },
    receives: [{
        type: Schema.Types.ObjectId,
        ref: "received"
    }],
    hospitalopinions: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalopinion"
    }],
    doctoropinions: [{
        type: Schema.Types.ObjectId,
        ref: "doctoropinion"
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('request', request, 'request');