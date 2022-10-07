const mongoose = require('mongoose');
const Schema = mongoose.Schema

var prehospitalzone = new mongoose.Schema({

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
        ref: "preemployee"

    }],
    executivescc: [{
        type: Schema.Types.ObjectId,
        ref: "preemployee"
    }],
    doctorsto: [{
        type: Schema.Types.ObjectId,
        ref: "predoctor"
    }],
    doctorscc: [{
        type: Schema.Types.ObjectId,
        ref: "predoctor"
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('prehospitalzone', prehospitalzone, 'prehospitalzone');