const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const conversationSchema = new Schema({
    name: String,
    type:String,
    owner_id:String,
    image:String
   

   
});
module.exports = mongoose.model('conversation', conversationSchema);