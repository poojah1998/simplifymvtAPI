const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalOpinionEdit = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: 'hospitalname is required',

    },
    hospitalCity: {
        type: String,
        required: 'hospitalcity is required',

    },
    accreditations: {
        type: Object,
        required: 'accreditations is required',

    },
    hospitalEmail: {
        type: Object,

    },
    linkStatus: {
        type: String,
        required: 'linkstatus is required',

    },

    hospitalId: {
        type: String,
        required: 'hospitalid is required',
    },
    stayInCountry: {
        type: String,
        required: 'stayincountry is required',

    },
    countryDuration: {
        type: String,
        required: 'countryduration is required',

    },
    stayInHospital: {
        type: String,
        required: 'stayinhospital is required',

    },
    hospitalDuration: {
        type: String,
        required: 'hospitalduration is required',

    },
    doctorName: {
        type: String,
        required: 'doctorname is required',

    },
    doctorId: {
        type: String,
        required: 'doctorid is required',

    },
    diagnosis: {
        type: String,
        required: 'diagnosis is required',

    },
    treatmentPlan: {
        type: String,
        required: 'treatmentplan is required',

    },
    initialEvaluationMinimum: {
        type: String,
        required: 'initialevaluationminimum is required',

    },
    initialEvaluationMaximum: {
        type: String,
        required: 'initialevaluationmaximum is required',

    },
    treatment: {
        type: Array,
        required: true
    },
    remarks: {
        type: String,
        required: 'remarks is required',

    },
    mode: {
        type: String,
        default: 'edit'
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('hospitalOpinionEdit', hospitalOpinionEdit, 'hospitalOpinionEdit');