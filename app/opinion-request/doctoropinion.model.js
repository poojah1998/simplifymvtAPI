const mongoose = require('mongoose');
const Schema = mongoose.Schema

var doctoropinion = new mongoose.Schema({

    doctorname: {
        type: String,
        required: 'doctorname is required',

    },
    emailid: {
        type: String,
        required: 'emailid is required',

    },
    linkstatus: {
        type: String,
        required: 'linkstatus is required',

    },
    stayincountry: {
        type: String,
        required: 'stayincountry is required',

    },
    countryduration: {
        type: String,
        required: 'countryduration is required',

    },
    diagnosis: {
        type: String,
        required: 'diagnosis is required',
    },
    stayinhospital: {
        type: String,
        required: 'stayinhospital is required',

    },
    hospitalduration: {
        type: String,
        required: 'hospitalduration is required',

    },

    treatmentplan: {
        type: String,
        required: 'treatmentplan is required',

    },
    initialevaluationminimum: {
        type: String,
        required: 'initialevaluationminimum is required',

    },
    initialevaluationmaximum: {
        type: String,
        required: 'initialevaluationmaximum is required',

    },
    treatment: {
        type: Array,
        required: true
    },

    remarks: {
        type: String,

    },
    hospitalname: {
        type: String,
        required: 'hospitalname is required',

    },
    email: {
        type: Object,
        required: 'email is required',

    },
    request: {
        type: Schema.Types.ObjectId,
        ref: "request"
    },
    read: { type: Boolean, default: false },

    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
    hospitalopinion: {
        type: Schema.Types.ObjectId,
        ref: "hospitalopinion"
    },


}, {
    timestamps: true
});

module.exports = mongoose.model('doctoropinion', doctoropinion, 'doctoropinion');