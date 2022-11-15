const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const conversationUserSchema = new Schema({
    
    conversation_id: {
        type: Schema.Types.ObjectId, ref: 'conversation'
    },
    user_id: {
        type: Schema.Types.ObjectId,
    },
    user_type: {
        type: String, 
    },
    isAdmin: Boolean,
    isReferal:Boolean
   
}, { timestamps: true });
module.exports = mongoose.model('conversationUser', conversationUserSchema);