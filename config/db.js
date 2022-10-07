const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(`${process.env.DB}`, (err) => {
    if (!err)
        console.log('MongoDB connection succeeded.');
    else
        console.log('Error in DB connection : ' + err);
});

module.exports = mongoose;