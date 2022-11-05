const mongoose = require('mongoose');
const Schema = mongoose.Schema

var refferalScema = new mongoose.Schema({

    name: {
        type: String,
        required: 'Name is required',

    },
    emailid: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true

    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
        minlength: [4, 'Password must be atleast 4 character long']
    },
    contact: {
        type: String,
        required: 'Contact is required',

    },
    date: {
        type: Date,
        default: Date.now
    },
    country: {
        type: String,
        required: 'Country is required',

    },
    branchoffice: {
        type: String,

    },
    Role: {
        type: String,
        default: 'Refferal Partner',
    },
    partnercategory: {
        type: String,
        required: 'Partner category is required',

    },


    fees: {
        type: String,
        required: 'Fees is required',

    },
    feescategory: {
        type: String,
        required: 'Fees category is required',

    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});

// Custom validation for email
// refferal.path('emailid').validate((val) => {
//     emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return emailRegex.test(val);
// }, 'Invalid e-mail.');
module.exports = mongoose.model('refferal', refferalScema);