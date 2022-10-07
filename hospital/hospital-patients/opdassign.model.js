const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalOpdAssign = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: true
    },
    hospitalId: {
        type: String,
        required: true

    },
    hospitalEmail: {
        type: Object,

    },
    linkStatus: {
        type: String,
        required: 'linkstatus is required',
        default: 'active'

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },

}, {
    timestamps: true
});


module.exports = mongoose.model('hospitalOpdAssign', hospitalOpdAssign, 'hospitalOpdAssign');