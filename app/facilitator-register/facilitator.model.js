const mongoose = require('mongoose');
const Schema = mongoose.Schema
var adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name can\'t be empty'
    },
    email: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true
    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
        minlength: [4, 'Password must be atleast 4 character long']
    },
    mobile: {
        type: String,
        required: 'Mobile is required',
    },

    Role: {
        type: String,
        required: 'Role is required',
    },
    customer_id: {
        type: String,
    },
    subscription_id: {
        type: String

    },
    aggregator: [{
        type: Schema.Types.ObjectId,
    }],
    distributor: [{
        type: Schema.Types.ObjectId,
    }],
    doctors: [{
        type: Schema.Types.ObjectId,
        ref: "doctor"
    }],
    hospitals: [{
        type: Schema.Types.ObjectId,
        ref: "hospital"
    }],
    patients: [{
        type: Schema.Types.ObjectId,
        ref: "patient"
    }],

    refferals: [{
        type: Schema.Types.ObjectId,
        ref: "refferal"
    }],

    myhospitalzones: [{
        type: Schema.Types.ObjectId,
        ref: "myhospitalzone"
    }],

    myemployees: [{
        type: Schema.Types.ObjectId,
        ref: "myemployee"
    }],

    mydoctors: [{
        type: Schema.Types.ObjectId,
        ref: "mydoctor"
    }],
    mydefualts: [{
        type: Schema.Types.ObjectId,
        ref: "mydefualt"
    }],
    prehospitalzones: [{
        type: Schema.Types.ObjectId,
        ref: "prehospitalzone"
    }],

    preemployees: [{
        type: Schema.Types.ObjectId,
        ref: "preemployee"
    }],

    predoctors: [{
        type: Schema.Types.ObjectId,
        ref: "predoctor"
    }],
    predefualts: [{
        type: Schema.Types.ObjectId,
        ref: "predefualt"
    }],
    requests: [{
        type: Schema.Types.ObjectId,
        ref: "request"
    }],

    receivesedit: [{
        type: Schema.Types.ObjectId,
        ref: "receivededit"
    }],
    requestvils: [{
        type: Schema.Types.ObjectId,
        ref: "requestvil"
    }],
    responsevils: [{
        type: Schema.Types.ObjectId,
        ref: "responsevil"
    }],
    sentopinions: [{
        type: Schema.Types.ObjectId,
        ref: "sentopinion"
    }],

    companydetails: [{
        type: Schema.Types.ObjectId,
        ref: "companydetail"
    }],
    branchcompanydetails: [{
        type: Schema.Types.ObjectId,
        ref: "branchcompanydetail"
    }],
    credentials: [{
        type: Schema.Types.ObjectId,
        ref: "credential"
    }],
    userroles: [{
        type: Schema.Types.ObjectId,
        ref: "userrole"
    }],
    reports: [{
        type: Schema.Types.ObjectId,
        ref: "report"
    }],
    preimports: [{
        type: Schema.Types.ObjectId,
        ref: "preimport"
    }],
    emailscc: [{
        type: Schema.Types.ObjectId,
        ref: "emailcc"
    }],
    employees: [{
        type: Schema.Types.ObjectId,
        ref: "employee"
    }],
}, {
    timestamps: true
});
// Custom validation for email
adminSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events

module.exports = mongoose.model('adminSchema', adminSchema, 'adminSchema');