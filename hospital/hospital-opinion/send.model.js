const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalOpinionSent = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: 'hospitalname is required',

    },

    hospitalId: {
        type: String,
        required: 'hospitalId is required',

    },
    opnionPdf: {
        type: Array,

    },
    doctorPdf: {
        type: Array,

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('hospitalOpinionSent', hospitalOpinionSent, 'hospitalOpinionSent');