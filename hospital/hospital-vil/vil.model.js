const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalVilAssign = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: 'hospitalname is required',

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

    dateOfAppointment: {
        type: String,

    },
    doctorName: {
        type: String,

    },
    embassy: {
        type: Object,

    },
    embassyAddress: {
        type: Array,

    },

    attendant: {
        type: Array,

    },
    donor: {
        type: Array,

    },
    patientName: {
        type: String,
        required: 'patientname is required',

    },
    passportNumber: {
        type: String,
        required: 'passportnumber is required',

    },
    passports: {
        type: Array,
        required: 'passports is required',

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('hospitalVilAssign', hospitalVilAssign, 'hospitalVilAssign');