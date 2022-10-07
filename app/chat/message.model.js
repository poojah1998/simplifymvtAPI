const mongoose = require('mongoose');
const Schema = mongoose.Schema

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        required: true

    },
    sender: {
        type: Schema.Types.ObjectId,
        required: true

    },
    message: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true });

module.exports = mongoose.model("message", MessageSchema);