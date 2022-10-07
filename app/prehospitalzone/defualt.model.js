const mongoose = require('mongoose');
const Schema = mongoose.Schema

var predefualt = new mongoose.Schema({

    hospitalid: {
        type: String,
        required: 'Hospital id is required',

    },

    executivesto: [{
        type: Schema.Types.ObjectId,
        ref: "preemployee"

    }],
    executivescc: [{
        type: Schema.Types.ObjectId,
        ref: "preemployee"
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('predefualt', predefualt, 'predefualt');