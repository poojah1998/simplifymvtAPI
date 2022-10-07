const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalpatient = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true

    },
    country: {
        type: String,
        required: true

    },
    hospital: {
        type: Array,
        required: true
    },
    age: {
        type: String,
        required: true

    },
    ageduration: {
        type: String,
        required: true

    },
    contact: {
        type: String,

    },
    emailid: {
        type: String,
        required: true

    },
    treatment: {
        type: String,
        required: true

    },
    source: {
        type: String,
        required: true

    },
    refferalpartner: {
        type: Object,

    },
    patientProfile: {
        type: Array
    },

    medicalhistory: {
        type: String,
        required: true

    },
    remarks: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    associatedhospital: {
        type: Object,
        required: true

    },
    mhid: {
        type: String,
        required: true

    },
    hospitalQueryAssigns: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalQueryAssign"
    }],
    hospitalVilAssigns: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalVilAssign"
    }],
    hospitalConfirmationAssign: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalConfirmationAssign"
    }],
    hospitalOpinionsAdded: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalOpinionAdded"
    }],
    hospitalOpdAdded: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalOpdAdded"
    }],
    hospitalOpinionOwn: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalOpinionOwn"
    }],
    DoctorOpinionAdded: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalOpinionOwn"
    }],
    hospitalOpinionsSent: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalOpinionSent"
    }],
    hospitalOpdAssigns: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalOpdAssign"
    }],
    hospitalOpdSent: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalOpdSent"
    }],

    hospitalVilSent: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalVilSent"
    }],


}, {
    timestamps: true
});

// Custom validation for email
hospitalpatient.path('emailid').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

module.exports = mongoose.model('hospitalpatient', hospitalpatient, 'hospitalpatient');