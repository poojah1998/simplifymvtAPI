const io = require("socket.io")(3000, {
    cors: {
        origin: '*',
    },
});
let users = [];
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
    //when ceonnect
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        console.log(users)
        io.emit("getUsers", users);
    });
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                message,
            });
        }
    });
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
})