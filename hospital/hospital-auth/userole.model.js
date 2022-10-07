const mongoose = require('mongoose');
const Schema = mongoose.Schema
var hospitaluserrole = new mongoose.Schema({
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
    hospitalname: {
        type: String,
        required: 'Hospitalname is required',
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "hospitalauth"
    },
    hospitalVisiblity: [{
        type: Schema.Types.ObjectId,
    }],

    country: {
        type: Array
    },
    partner: {
        type: Array
    }
}, {
    timestamps: true
});
// Custom validation for email
hospitaluserrole.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events

module.exports = mongoose.model('hospitaluserrole', hospitaluserrole, 'hospitaluserrole');