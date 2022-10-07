const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalopinion = new mongoose.Schema({
    opinionid: {
        type: String,
        required: 'opinionid is required',

    },
    doctorname: {
        type: String,
        required: 'Doctorname is required',

    },
    emailid: {
        type: String,
        required: 'Email is required',

    },
    request: {
        type: Schema.Types.ObjectId,
        ref: "request"
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "patient"
    },
    doctoropinions: [{
        type: Schema.Types.ObjectId,
        ref: "doctoropinion"
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('hospitalopinion', hospitalopinion, 'hospitalopinion');