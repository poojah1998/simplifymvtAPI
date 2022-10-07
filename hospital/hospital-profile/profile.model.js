const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalProfile = new mongoose.Schema({

    documentSignature: {
        type: Object,
        required: true
    },
    designation: {
        type: String,
        required: true

    },
    hospital: {
        type: String,
        required: true

    },

}, {
    timestamps: true
});



module.exports = mongoose.model('hospitalProfile', hospitalProfile, 'hospitalProfile');