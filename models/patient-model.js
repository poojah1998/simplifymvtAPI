const mongoose = require('mongoose');
const Schema = mongoose.Schema

var patientSchema = new mongoose.Schema({

    name: {
        type: String,

    },
    gender: {
        type: String,

    },
    queryClosed: {
        type: Boolean,
        default: false
    },
    closedDate: {
        type: Date,
    },
    closedReason: {
        type: String,
    },
    country: {
        type: String,
    },
    age: {
        type: String,

    },
    ageduration: {
        type: String,

    },
    contact: {
        type: String,

    },
    emailid: {
        type: String,

    },
    treatment: {
        type: String,

    },
    source: {
        type: String,

    },
    uhidcode: {
        type: String,

    },
    passportNumber: {
        type: String,

    },
    refferalpartner: {
        type: Object,

    },
    comment: {
        type: Array,

    },
    patientProfile: {
        type: Array
    },
    medicalhistory: {
        type: String
    },
    remarks: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    role: {
        type: Object,

    },
    branchoffice: {
        type: String,
        default: 'NAN'

    },
    employee: {
        type: String,

    },
    differentPatient: {
        type: Boolean,
        default: false
    },
    companyname: {
        type: String,

    },
    mhid: {
        type: String,

    },
    currentstatus: {
        type: String,
        default: "NAN"
    },
    aggregator: {
        type: Array,
    },
    companyNames: {
        type: Array,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
    requests: [{
        type: Schema.Types.ObjectId,
        ref: "request"
    }],
    receives: [{
        type: Schema.Types.ObjectId,
        ref: "received"
    }],
    receivesedit: [{
        type: Schema.Types.ObjectId,
        ref: "receivededit"
    }],
    hospitalopinions: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalopinion"
    }],
    doctoropinions: [{
        type: Schema.Types.ObjectId,
        ref: "doctoropinion"
    }],
    sentopinions: [{
        type: Schema.Types.ObjectId,
        ref: "sentopinion"
    }],
    requestvils: [{
        type: Schema.Types.ObjectId,
        ref: "requestvil"
    }],
    responsevils: [{
        type: Schema.Types.ObjectId,
        ref: "responsevil"
    }],

    sentvils: [{
        type: Schema.Types.ObjectId,
        ref: "sentvil"
    }],
    pdfdataopinions: [{
        type: Schema.Types.ObjectId,
        ref: "pdfdataopinion"
    }],

    confirmations: [{
        type: Schema.Types.ObjectId,
        ref: "confirmation"
    }],
    preintimations: [{
        type: Schema.Types.ObjectId,
        ref: "preintimation"
    }],
    opdrequests: [{
        type: Schema.Types.ObjectId,
        ref: "opdrequest"
    }],
    opdresponses: [{
        type: Schema.Types.ObjectId,
        ref: "opdresponse"
    }],
    opdsents: [{
        type: Schema.Types.ObjectId,
        ref: "opdsent"
    }],
    pirequests: [{
        type: Schema.Types.ObjectId,
        ref: "pirequest"
    }],
    piresponses: [{
        type: Schema.Types.ObjectId,
        ref: "piresponse"
    }],
    pisents: [{
        type: Schema.Types.ObjectId,
        ref: "pisent"
    }],
}, {
    timestamps: true
});
module.exports = mongoose.model('patient',patientSchema);