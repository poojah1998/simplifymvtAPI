const mongoose = require('mongoose');
const Schema = mongoose.Schema
var userrole = new mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now
    },
    mobile: {
        type: String,
        required: 'Mobile is required',
    },
    country: {
        type: String,
        required: 'country is required',
    },
    Role: {
        type: String,
        required: 'Role is required',
    },
    adminname: {
        type: String,
        required: 'Adminname is required',
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
    hospitals: {
        type: Array,
    }

}, {
    timestamps: true
});
// Custom validation for email
userrole.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events

module.exports = mongoose.model('userrole', userrole, 'userrole');