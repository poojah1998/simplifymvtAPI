const mongoose = require('mongoose');
const Schema = mongoose.Schema

var piresponse = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',

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
    piid: {
        type: String,
        required: 'pi id is required',

    },

    proformainvoice: {
        type: Object,
        required: 'proformainvoice is required',

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('piresponse', piresponse, 'piresponse');