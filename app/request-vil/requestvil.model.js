const mongoose = require('mongoose');
const Schema = mongoose.Schema

var requestvil = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'Hospitalname is required',

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',

    },
    aggregator: {
        type: String,

    },
    dateofAppointment: {
        type: String,

    },
    doctorname: {
        type: String,

    },
    embassy: {
        type: Object,

    },
    embassyAddress: {
        type: Array,

    },
    hospitalemail: {
        type: Object,
        required: 'hospitalemail is required',

    },
    attendant: {
        type: Array,

    },
    donor: {
        type: Array,

    },
    patientname: {
        type: String,
        required: 'patientname is required',

    },
    passportnumber: {
        type: String,
        required: 'passportnumber is required',

    },
    passports: {
        type: Array,
        required: 'passports is required',

    },

    remarks: {
        type: String,

    },

    linkstatus: {
        type: String,
        required: 'linkstatus is required',
        default: 'active'

    },
    query: {
        type: String,
        required: 'query is required',

    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

}, {
    timestamps: true
});
module.exports = mongoose.model('requestvil', requestvil, 'requestvil');