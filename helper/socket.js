const User =require('../models/user-model')
const express = require("express");
const app = express();
const http = require('http');
const server = http.Server(app);
require('dotenv').config();
const socketIO = require('socket.io');
const io = socketIO(server);
const SOCKET = process.env.SOCKET;


io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('new-checkpoint', (checked) => {
        io.emit('new-checkpoint', checked);
    })
    socket.on('new-submit', (checked) => {
        io.emit('new-submit', checked);
    })
    socket.on('new-qa', (checked) => {
        io.emit('new-qa-emited', {checked, userId: checked.userId});
    })
});


server.listen(SOCKET, () => {
    console.log(`Example app listening on port ${SOCKET}!`);
});
