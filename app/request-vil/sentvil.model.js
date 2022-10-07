const mongoose = require('mongoose');
const Schema = mongoose.Schema

var sentvil = new mongoose.Schema({

    hospitalname: {
        type: String,
        required: 'hospitalname is required',
    },
    villetter: {
        type: Object,
        required: 'villetter is required',
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('sentvil', sentvil, 'sentvil');