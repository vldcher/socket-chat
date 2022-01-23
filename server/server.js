const http = require("http");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const socketIo = require("socket.io");
const { addUser, removeUser, getUsersInRoom } = require("./chat/users");
const { addMessage, getMessagesInRoom } = require("./chat/messages");

const app = express();

const localOrigin = "http://localhost:8081";

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: localOrigin,
        methods: ["GET", "POST"],
        credentials: true,
    },
});


const db = require("./models");
const Role = db.role;

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to chat application." });
});

db.sequelize.sync({force: true}).then(() => {
    console.log('Drop and Resync Db');
    initial();
});

function initial() {
    Role.create({
        id: 1,
        name: "user"
    });

    Role.create({
        id: 2,
        name: "moderator"
    });

    Role.create({
        id: 3,
        name: "admin"
    });
}

// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);


// chat part
const USER_JOIN_CHAT_EVENT = "USER_JOIN_CHAT_EVENT";
const USER_LEAVE_CHAT_EVENT = "USER_LEAVE_CHAT_EVENT";
const NEW_CHAT_MESSAGE_EVENT = "NEW_CHAT_MESSAGE_EVENT";
const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);

    // Join a conversation
    const { roomId, name, picture } = socket.handshake.query;
    socket.join(roomId);

    const user = addUser(socket.id, roomId, name, picture);
    io.in(roomId).emit(USER_JOIN_CHAT_EVENT, user);


    const joinedMessage = {
        body: `${user.name} has joined the chat`,
        senderId: 'system',
        user: user,
    };
    const message = addMessage(roomId, joinedMessage);

    //displays a joined room message to all other room users except that particular user
    socket.broadcast.to(roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);

    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
        const message = addMessage(roomId, data);
        io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
    });

    // Listen typing events
    socket.on(START_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId).emit(START_TYPING_MESSAGE_EVENT, data);
    });
    socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId).emit(STOP_TYPING_MESSAGE_EVENT, data);
    });

    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.in(roomId).emit(USER_LEAVE_CHAT_EVENT, user);
        socket.leave(roomId);

        const byeMessage = {
            body: `${user.name} leave the chat`,
            senderId: 'system',
            user: user,
        };
        const message = addMessage(roomId, byeMessage);
        socket.broadcast.to(roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
    });
});


// set port, listen for requests
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

app.get("/rooms/:roomId/users", (req, res) => {
    const users = getUsersInRoom(req.params.roomId);
    return res.json({ users });
});

app.get("/rooms/:roomId/messages", (req, res) => {
    const messages = getMessagesInRoom(req.params.roomId);
    return res.json({ messages });
});
