var cron = require('node-cron');
const User = require('../../models/user-model');
const Chat = require('../../models/chat-model');
const async = require('async');
const sendMail = require('../mailer');


// const sendMail = cron.schedule('0 0 */10 * * *', () => {
const testCron = async (req, res) => {
    console.log("sdfsdfsdf")
    let allChats = await Chat.find({ isMailAvailability: true, isMailDelivered: false });

    async.each(allChats, (chat, after_chat) => {
        console.log("weeeeeeeeeeeeeeeeeeeeee")
        let emailArray = [];
        let uniqueArr = [];
        async.each(chat.allMentionUsers, (mUser, after_mUser) => {
            console.log("wwwwwwwwwwwwwwwwwwwww", mUser)
            User.findById(mUser).then(user => {
                if (user) {
                    // console.log('1111111111111111111111')
                    emailArray.push(user.email);
                    after_mUser();
                }
                else {
                    // console.log('2222222222222')
                    after_mUser();
                    res.send("error 000");
                }
            }).catch(error => {
                after_mUser();
                res.send("error 001");
            })

        }, (err) => {
            if (err) {
                res.send("error 002");
            } else {
                console.log('4444444444444444444444')
                uniqueArr = [...new Set(emailArray)];
                sendMail(uniqueArr, "There is a new Message", chat.message);
                Chat.findByIdAndUpdate(chat._id, { isMailDelivered: true }).then(() => {
                    after_chat();
                }).catch(error => {
                    after_chat();
                    res.send("error 001");
                })

            }
        });

    }, (err) => {
        if (err) {
            res.send("error 003");
        } else {
            res.send("All mails are delivered")
        }
    });
};







module.exports = {
    testCron

}