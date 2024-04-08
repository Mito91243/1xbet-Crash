import puppeteer from "puppeteer-extra";
import fs from "fs";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

async function get_data() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const loginUrl = "https://1xlite-394299.top/en/allgamesentrance/crash";
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36";
  const page = await browser.newPage();

  await page.setUserAgent(ua);
  await page.goto(loginUrl, { waitUntil: "networkidle2" });
  await page.waitForTimeout(10000);
  await page.waitForTimeout(10000);

  console.log(await page.evaluate(() => document.documentElement.outerHTML));


  const extractedData = await page.evaluate(() => {
    console.log(document.documentElement.outerHTML);
    // Target the parent div
    // Target the div elements inside the parent div
    const childDivs = document.querySelectorAll("#games_page > div.crash.games-container__game > div.crash-popup.crash-popup--players > div.crash-popup__overflow > div > div.crash-popup__rows.crash-popup__rows--less > div");

    // Loop through each child div
    childDivs.forEach((row) => {
      // Your code here to process each child div
      //Get all TD cells inside each row
      const cells = row.querySelectorAll("p");
      //Query each td as you like in celldata object
      const celldata = {
        Idintifier: cells[0].textContent,
        Multiplier_w: cells[1].textContent,
        Bet_Amount: cells[2].textContent,
        Cashout: cells[3].textContent,
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
