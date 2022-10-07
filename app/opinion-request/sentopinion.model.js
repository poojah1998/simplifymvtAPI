const mongoose = require('mongoose');
const Schema = mongoose.Schema

var sentopinion = new mongoose.Schema({

    sentopinions: {
        type: Array,
    },
    opnionPdf: {
        type: Array,

    },
    doctorPdf: {
        type: Array,

    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('sentopinion', sentopinion, 'sentopinion');