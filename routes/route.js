const express=require('express');
const router=express.Router();
const user =require('../api/user')


router.use('/student',require('../api/student'));
// router.use('/chat',require('../api/chat'));
// router.use('/conversation',require('../api/conversation'));
// router.use('/conversationUser',require('../api/conversation-user'));
// router.use('/hashtag',require('../api/hashtag'));
// router.use('/user',require('../api/user'));
router.post('/addUser',user.addUser);
module.exports=router;