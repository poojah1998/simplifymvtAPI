const mongoose = require('mongoose');
const Schema = mongoose.Schema

var doctor = new mongoose.Schema({

    name: {
        type: String,
        required: 'Name is required',

    },
    department: {
        type: Array,
        required: 'Department is required',

    },
    associatedhospital: {
        type: Schema.Types.ObjectId,
        ref: "hospital"
    },
    degree: {
        type: String,
        required: 'Degree is required',

    },
    expirence: {
        type: String,
        required: 'Expirence is required',

    },
    profile: {
        type: Object
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('doctor', doctor, 'doctor');