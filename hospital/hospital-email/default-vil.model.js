const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalVilDefualt = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: 'Hospital id is required',

    },
    role: {
        type: Object,
        required: true

    },
    vilTo: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee",
        required: true


    }],
    vilCc: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee"
    }],
    partner: {
        type: String,
        required: 'Partner id is required',
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('hospitalVilDefualt', hospitalVilDefualt, 'hospitalVilDefualt');