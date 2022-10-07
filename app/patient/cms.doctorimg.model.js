const mongoose = require('mongoose');

// const Any = new mongoose.Schema({ any: Schema.Types.Mixed });
const upload_file = mongoose.Schema({

});

const conn = mongoose.createConnection(process.env.cms);

// const UserInfo = myDB.model('userInfo', userInfoSchema);

module.exports = conn.model('upload_file', upload_file, 'upload_file');