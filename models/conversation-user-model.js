const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const conversationUserSchema = new Schema({
    
    conversation_id: {
        type: Schema.Types.ObjectId, ref: 'conversation'
    },
    user_id: {
        type: Schema.Types.ObjectId, ref: 'user'
    },
    isAdmin: Boolean,
    isReferal:Boolean
   
});
module.exports = mongoose.model('conversationUser', conversationUserSchema);