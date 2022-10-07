const mongoose = require('mongoose');
const Schema = mongoose.Schema

var ConversationSchema = new mongoose.Schema({
    members: {
        type: Array,
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model("conversation", ConversationSchema);