const express = require('express')
const router = express.Router()
const chat = require('./controller')
const verify = require('../facilitator-register/auth.controller')

router.post('/conversation', verify.verifytoken, chat.postConversation);
router.get('/:userId/conversation', verify.verifytoken, chat.getConversationById);

router.get('/:firstUserId/:secondUserId/conversation', verify.verifytoken, chat.getAllConversation);

router.get('/:userId/members', verify.verifytoken, chat.getMembers);

router.post('/:userId/conversationmembers', verify.verifytoken, chat.getConversationMembers);

// Messages
router.post('/message', verify.verifytoken, chat.postMessage);
router.get('/message/:conversationid', verify.verifytoken, chat.getMessageById);

module.exports = router