import fs from "fs";
import puppeteer from "puppeteer";

async function Get_Stocks_EG() {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: "true",
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(
    "https://www.tradingview.com/markets/stocks-egypt/market-movers-all-stocks/"
  );

  // Wait and click on first result
  // Click the button to load more content
  await page.click(".loadButton-SFwfC2e0");
  await page.waitForTimeout(4000);
  await page.click(".loadButton-SFwfC2e0");
  await page.waitForTimeout(4000);

  const extractedData = await page.evaluate(() => {
    //Create Empty Array to push Data into
    const data = [];

    //Get All Table ROWS
    const tableRows = document.querySelectorAll("tbody > tr");

    // Loop through each row and extract data from elements within <td> cells
    tableRows.forEach((row) => {
      //Get all TD cells inside each row
      const cells = row.querySelectorAll("td");
      //Query each td as you like in celldata object
      const celldata = {
        Name: cells[0].querySelector("span > sup").textContent,
        Ticker: cells[0].querySelector("span > a").textContent,
        Price: cells[1].textContent,
        Percent: cells[2].textContent,
        Price_Chg: cells[3].querySelector("span").textContent,
        Rating: cells[4].textContent,
        Volume: cells[5].textContent,
        // Add more properties as needed
      };

      //Push the object into the data again
      data.push(celldata);
    });
    //return the data
    return data;
  });

  //console.log(extractedData);
  await browser.close();
  try {
    const jsonData = JSON.stringify(extractedData, null, 2);

    fs.writeFileSync("./data/Stocks_EG.json", jsonData, "utf8");
    console.log("Data written to Stocks_EG.json");
  } catch (error) {
    console.error("Error:", error);
  }
}

