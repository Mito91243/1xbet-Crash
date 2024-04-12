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
let user_1_balance = 200;
let user_2_balance = 200;
let user_3_balance = 200;
let user_4_balance = 200;

let spoof_id = [];
let spoof_win = [];
let counter = 0;
let socket;

// Excel workbook and worksheet initialization
let workbook = new ExcelJS.Workbook();
let worksheet;

function initExcel() {
  workbook = new ExcelJS.Workbook();
  worksheet = workbook.addWorksheet("Results");
  worksheet.addRow([
    "Game ID",
    "Total Bets",
    "Total Winnings",
    "Total Players",
    "Players Lost",
    "Number of Players",
    "Odds",
    "Casino Earnings",
    "Timestamp",
    "Casino Cumulative Earnings",
    "Strategy 1 Balance",
    "Strategy 2 Balance",
    "Strategy 3 Balance",
    "Strategy 4 Balance",
  ]);
}

// Function to connect to the WebSocket server
function connect_to_crash() {
  socket = new WebSocket(
    `https://1xlite-230379.top/games-frame/sockets/crash?appGuid=00000000-0000-0000-0000-000000000000&whence=55&fcountry=66&ref=1&gr=285&lng=en`
  );

  // Event listener for when the connection is established
  socket.addEventListener("open", function (event) {
    //console.log("Connected to WebSocket server");

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
    //console.log("Connection to WebSocket server closed");
    reconnect();
  });
}

function reset() {
  // We print the totalbid sum here before resetting
  Strategies();
  print_results();

  cumlative_casino_earnings = cumlative_casino_earnings + (totalBid - totalWin);
  game_id += 1;
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
  get_spoofers(q);
  total_players = n;
  total_losers = d;
}

function Philo_Strategy() {
  if (game_id >= 1 && odds <= 3) {
    user_1_balance = user_1_balance - 10;
  } else if (game_id >= 1 && odds >= 3) {
    user_1_balance = 10 * 3 + user_1_balance - 10;
  }
}

function Philo_Strategy_2() {
  if (game_id >= 1 && odds <= 2) {
    user_2_balance = user_2_balance - 10;
  } else if (game_id >= 1 && odds >= 2) {
    user_2_balance = 10 * 2 + user_2_balance - 10;
  }
}

function Philo_Strategy_3() {
  if (game_id >= 1 && odds <= 4) {
    user_3_balance = user_3_balance - 10;
  } else if (game_id >= 1 && odds >= 4) {
    user_3_balance = 10 * 4 + user_3_balance - 10;
  }
}

function Philo_Strategy_4() {
  if (game_id >= 1 && odds <= 1.1) {
    user_4_balance = user_4_balance - 10;
  } else if (game_id >= 1 && odds >= 1.1) {
    user_4_balance = 10 * 1.1 + user_4_balance - 10;
  }
}

async function print_results() {
  let numPlayers = odds < 1.13 ? 10500 : total_players;
  let numLosers = odds < 1.13 ? 10500 : total_losers;

  worksheet.addRow([
    game_id,
    totalBid.toFixed(2),
    totalWin.toFixed(2),
    numPlayers,
    numLosers,
    numPlayers,
    odds,
    (totalBid - totalWin).toFixed(2),
    timestamp,
    cumlative_casino_earnings,
    user_1_balance,
    user_2_balance,
    user_3_balance,
    user_4_balance,
  ]);

  // Save the workbook to an Excel file
  const filename = `results.xlsx`;
  await workbook.xlsx.writeFile(filename);
  console.log(
    `UserBalance: ${user_1_balance} @ Odds ${odds} @ Game_ID ${game_id}`
  );
}

function get_spoofers(q) {
  if (q.length > 0) {
    let biggestWin = 0;
    let biggestOdds = 0;
    let biggestGameId = 0;

    for (const { win, k, id } of q) {
      if (win > biggestWin) {
        if (win > 49000) {
          totalWin = totalWin - biggestWin;
          totalBid = totalBid - 24000;
          spoof_id.push(biggestGameId);
          spoof_win.push(biggestWin);
        }
        biggestWin = win;
        biggestOdds = k;
        biggestGameId = id;
      }
    }
  }
}

function Strategies() {
  if (odds > 0) {
    if (user_1_balance > 0) {
      Philo_Strategy();
    }
    if (user_2_balance > 0) {
      Philo_Strategy_2();
    }
    if (user_3_balance > 0) {
      Philo_Strategy_3();
    }
    if (user_4_balance > 0) {
      Philo_Strategy_4();
    }
  }
}

initExcel();
connect_to_crash();

setInterval(() => {
  //console.log("Disconnecting from WebSocket server...");
  socket.close(); // Disconnect from the server
  counter += 1;
}, 20 * 60 * 1000); // 20 minutes in milliseconds

function reconnect() {
  //console.log("Reconnecting to WebSocket server...");
  setTimeout(() => {
    connect_to_crash();
  }, 5000); // Wait for 5 seconds before reconnecting (adjust as needed)
}
