var cron = require('node-cron');
const User = require('../../models/user-model');
const Chat = require('../../models/chat-model');
const async = require('async');


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
const sendMail = async (req, res) => {
    let result = await Chat.find({ isMailAvailability: true, isMailDelivered: false });
    let uniqueArr = [];
    console.log(result)
    async.each(result, (ele, after_result) => {
        console.log(result);
        const mentionUserArray = result.mentionUserArray;
        const tagUserAraay = result.tagUserAraay;
        // merge two arrays
        let newUserArray = [...mentionUserArray, ...tagUserAraay];
        uniqueArr = [...new Set(newUserArray)];
        console.log(uniqueArr);
        // let mentionData = [];
        // console.log(ele.data());
        // let obj = ele.data();
        // obj['mentionId'] = ele.mention_id;
        // mentionData.push(obj);
        after_result();
    }), (err) => {
        if (err) {
            res.send("error");
        } else {
            
            res.send(uniqueArr)
        }
    };
};







module.exports = {
    sendMail

}