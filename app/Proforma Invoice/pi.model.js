const mongoose = require('mongoose');
const Schema = mongoose.Schema

var pirequest = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'Hospitalname is required',

    },
    hospitalid: {
        type: String,
        required: 'hospitalid is required',

    },
    aggregator: {
        type: String,

    },
    hospitalemail: {
        type: Object,
        required: 'hospitalemail is required',

    },
    remark: {
        type: String,
        required: 'remark is required',

    },
    linkstatus: {
        type: String,
        required: 'linkstatus is required',
        default: 'active'

    },
    query: {
        type: String,
        required: 'query is required',
    },
    date: {
        type: Date,
        default: Date.now
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },

}, {
    timestamps: true
});
module.exports = mongoose.model('pirequest', pirequest, 'pirequest');