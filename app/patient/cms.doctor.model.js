const mongoose = require('mongoose');

// const Any = new mongoose.Schema({ any: Schema.Types.Mixed });
const doctor = mongoose.Schema({

});

const conn = mongoose.createConnection(process.env.cms);

// const UserInfo = myDB.model('userInfo', userInfoSchema);

module.exports = conn.model('doctor', doctor, 'doctor');