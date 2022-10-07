const mongoose = require('mongoose');
const Schema = mongoose.Schema



var hospitalCounter = new mongoose.Schema({
    seq: { type: Number, default: 10001001 },
    hospital: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('hospitalCounter', hospitalCounter, 'hospitalCounter');