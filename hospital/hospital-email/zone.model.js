const mongoose = require('mongoose');
const Schema = mongoose.Schema


var hospitalZone = new mongoose.Schema({

    hospitalId: {
        type: String,
        required: 'Hospital id is required',

    },
    role: {
        type: Object,
        required: true

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

    executivesTo: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee",
        required: true

    }],
    executivesCc: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee"
    }],
    vilTo: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee",
        required: true

    }],
    vilCc: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee"
    }],
    confirmationTo: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee",
        required: true

    }],
    confirmationCc: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalEmployee"
    }],
    doctorsTo: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalDoctor"
    }],
    doctorsCc: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalDoctor"
    }],
    partner: {
        type: String,
        required: 'Partner id is required',
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('hospitalZone', hospitalZone, 'hospitalZone');