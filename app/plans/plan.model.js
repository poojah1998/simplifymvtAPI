const mongoose = require('mongoose');
const Schema = mongoose.Schema

var plan = new mongoose.Schema({
    name: {
        type: String,

    },
    price: {
        type: String,
        required: 'price is required',

    },
    plantype: {
        type: String,
        required: 'plantype is required',

    },
    queries: {
        type: String,
        required: 'queries is required',

    },
    users: {
        type: String,
        required: 'users is required',

    },
    refferalpartner: {
        type: String,
        required: 'refferalpartner is required',

    },
    myhospitalvisibility: {
        type: Boolean,
        required: 'myhospitalvisibility is required',
        default: false
    },
    hospitalvisibility: {
        type: Boolean,
        required: 'hospitalvisibility is required',
        default: false
    },
    doctorvisibility: {
        type: Boolean,
        required: 'doctorvisibility is required',
        default: false
    },
    mydoctorvisibility: {
        type: Boolean,
        required: 'mydoctorvisibility is required',
        default: false
    },
    zonevisibility: {
        type: Boolean,
        required: 'zonevisibility is required',
        default: false
    },
    myzonevisibility: {
        type: Boolean,
        required: 'myzonevisibility is required',
        default: false
    },

}, {
    timestamps: true
});
module.exports = mongoose.model('plan', plan, 'plan');