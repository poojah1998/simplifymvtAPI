const mongoose = require('mongoose');

// const Any = new mongoose.Schema({ any: Schema.Types.Mixed });
const hospital = mongoose.Schema({

    // permissions:Array
});

const conn = mongoose.createConnection(process.env.cms);

// const UserInfo = myDB.model('userInfo', userInfoSchema);

module.exports = conn.model('hospital', hospital, 'hospital');