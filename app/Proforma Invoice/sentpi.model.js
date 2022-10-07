const mongoose = require('mongoose');
const Schema = mongoose.Schema

var pisent = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',

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

module.exports = mongoose.model('pisent', pisent, 'pisent');