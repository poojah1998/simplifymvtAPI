const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chartSchema = new Schema({
    conversation_id :String,
    sender_id:String,
    message:String,
    files:String,
    image:String,
    tag_id:String,
    hashtag_id:String
   
});
module.exports = mongoose.model('chat', chartSchema);