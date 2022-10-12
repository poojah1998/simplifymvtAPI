const mongoose = require("mongoose");//index js re mangoose ku import kariba darkar nai
mongoose.Promise = global.Promise;//then catch  async awit use pai rakha heichi
                                 //call back method.excicute method...defult method
const db = {
    mongoose:mongoose,
    url :"mongodb://localhost/chatApp",
    options:{
        useNewUrlParser: true,//
        useUnifiedTopology: true
    }
};


module.exports = db;