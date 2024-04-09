const WebSocket = require("ws");

// Initialize total bid sum
let totalBid = 0;
let totalWin = 0;
let isAfterCrash = false;
// Function to connect to the WebSocket server
function connect_to_crash() {
  const socket = new WebSocket(
    "wss://1xlite-394299.top/games-frame/sockets/crash?appGuid=00000000-0000-0000-0000-000000000000&whence=55&fcountry=66&ref=1&gr=285&lng=en"
  );

  // Event listener for when the connection is established
  socket.addEventListener("open", function (event) {
    console.log("Connected to WebSocket server");

    // Send the first message to the server once connected
    socket.send(`{"protocol":"json","version":1}\u001e`);

    // Wait for 0.15 seconds before sending the second message
    setTimeout(function () {
      socket.send(
        `{"arguments":[{"activity":30,"currency":119}],"invocationId":"1","target":"Guest","type":1}\u001e`
      );
    }, 150);
  });

  // Event listener for incoming messages
  socket.addEventListener("message", function (event) {
    // Remove control characters at the end of the message
    let cleanedMessage = event.data.replace(/[\x00-\x1F\x7F]/g, "");

    // Parse the cleaned message as JSON
    let messageObj;
    try {
      messageObj = JSON.parse(cleanedMessage);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    if (messageObj.target === "OnStage") {
      OnStage();
    }

    if (messageObj.target === "OnBets") {
      OnBets(messageObj);
    }
    // Check if the message is of type 'OnCrash' and extract 'f' and timestamp
    if (messageObj.target === "OnCrash") {
      OnCrash(messageObj);
    }
    if (messageObj.target === "OnCashouts" && isAfterCrash == true) {
      OnCashout(messageObj);
    }
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
function OnStage() {
  // We print the totalbid sum here before resetting
  console.log("Total Bids:", totalBid);
  console.log("Total Winnings:", totalWin);
  console.log("Casino Earnings: ", totalBid - totalWin);
  totalBid = 0;
  totalWin = 0;
  isAfterCrash = false;
}
function OnCrash(messageObj) {
  // Check if the message is of type 'OnCrash' and extract 'f' and timestamp
  const fValue = messageObj.arguments[0].f;
  const timestampUTC = new Date(messageObj.arguments[0].ts).toUTCString();
  console.log("OnCrash - Odds:", fValue, "Timestamp (UTC):", timestampUTC);
  isAfterCrash = true;
}
function OnBets(messageObj) {
  let bid = messageObj.arguments[0].bid;
  if (totalBid < bid) {
    totalBid = bid;
  }
}
function OnCashout(messageObj) {
  let win = messageObj.arguments[0].won;
  if (totalWin < win) {
    totalWin = win;
  }
  //const { l, won, d, n, q } = messageObj.arguments[0];
  //console.log("OnCashouts - Details:", { l, won, d, n, q });
  // q is the array of id's of winners with ou much they won and the odds the won at
}
connect_to_crash();
