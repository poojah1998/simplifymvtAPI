const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalreport = new mongoose.Schema({
    role: {
        type: Object,
        required: true

    },
    startdate: {
        type: Date,
        required: true
    },
    enddate: {
        type: Date,
        required: true
    },
    downloadreport: {
        type: String,
    },

    hospital: {
        type: Schema.Types.ObjectId,
        ref: "hospitalauth"
    },

});

module.exports = mongoose.model('hospitalreport', hospitalreport, 'hospitalreport');