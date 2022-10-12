const express=require('express');
const router=express.Router();
const user =require('../api/user');
const chat =require('../api/chat');
const conversationUser =require('../api/conversation-user');
const conversation =require('../api/conversation');
const hashtag =require('../api/hashtag');



router.use('/student',require('../api/student'));

// router.use('/chat',require('../api/chat'));
// router.use('/conversation',require('../api/conversation'));
// router.use('/conversationUser',require('../api/conversation-user'));
// router.use('/hashtag',require('../api/hashtag'));
// router.use('/user',require('../api/user'));


//user 
router.post('/addUser',user.addUser);
router.get('/findUser',user.getUserById);
router.put('/updateUser',user.updateUserById);
router.delete('/deleteUser',user.deleteUserById);
//chat
router.post('/addChat',chat.addChat);
router.get('/findChat',chat.getChatById);
router.put('/updateChat',chat.updateChatById);
router.delete('/deleteChat',chat.deleteChatById);
//conversation user
router.post('/addconversationUser',conversationUser.addConversationUser);
router.get('/findconversationUser',conversationUser.getConversationUserById);
router.put('/updateconversationUser',conversationUser.updateConversationUserById);
router.delete('/deleteconversationUser',conversationUser.deleteConversationUserById);
//conversation 
router.post('/addconversation',conversation.addConversation);
router.get('/findconversation',conversation.getConversationById);
router.put('/updateconversation',conversation.updateConversationById);
router.delete('/deleteconversation',conversation.deleteConversationById);
//hashtag

router.post('/addhashtag',hashtag.addhashtag);
router.get('/findhashtag',hashtag.gethashtagById);
router.put('/updatehashtag',hashtag.updatehashtagById);
router.delete('/deletehashtag',hashtag.deletehashtagById);
module.exports=router;