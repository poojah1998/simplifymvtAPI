const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalDefualt = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: 'Hospital id is required',

    },
    role: {
        type: Object,
        required: true

    },
    executivesTo: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee",
        required: true


    }],
    executivesCc: [{
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
module.exports = mongoose.model('hospitalDefualt', hospitalDefualt, 'hospitalDefualt');