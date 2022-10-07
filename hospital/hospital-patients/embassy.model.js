const mongoose = require('mongoose');

// const Any = new mongoose.Schema({ any: Schema.Types.Mixed });
const embassy = mongoose.Schema({

    // permissions:Array
});

const conn = mongoose.createConnection(process.env.cms);

// const UserInfo = myDB.model('userInfo', userInfoSchema);

module.exports = conn.model('embassy', embassy, 'embassy');