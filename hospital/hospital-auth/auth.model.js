const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema
var hospitalauth = new mongoose.Schema({
    name: {
        type: Object,
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
        required: 'customer_id is required',
    },
    subscription_id: {
        type: String

    },
    distributor: [{
        type: Schema.Types.ObjectId,
    }],
    hospitaluserroles: [{
        type: Schema.Types.ObjectId,
        ref: "hospitaluserrole"
    }],
    hospitaldetails: [{
        type: Schema.Types.ObjectId,
        ref: "hospitaldetail"
    }],
    hospitalreports: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalreport"
    }],

    hospitalrefferalpartners: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalrefferalpartner"
    }],
    hospitalCredentials: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalCredential"
    }],

    hospitalBankDetails: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalBankDetail"
    }],
    hospitalDisputeManagement: [{
        type: Schema.Types.ObjectId,
        ref: "hospitalDisputeManagement"
    }]

}, {
    timestamps: true
});
// Custom validation for email
hospitalauth.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events

module.exports = mongoose.model('hospitalauth', hospitalauth, 'hospitalauth');