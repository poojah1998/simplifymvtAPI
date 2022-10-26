var cron = require('node-cron');
const User = require('../../models/user-model');
const Chat = require('../../models/chat-model');
const async = require('async');
const sendMail = require('../mailer');


// const sendMail = cron.schedule('0 0 */10 * * *', () => {
//     const checkUser = async (req, res) => {
//         let result = await User.find({ user_id: req.params.id });

//         res.send(result);
//         async.each(result.docs, (ele, after_result) => {
//             let emailData = [];
//             console.log(ele.data());
//             let obj = ele.data();
//             obj['email'] = ele.email;
//             emailData.push(obj);
//             after_result();
//         }).catch((error) => {
//             console.log(error);
//             res.send({ status: 500, msg: error });
//         });


//     };
// });



// const sendMail = cron.schedule('0 0 */10 * * *', () => {
const testCron = async (req, res) => {
    let allChats = await Chat.find({ isMailAvailability: true, isMailDelivered: false });
    async.each(allChats, (chat, after_chat) => {
        let emailArray = [];
        let uniqueArr = [];
        async.each(chat.allMentionUsers, (mUser, after_mUser) => {
            User.findById(mUser).then(user => {
                if (user) {
                    emailArray.push(user.email);
                    after_mUser();
                }
                else {
                    after_mUser();
                    res.send("error 000");
                }
            }).catch(error => {
                after_mUser();
                res.send("error 001");
            })

        }), (err) => {
            if (err) {
                res.send("error 002");
            } else {
                uniqueArr = [...new Set(emailArray)];
                sendMail(uniqueArr, "There is a new Message", chat.message);
                Chat.findByIdAndUpdate(chat._id, { isMailDelivered: true }).then(() => {
                    after_chat();
                }).catch(error => {
                    after_chat();
                    res.send("error 001");
                })

            }
        };

    }), (err) => {
        if (err) {
            res.send("error 003");
        } else {
            res.send("All mails are delivered")
        }
    };
};







module.exports = {
    testCron

}