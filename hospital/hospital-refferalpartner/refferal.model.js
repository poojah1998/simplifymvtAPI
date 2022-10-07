const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalrefferalpartner = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true

    },

    contact: {
        type: String,

    },
    emailid: {
        type: String,
        required: true,
        unique: true


    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
        minlength: [4, 'Password must be atleast 4 character long']
    },
    partnercategory: {
        type: String,
        required: true

    },
    target: {
        type: String,

    },
    associatedHospital: {
        type: Object,
        required: true

    },
    role: {
        type: String,
        required: true
    },
    refferalfees: {
        type: String,
        required: true
    },
    feescategory: {
        type: String,
        required: 'Fees category is required',

    },
    hospitalVisiblity: [{
        type: Schema.Types.ObjectId,
        required: true
    }],
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "hospitalauth"
    },
});

// Custom validation for email
hospitalrefferalpartner.path('emailid').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

module.exports = mongoose.model('hospitalrefferalpartner', hospitalrefferalpartner, 'hospitalrefferalpartner');