const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitaldetail = new mongoose.Schema({

    name: {
        type: String,
        required: 'Name is required',

    },
    gstno: {
        type: String,
        required: 'GST No is required',

    },
    gstnoimg: {
        type: String,

    },
    registration: {
        type: String,
        required: 'Registration Text is required',
    },
    registrationimg: {
        type: String,
    },
    logosize1: {
        type: String,
    },
    logosize2: {
        type: String,
    },
    logosize3: {
        type: String,
    },
    companyemail: {
        type: String,
        required: 'Company Email Id is required',
    },
    facebooklink: {
        type: String,

    },
    twitterlink: {
        type: String,

    },
    linkedinlink: {
        type: String,

    },
    instagramlink: {
        type: String,

    },
    uhidcode: {
        type: String,
        required: 'Uhid Code is required',

    },
    address: {
        type: Array,
        required: 'Address is required',

    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: "hospitalauth"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('hospitaldetail', hospitaldetail, 'hospitaldetail');