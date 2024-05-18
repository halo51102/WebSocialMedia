const axios = require('axios');
const { getVideoMetadata } = require('./services/embed');
const stream = require('stream');

const { uploadLocalFile, uploadImageToS3 } = require('./s3.config')

const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  console.log(users)
};

const getUser = (userId) => {
  if(users.find((user) => user.userId === userId)===undefined){
    return {userId}
  }
  console.log(users.find((user) => user.userId === userId))
  return users.find((user) => user.userId === userId);
};

const handleUploadLocalFile = async (file, fileName, mimeType) => {
  const data = new FormData();
  data.append("file", file);
  // Upload the image to S3
  console.log("socket file: ", file)

  const bufferStream = new stream.PassThrough();
  bufferStream.end(file);
  fileName = Date.now().toString() + '-' + fileName;
  const url = await uploadImageToS3(bufferStream, fileName, mimeType)
  console.log("url: "+url)
  return url
};

io.on("connection", (socket) => {

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log(users)
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
        const res = await getVideoMetadata(text);
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
      url = await handleUploadLocalFile(file, fileName, mimeType)
      console.log("url l87 "+url)
      const title = null
      const file_url = url
      if (user!==undefined) {
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
<<<<<<< Updated upstream
=======
        console.log("Gui o day 134")
>>>>>>> Stashed changes
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


  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    console.log(users)
    io.emit("getUsers", users);
  });
});
