const express=require('express');
const router=express.Router();
const user =require('../api/user');
const chat =require('../api/chat');
const conversationUser =require('../api/conversation-user');
const conversation =require('../api/conversation');
const hashtag =require('../api/hashtag');





//user 
router.post('/addUser',user.addUser);
router.get('/findUser/:id',user.getUserById);
router.put('/updateUser/:id',user.updateUserById);
router.delete('/deleteUser/:id',user.deleteUserById);
router.get('/getAllUserData',user.getAllUserData);
//chat
router.post('/addChat',chat.addChat);
router.get('/findChat/:id',chat.getChatById);
router.put('/updateChat/:id',chat.updateChatById);
router.delete('/deleteChat/:id',chat.deleteChatById);
router.get('/getAllChatbyId/:id',chat.getAllChatbyConversationId);

//conversation user
router.post('/addconversationUser',conversationUser.addConversationUser);
router.get('/findconversationUser/:id',conversationUser.getConversationUserById);
router.put('/updateconversationUser/:id',conversationUser.updateConversationUserById);
router.delete('/deleteconversationUser/:id',conversationUser.deleteConversationUserById);
router.get('/getAllconversationUser/:id',conversationUser.getAllConversationUser);
//conversation 
router.post('/addconversation',conversation.addConversation);
router.get('/findconversation/:id',conversation.getConversationById);
router.put('/updateconversation/:id',conversation.updateConversationById);
router.delete('/deleteconversation/:id',conversation.deleteConversationById);
router.get('/getAllconversation',conversation.getAllConversation);
//hashtag

router.post('/addhashtag',hashtag.addhashtag);
router.get('/findhashtag/:id',hashtag.gethashtagById);
router.put('/updatehashtag/:id',hashtag.updatehashtagById);
router.delete('/deletehashtag/:id',hashtag.deletehashtagById);
router.get('/getAllhashtag',hashtag.getAllhashtag);
module.exports=router;