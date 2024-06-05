const axios = require('axios');
const { getVideoMetadata } = require('./services/embed');
const stream = require('stream');

const { uploadLocalFile, uploadImageToS3 } = require('./s3.config');
const { Console } = require('console');
const { TIMEOUT } = require('dns');

const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
  timeout: 60000
});

let users = [];
const rooms = {};

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const fetchRoomsFromAPI = async () => {
  try {
    const response = await axios.get('http://localhost:8800/api/conversations/allmembersroom'); // Địa chỉ API thay thế
    const apiRooms = response.data;

    apiRooms.forEach(room => {
      r = { roomId: room.conversationId, users: [] }
      rooms[room.conversationId] = r;
    });
    console.log('Rooms fetched from API:', rooms);
  } catch (error) {
    console.error('Error fetching rooms from API:', error);
  }
};
fetchRoomsFromAPI();

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  console.log(users)
};

const getUser = (userId) => {
  if (users.find((user) => user.userId === userId) === undefined) {
    return { userId }
  }
  console.log(users.find((user) => user.userId === userId))
  return users.find((user) => user.userId === userId);
};


const handleUploadLocalFile = async (file, fileName, mimeType) => {
  const url = await uploadImageToS3(file, fileName, mimeType)
  console.log(url)
  return url
};

io.on("connection", (socket) => {
  const fetchAddUserInRoom = async (userId) => {
    try {
      const response = await axios.get('http://localhost:8800/api/conversations/allmembersroom'); // Địa chỉ API thay thế
      const apiRooms = response.data;

      apiRooms.forEach(room => {
        if (room.userId === userId && rooms[room.conversationId]) {
          const user = { userId: userId, socketId: socket.id };
          const userExists = rooms[room.conversationId].users.some(u => u.userId === user.userId);
          if (!userExists) {
            rooms[room.conversationId].users.push(user);
          }
        };
      });
    } catch (error) {
      console.error(error);
    }
  };

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log(users)
    if (userId) fetchAddUserInRoom(userId);
    console.log('Rooms fetched from SOCKET:', rooms);
    io.emit("getUsers", users);
  });

  socket.on("removeUser", (userId) => {
    const user = getUser(userId)
    removeUser(user?.socketId);
    io.emit("getUsers", users);
  })

  socket.on("sendMetadata", async ({ senderId, receiverId, text, type, file, fileName, mimeType }) => {
    
    const user = getUser(receiverId);
    if (type === "video_link") {
      try {
        const res = await getVideoMetada;ta(text);
        console.log("abcxyz" + res)
        videoMetadata = res;
        const thumbnail_res = await axios.get(videoMetadata.file_url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(thumbnail_res.data, 'binary');
        console.log(buffer)
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const fileName = Date.now().toString() + `.jpeg`;
        const mimeType = "image/jpeg"
        const file_url = await uploadImageToS3(bufferStream, fileName, mimeType)
        console.log(file_url)

        const title = videoMetadata.title

        io.to(getUser(senderId).socketId).emit("getMetadata", {
          title,
          file_url
        });
      } catch (err) {
        console.log(err);
      }
    }
    else if (type === "image" || type === "audio" || type === "video") {
      console.log("Đang up " + type)
      url = await handleUploadLocalFile(file, fileName, mimeType)
      console.log("url l87 " + url)
      const title = null
      const file_url = url
      if (user !== undefined) {
        io.to(getUser(senderId).socketId).emit("getMetadata", {
          title,
          file_url
        });
        console.log("Gui o day 99")
      }
    }
  });

  //send and get message
  socket.on("sendMessage", async ({ messageId, senderId, receiverId, text, type, title, file_url }) => {
    const user = getUser(receiverId);
    console.log(user)
    if (type === "video_link") {
      try {
        if (user !== undefined) {
          io.to(user.socketId).emit("getMessage", {
            messageId,
            senderId,
            text,
            type,
            title,
            file_url
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    else if (type === "image" || type === "audio" || type === "video") {
      if (user !== undefined) {
        io.to(user.socketId).emit("getMessage", {
          messageId,
          senderId,
          text,
          type,
          title,
          file_url,
        });
        console.log("Gui o day 134")
      }
    }
    else {
      if (user !== undefined) {
        io.to(user.socketId).emit("getMessage", {
          messageId,
          senderId,
          text,
          type
        });
      }
    }

  });

  socket.on("sendReaction", ({ reactionId, messageId, userId, reaction }) => {
    console.log("In send reaction: " + reactionId + messageId + userId + reaction)
    const receiver = users.find((user) => user.userId !== userId)
    console.log(receiver)
    io.to(receiver?.socketId).emit("getReaction", {
      reactionId,
      messageId,
      userId,
      reaction
    })
    io.to(getUser(userId).socketId).emit("getReaction", {
      reactionId,
      messageId,
      userId,
      reaction
    })
  })


  socket.on("sendNotification", ({ senderId, receiverId, type }) => {
    const receiver = getUser(receiverId);
    console.log(receiver)
    io.to(receiver?.socketId).emit("getNotification", {
      senderId,
      type,
    });
  });

  //call mess
  socket.on('alluser-in-room', (roomId) => {
    const room = rooms[roomId];
    const usersInRoom = room ? room.users : [];
    socket.emit('user-in-room', usersInRoom);
  });

  socket.on('call-group', ({ signalData, roomId, from }) => {
    const room = rooms[roomId];
    console.log("Đã tới 225")
    if (room) {
      room.users.forEach(user => {
        if (user.userId !== from) {
          console.log("229")
          io.to(user.socketId).emit('group-call-made', { signal: signalData, from });
          console.log("231")
        }
      });
    }
  });
  /*socket.on('call-group', ({ roomId, from }) => {
    const room = rooms[roomId];
    console.log("Đã tới 225")
    if (room) {
      room.users.forEach(user => {
        if (user.userId !== from) {
          console.log("229")
          io.to(user.socketId).emit('group-call-made', { signal: signalData, from });
          console.log("231")
        }
      });
    }
  });*/

  socket.on('answer-call', ({ signal, to }) => {
    const index = users.findIndex(user => user.socketId === socket.id);
    const user=users.find(user => user.userId === to)
    if (user) {
      console.log(users[index].userId+" đã chấp nhận cuộc gọi từ "+user.userId)
      io.to(user.socketId).emit('call-accepted', signal);
    }
  });


  //when disconnect
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter(user => user.socketId !== socket.id);
      io.to(roomId).emit('update-room', rooms[roomId].users);
    }
    console.log("a user disconnected!");
    removeUser(socket.id);
    console.log(users)
    console.log('Rooms fetched from SOCKET:', rooms);
    io.emit("getUsers", users);
  });
});
