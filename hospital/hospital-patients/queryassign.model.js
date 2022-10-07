const mongoose = require('mongoose');
const Schema = mongoose.Schema

var hospitalQueryAssign = new mongoose.Schema({

    hospitalName: {
        type: String,
        required: true
    },
    hospitalId: {
        type: String,
        required: true

    },
    hospitalEmail: {
        type: Object,

    },
    history: {
        type: Array,
    },
    linkStatus: {
        type: String,
        required: 'linkstatus is required',
        default: 'active'

    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "hospitalpatient"
    },

}, {
    timestamps: true
});


module.exports = mongoose.model('hospitalQueryAssign', hospitalQueryAssign, 'hospitalQueryAssign');