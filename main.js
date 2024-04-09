const WebSocket = require("ws");

function connect_to_crash(params) {
  const socket = new WebSocket(
    "wss://1xlite-394299.top/games-frame/sockets/crash?appGuid=00000000-0000-0000-0000-000000000000&whence=55&fcountry=66&ref=1&gr=285&lng=en"
  );

  // Event listener for when the connection is established
  socket.addEventListener("open", function (event) {
    console.log("Connected to WebSocket server");

    // Send the first message to the server once connected
    socket.send(`{"protocol":"json","version":1}\u001e	`);

    // Wait for 0.15 seconds before sending the second message
    setTimeout(function () {
      socket.send(
        `{"arguments":[{"activity":30,"currency":119}],"invocationId":"1","target":"Guest","type":1}\u001e	`
      );
    }, 150);
  });

  // Event listener for incoming messages
  socket.addEventListener("message", function (event) {
    console.log("Message from server:", event.data);
  });

  // Event listener for errors
  socket.addEventListener("error", function (event) {
    console.error("WebSocket error:", event);
  });

  // Event listener for when the connection is closed
  socket.addEventListener("close", function (event) {
    console.log("Connection to WebSocket server closed");
  });
}
