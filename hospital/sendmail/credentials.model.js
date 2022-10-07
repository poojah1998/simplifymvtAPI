const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalCredential = new mongoose.Schema({

    email1: {
        type: String,
        required: 'Email1 can\'t be empty',

    },
    password1: {
        type: String,
        required: 'Password1 can\'t be empty',

    },

    email2: {
        type: String,
        required: 'Email2 can\'t be empty',

    },
    password2: {
        type: String,
        required: 'Password2 can\'t be empty',

    },
    host: {
        type: String,
        required: 'host is required',

    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "hospitalauth"
    },
}, {
    timestamps: true
});

// Custom validation for email
hospitalCredential.path('email1').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');
hospitalCredential.path('email2').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');
module.exports = mongoose.model('hospitalCredential', hospitalCredential, 'hospitalCredential');