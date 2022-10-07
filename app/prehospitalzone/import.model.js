const mongoose = require('mongoose');
const Schema = mongoose.Schema

var preimport = new mongoose.Schema({
    import: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "adminSchema"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('preimport', preimport, 'preimport');