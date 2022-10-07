const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalVilSent = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: 'hospitalname is required',

    },

    hospitalId: {
        type: String,
        required: 'hospitalId is required',

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },
    vilLetter: {
        type: Array,

    }

}, {
    timestamps: true
});

module.exports = mongoose.model('hospitalVilSent', hospitalVilSent, 'hospitalVilSent');