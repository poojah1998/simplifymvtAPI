const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalDisputeManagement = new mongoose.Schema({

    level: {
        type: String,
        required: true
    },
    zone: {
        type: Array,

    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "hospitalauth"
    },

}, {
    timestamps: true
});



module.exports = mongoose.model('hospitalDisputeManagement', hospitalDisputeManagement);