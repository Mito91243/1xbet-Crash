const WebSocket = require("ws");
const ExcelJS = require("exceljs");

// Global variables initialization
let totalBid = 0;
let totalWin = 0;
let total_players = 0;
let total_losers = 0;
let odds = 0;
let timestamp;
let game_id = -1;
let cumlative_casino_earnings = 0;
let user1_balance = 10000;

// Excel workbook and worksheet initialization
let workbook = new ExcelJS.Workbook();
let worksheet;

function initExcel() {
  workbook = new ExcelJS.Workbook();
  worksheet = workbook.addWorksheet("Results");
  worksheet.addRow([
    "Game ID",
    "Total Bids",
    "Total Winnings",
    "Total Players",
    "Players Lost",
    "Number of Players",
    "Odds",
    "Casino Earnings",
    "Timestamp",
    "Casino Cumulative Earnings",
    "Strategy_1",
  ]);
}

// Function to connect to the WebSocket server
function connect_to_crash() {
  const socket = new WebSocket(
    `https://1xlite-230379.top/games-frame/sockets/crash?appGuid=00000000-0000-0000-0000-000000000000&whence=55&fcountry=66&ref=1&gr=285&lng=en`
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
      reset(messageObj);
    }

    if (messageObj.target === "OnBets") {
      OnBets(messageObj);
    }
    // Check if the message is of type 'OnCrash' and extract 'f' and timestamp
    if (messageObj.target === "OnCrash") {
      OnCrash(messageObj);
    }
    if (messageObj.target === "OnCashouts") {
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

function reset() {
  // We print the totalbid sum here before resetting
  cumlative_casino_earnings = cumlative_casino_earnings + (totalBid - totalWin);
  game_id += 1;
  Bola_Strategy();
  print_results();
  totalBid = 0;
  totalWin = 0;
  odds = 0;
  total_players = 0;
  total_losers = 0;
}

function OnCrash(messageObj) {
  // Check if the message is of type 'OnCrash' and extract 'f' and timestamp
  const fValue = messageObj.arguments[0].f;
  const timestampUTC = new Date(messageObj.arguments[0].ts);
  const timestampGMT2 = timestampUTC.toLocaleString("en-US", {
    timeZone: "Europe/Berlin",
  });
  timestamp = timestampGMT2;
  odds = fValue;
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
  const { l, won, d, n, q } = messageObj.arguments[0];
  total_players = n;
  total_winners = d;
}

function Bola_Strategy() {
  if (game_id >= 1 && odds <= 3) {
    user1_balance = user1_balance - 200;
  } else if (game_id >= 1 && odds >= 3) {
    user1_balance = 200 * 3 + user1_balance;
  }
}

async function print_results() {
  let numPlayers = odds < 1.13 ? 10500 : total_players;
  let numLosers = odds < 1.13 ? 10500 : total_losers;

  worksheet.addRow([
    game_id,
    totalBid.toFixed(2),
    totalWin.toFixed(2),
    total_players,
    numLosers,
    numPlayers,
    odds,
    (totalBid - totalWin).toFixed(2),
    timestamp,
    cumlative_casino_earnings,
    user1_balance,
  ]);

  // Save the workbook to an Excel file
  const filename = "results.xlsx";
  await workbook.xlsx.writeFile(filename);
  console.log(`Data appended to ${filename}`);
}

initExcel();
connect_to_crash();
