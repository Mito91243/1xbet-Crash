import puppeteer from "puppeteer-extra";
import fs from "fs";
import xlsx from "xlsx";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

async function get_data() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const loginUrl =
    "https://1xlite-394299.top/games-frame/games/371?co=66&cu=119&lg=en&wh=55&tzo=3";
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36";
  const page = await browser.newPage();

  await page.setUserAgent(ua);
  await page.goto(loginUrl, { waitUntil: "networkidle2" });

  const x = 5;
  let game_counter = 0;
  let Cumlative_Balance = 0;
  while (x === 5) {
    game_counter = game_counter + 1;
    await page.reload();
    page.setDefaultTimeout(50000);
    await page.waitForSelector(
      "div.crash-game__wrap > div.crash-game__pin.crash-game__pin--crash"
    );

    const extractedData = await page.evaluate((game_counter) => {
      let data = [];
      // Target the div elements inside the parent div
      const tableRows = document.querySelectorAll("tbody > tr");

      tableRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const celldata = {
          Idintifier: cells[0].textContent.trim(),
          Multiplier_w: cells[1].textContent.trim(),
          Bet_Amount: cells[2].textContent.trim(),
          Cashout: cells[3].textContent.trim(),
          Game_id: game_counter,
        };
        data.push(celldata);
      });
      return data;
    }, game_counter);

    const extractedStats = await page.evaluate(() => {
      const player_num = document.querySelector(
        "#games_page > div.crash.games-container__game > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(1) > span"
      );
      const total_bets = document.querySelector(
        "#games_page > div.crash.games-container__game > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(2) > span"
      );
      const total_winnings = document.querySelector(
        "#games_page > div.crash.games-container__game > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(3) > span"
      );

      const celldata = {
        Players: player_num.textContent.trim(),
        Bets: total_bets.textContent.trim(),
        Winnings: total_winnings.textContent.trim(),
        casino_balance:
          (parseFloat(total_bets.textContent.trim().split(" ")[0]) -
          parseFloat(total_winnings.textContent.trim().split(" ")[0])).toFixed(2),
      };

      return celldata;
    });
    //console.log(`Game id ${game_counter} has been logged`);
    Cumlative_Balance = extractedStats.casino_balance + Cumlative_Balance
    
    await writeToExcel_PlayersData(extractedData);
  }
}

async function writeToExcel_PlayersData(data) {
  try {
    let wb;
    let ws;
    let existingWb;
    let sheetName = "Sheet1";

    if (fs.existsSync("./data.xlsx")) {
      existingWb = xlsx.readFile("./data.xlsx");
      wb = existingWb;
      ws = existingWb.Sheets[sheetName];
    } else {
      wb = xlsx.utils.book_new();
      ws = xlsx.utils.json_to_sheet([], {
        header: [
          "Idintifier",
          "Multiplier_w",
          "Bet_Amount",
          "Cashout",
          "Game_id",
        ],
      });
      xlsx.utils.book_append_sheet(wb, ws, sheetName);
    }

    // Add Game_id to the data before writing to Excel
    const dataWithGameId = data.map((item) => ({
      ...item,
      Game_id: item.Game_id || 0, // Default to 0 if Game_id is undefined
    }));

    xlsx.utils.sheet_add_json(ws, dataWithGameId, {
      skipHeader: true,
      origin: -1,
    });

    xlsx.writeFile(wb, "./data.xlsx");
  } catch (err) {
    console.error("Error writing to Excel file:", err);
  }
}

get_data();
