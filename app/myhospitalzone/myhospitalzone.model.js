const mongoose = require('mongoose');
const Schema = mongoose.Schema

var myhospitalzone = new mongoose.Schema({

    hospitalid: {
        type: String,
        required: 'Hospital id is required',

    },
    zone: {
        type: String,
        required: 'Zone is required',

    },
    treatments: {
        type: Array,
        required: 'Treatments is required',

    },
    countries: {
        type: Array,
        required: 'Countries is required',

    },
    executivesto: [{
        type: Schema.Types.ObjectId,
        ref: "myemployee"

    }],
    executivescc: [{
        type: Schema.Types.ObjectId,
        ref: "myemployee"
    }],
    doctorsto: [{
        type: Schema.Types.ObjectId,
        ref: "mydoctor"
    }],
    doctorscc: [{
        type: Schema.Types.ObjectId,
        ref: "mydoctor"
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('myhospitalzone', myhospitalzone, 'myhospitalzone');