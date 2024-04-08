import puppeteer from "puppeteer-extra";
import fs from "fs";
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

  //console.log(await page.evaluate(() => document.documentElement.innerHTML));

  await page.waitForSelector(
    "div.crash-game__wrap > div.crash-game__pin.crash-game__pin--crash"
  );

  const extractedData = await page.evaluate(() => {
    let data = [];
    // Target the div elements inside the parent div
    const tableRows = document.querySelectorAll("tbody > tr");

    // Loop through each row and extract data from elements within <td> cells
    tableRows.forEach((row) => {
      // Your code here to process each child div
      //Get all TD cells inside each row
      const cells = row.querySelectorAll("td");
      //Query each td as you like in celldata object
      const celldata = {
        Idintifier: cells[0].textContent.trim(),
        Multiplier_w: cells[1].textContent.trim(),
        Bet_Amount: cells[2].textContent.trim(),
        Cashout: cells[3].textContent.trim(),
      };
      //Push the object into the data again
      data.push(celldata);
    });
    //return the data
    return data;
  });

  console.log(extractedData);
}
get_data();

// GameData  ->> .crash-popup__header
