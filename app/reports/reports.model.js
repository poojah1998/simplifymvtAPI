const mongoose = require('mongoose');
const Schema = mongoose.Schema

var report = new mongoose.Schema({
    role: {
        type: Object,
        required: true

    },

    refferalpartner: {
        type: Object,
        required: "refferalpartner is required"

    },
    branchoffice: {
        type: String,
        required: "branchoffice is required"

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

    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('report', report, 'report');