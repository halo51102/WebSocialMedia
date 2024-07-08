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
const usersInRoom = {}
const usersInCall = {}

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const fetchRoomsFromAPI = async () => {
  try {
    const response = await axios.get('http://192.168.1.189:8800/api/conversations/allmembersroom'); // Địa chỉ API thay thế
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
  /*const { userId, socketId } = socket.handshake.query;
  const user = users.find(user => user.userId === userId)
  if (user) {
    users[userId] = socket.id;

    socket.on('sync-socket-id', ({ oldSocketId, newSocketId }) => {
      if (users[userId] === oldSocketId) {
        users[userId] = newSocketId;
      }
    });

    socket.on('disconnect', () => {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    });
  }*/

  const fetchAddUserInRoom = async (userId) => {
    try {
      const response = await axios.get('http://192.168.1.189:8800/api/conversations/allmembersroom'); // Địa chỉ API thay thế
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
        const res = await getVideoMetada; ta(text);
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

  socket.on("join-room", (roomId, id, userId) => {
    console.log(socket.id)
    const room = rooms[roomId];
    const user = users.find(user => user.userId === userId)
    console.log(user.socketId)

    if (room && user) {
      if (!usersInRoom[roomId]) {
        const r = { roomId: roomId, users: [] };
        usersInRoom[roomId] = r;
      }
      console.log("249: ", usersInRoom);
      if (!usersInRoom[roomId].users.find(user => user.userId === userId)) usersInRoom[roomId].users.push({ userId: user.userId, socketId: socket.id, idpeer: id });
      console.log("251: ", usersInRoom[roomId].users);
      room.users.forEach(user => {
        if (user.userId !== userId && !usersInRoom[roomId].users.some(user => user.userId !== userId)) {
          console.log(user.socketId)
          io.to(user.socketId).emit('group-call-made', { roomId: roomId, from: userId, idpeer: id });
          console.log("257")
        }
      });
    }
  })

  socket.on('accept-call', ({ roomId, id, userId, hispeer }) => {
    console.log(socket.id)
    const room = rooms[roomId];
    const user = users.find(user => user.userId === userId)
    console.log(user.socketId)
    if (room && user) {
      if (!usersInRoom[roomId]) {
        const r = { roomId: roomId, users: [] };
        usersInRoom[roomId] = r;
      }
      console.log("249: ", usersInRoom);
      if (!usersInRoom[roomId].users.find(user => user.userId === userId)) usersInRoom[roomId].users.push({ userId: user.userId, socketId: socket.id, idpeer: id });
      console.log("251: ", usersInRoom[roomId].users);
      usersInRoom[roomId].users.forEach(user => {
        if (user.userId !== userId) {
          console.log(user.socketId)
          console.log(userId + " đã vào phòng " + roomId)
          console.log("đã thấy, ", user.userId)
          io.to(user.socketId).emit('user-connected', id);
          console.log("257")
        }
      })
    }
  });

  /*socket.join(roomId);
  console.log("234: ",roomId, id)
  setTimeout(() => {
    socket.to(roomId).broadcast.emit("user-connected", id);
  }, 1000)*/

  //call mess
  /*socket.on('alluser-in-room', (roomId) => {
    const room = rooms[roomId];
    const usersInRoom = room ? room.users : [];
    socket.emit('user-in-room', usersInRoom);
  });
  
  socket.on('call-group', ({ signalData, roomId, from }) => {
    console.log("240: ",typeof signalData,signalData)
    console.log(socket.id)
    const room = rooms[roomId];
    const user = users.find(user => user.userId === from)
    console.log(user.socketId)
    if (room && user) {
      if (!usersInRoom[roomId]) {
        const r = { roomId: roomId, users: [] };
        usersInRoom[roomId] = r;
      }
      console.log("249: ", usersInRoom);
      if (!usersInRoom[roomId].users.find(user => user.userId === from)) usersInRoom[roomId].users.push({ userId: user.userId, socketId: socket.id });
      console.log("251: ", usersInRoom[roomId].users);
      room.users.forEach(user => {
        if (user.userId !== from) {
          console.log("254")
          console.log(user.socketId)
          io.to(user.socketId).emit('group-call-made', { signal: signalData, from: from, roomId: roomId });
          console.log("257")
        }
      });
    }
  });
  
  
  socket.on('answer-call', ({ signal, to, userId,roomId }) => {
    console.log("266: ",typeof signal,signal)
    if (usersInRoom.hasOwnProperty(roomId)) {
      console.log("266: ", usersInRoom[roomId].users.find(user => user.userId === to))
      const room = usersInRoom[roomId];
      console.log("267: ", socket.id)
      console.log("268: ", to)
      console.log(users)
      const index = users.findIndex(user => user.userId === userId);
      const indexTo = users.findIndex(user => user.userId === parseInt(to,10))
      const userR =  usersInRoom[roomId].users.find(user => user.userId === parseInt(to,10))
  
      console.log(users[indexTo])
      console.log(userR)
      console.log(users[index])
  
      if (users[indexTo] && userR) {
        if (users[index]) {
          if (!usersInRoom[roomId].users.find(user => user.userId === users[index].userId))  usersInRoom[roomId].users.push({ userId: users[index].userId, socketId: socket.id });
          console.log(users[index].userId + " đã chấp nhận cuộc gọi từ " + users[indexTo].userId)
          console.log("273: ", usersInRoom[roomId])
          io.to(userR.socketId).emit('call-accepted', { signal: signal, userId: users[index].userId });
        }
      }
    }
  });
  
  socket.on('end-call', ({ roomId, userId }) => {
  
    if (usersInRoom[roomId]) {
      if (Array.isArray(usersInRoom[roomId].users)) {
        // Remove user from the room
  
        usersInRoom[roomId].users = usersInRoom[roomId].users.filter(user => {
          // Kiểm tra nếu user tồn tại và có thuộc tính userId
          return user && user.userId !== userId;
        });
        console.log("268: ", usersInRoom[roomId]);
        if (usersInRoom.hasOwnProperty(roomId) && Array.isArray(usersInRoom[roomId].users)) {
          usersInRoom[roomId].users.forEach(user => {
            // Check if user object exists and has a userId property
            if (user && user.userId !== userId) {
              io.to(user.socketId).emit('call-ended', { from: userId });
            }
          });
        }
      } else {
        console.error(`usersInRoom[${roomId}].users is not an array or is undefined`);
      }
      // Optional: If the room is empty, delete it
      if (usersInRoom[roomId].users.length === 0) {
        delete usersInRoom[roomId];
      }
  
      console.log("278: ", usersInRoom[roomId]);
    }
  });*/
  /*socket.on('join-call', ({ roomId, userId }) => {
    if (!usersInCall[roomId]) {
      usersInCall[roomId] = { roomId, users: [] };
    }
    usersInCall[roomId].users.push({ userId: userId, socketId: socket.id });
  
    socket.join(roomId);
    io.to(roomId).emit('user-joined', userId);
  });
  socket.on('leave-call', ({ roomId, userId }) => {
    if (usersInCall[roomId]) {
      usersInCall[roomId].users = usersInCall[roomId].users.filter(user => user.userId !== userId);
      socket.leave(roomId);
      io.to(roomId).emit('user-left', userId);
    }
  });
  
  
  socket.on('call-user', (data) => {
    io.to(data.to).emit('receive-call', { signal: data.signal, from: data.from });
  });
  
  socket.on('accept-call', (data) => {
    io.to(data.to).emit('call-accepted', data.signal);
  });
  
  socket.on('end-call', (data) => {
    io.to(data.to).emit('call-ended');
  });*/

  /*socket.on('join-call', ({ roomId, userId }) => {
    socket.join(roomId);
    if (!usersInRoom[roomId]) {
      usersInRoom[roomId] = { roomId, users: [] };
    }
  
    // Check if the user is already in the room
    const userAlreadyInRoom = usersInRoom[roomId].users.find(user => user.userId === userId);
    if (!userAlreadyInRoom) {
      usersInRoom[roomId].users.push({ userId, socketId: socket.id });
    }
  
    io.to(roomId).emit('user-joined', userId);
    console.log(usersInRoom);
  });
  
  socket.on('group-call-made', ({ roomId, signal, from }) => {
    const room = usersInRoom[roomId];
    if (room) {
      room.users.forEach(user => {
        if (user.userId !== from) {
          io.to(user.socketId).emit('group-call-made', { signal, from });
        }
      });
    }
  });
  
  socket.on('call-accepted', ({ signal, to }) => {
    const room = Object.values(usersInRoom).find(room => room.users.some(user => user.userId === to));
    if (room) {
      const user = room.users.find(user => user.userId === to);
      if (user) {
        io.to(user.socketId).emit('call-accepted', { signal, userId: to });
      }
    }
  });
  
  socket.on('leave-call', ({ roomId, userId }) => {
    const room = usersInRoom[roomId];
    if (room) {
      room.users = room.users.filter(user => user.userId !== userId);
      socket.leave(roomId);
      io.to(roomId).emit('user-left', userId);
  
      if (room.users.length === 0) {
        delete usersInRoom[roomId];
      }
    }
  });*/


  //when disconnect
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const user = rooms[roomId].users.find(user => user.socketId === socket.id);

      if (user) {
        socket.to(roomId).emit('user-disconnected', { userId: user.userId });
      }
      if (usersInRoom[roomId]) {
        const userCall = usersInRoom[roomId].users.find(user => user.socketId === socket.id)
        if (userCall) {
          usersInRoom[roomId].users = usersInRoom[roomId].users.filter(user => user.socketId !== socket.id);
          console.log("out phòng, còn: ", usersInRoom[roomId])
        }
      }
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
/*peerServer.on('connection', (client) => {
  console.log('PeerJS connected:', client.getId());

  client.on('disconnect', () => {
    console.log('PeerJS disconnected:', client.getId());
  });
});*/