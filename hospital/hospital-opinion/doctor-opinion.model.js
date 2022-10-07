const mongoose = require('mongoose');
const Schema = mongoose.Schema

var DoctorOpinionAdded = new mongoose.Schema({



    linkStatus: {
        type: Boolean,
        required: 'linkstatus is required',
        default: false

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

    hospitalOpinionOwn: {
        type: Schema.Types.ObjectId,
        ref: "hospitalOpinionOwn"
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('DoctorOpinionAdded', DoctorOpinionAdded, 'DoctorOpinionAdded');