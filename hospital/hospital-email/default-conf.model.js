const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalConfDefualt = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: 'Hospital id is required',

    },
    role: {
        type: Object,
        required: true

    },
    confirmationTo: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee",
        required: true


    }],
    confirmationCc: [{
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
module.exports = mongoose.model('hospitalConfDefualt', hospitalConfDefualt, 'hospitalConfDefualt');