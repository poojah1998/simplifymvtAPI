const mongoose = require('mongoose');
const Schema = mongoose.Schema

var cmsExcel = new mongoose.Schema({

    type: {
        type: String,
        required: true
    },
    downloadReport: {
        type: String,
        required: true

    },

}, {
    timestamps: true
});

module.exports = mongoose.model('cmsExcel', cmsExcel, 'cmsExcel');