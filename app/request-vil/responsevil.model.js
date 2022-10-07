const mongoose = require('mongoose');
const Schema = mongoose.Schema

var responsevil = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'Hospitalname is required',

    },
    villetter: {
        type: Object,
        required: 'villetter is required',

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',

    },
    hospitalemail: {
        type: Object,
        required: 'hospitalemail is required',

    },
    linkstatus: {
        type: String,
        required: 'linkstatus is required',

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
module.exports = mongoose.model('responsevil', responsevil, 'responsevil');