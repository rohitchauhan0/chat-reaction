const io = require("socket.io")(3002, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let roomMessages = {};  // Store the messages per room

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining a room
  socket.on("join-room", (roomId) => {
    console.log("User joined room:", roomId);
    socket.join(roomId);
    io.to(roomId).emit("room-users", getUsersInRoom(roomId));

    if (roomMessages[roomId]) {
      socket.emit("receive-message", roomMessages[roomId]);
    }
  });

  // Listen for the "send-reaction" event
  socket.on("send-reaction", (data) => {
    const { code, roomId } = data; // Assuming you're sending both code and roomId

    console.log("Received reaction code:", code);

    // Emit the reaction code to all clients in the room
    io.to(roomId).emit("receive-reaction", { code });
  });




  socket.on("send-message", (data) => {
    const { roomId, message, senderId, type, content } = data;
    console.log("Received message:", data);

    if (!roomMessages[roomId]) {
      roomMessages[roomId] = [];
    }

    roomMessages[roomId].push({ type, message, senderId, content });

    io.to(roomId).emit("receive-message", { type, message, senderId, content });
  });


  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

function getUsersInRoom(roomId) {
  const clients = io.sockets.adapter.rooms.get(roomId);
  return clients ? Array.from(clients) : [];
}
