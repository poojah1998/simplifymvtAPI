const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalOpinionOwn = new mongoose.Schema({
    opinionId: {
        type: String,
        required: 'opinionid is required',

    },
    patientId: {
        type: String,
        required: 'patientId is required',

    },
    doctorName: {
        type: String,
        required: 'Doctorname is required',

    },
    emailId: {
        type: String,
        required: 'Email is required',

    },
    hospital: {
        type: String,
        required: 'hospital is required',
    },
    DoctorOpinionAdded: [{
        type: Schema.Types.ObjectId,
        ref: "DoctorOpinionAdded"
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('hospitalOpinionOwn', hospitalOpinionOwn, 'hospitalOpinionOwn');