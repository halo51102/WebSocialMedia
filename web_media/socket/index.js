import { Server } from "socket.io";

const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket) => {
    console.log("Ai đó vừa kết nối...");

    socket.on("disconnet", () => {
        console.log("Ai đó vừa ngắt kết nối...");
    })
});

io.listen(5000);