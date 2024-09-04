"use strict";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

const KEYWORDS = [
  "$AAPL",
  "$GOOG",
  "$MSFT",
  "$AMZN",
  "$TSLA",
  "$NVDA",
  "$WBA",
  "$SPX",
  "$IWM",
  "$ASTS",
];

const PROFILES = [
  "https://twitter.com/Mr_Derivatives",
  "https://twitter.com/warrior_0719",
  "https://twitter.com/allstarcharts",
  "https://twitter.com/yuriymatso",
  "https://twitter.com/TriggerTrades",
  "https://twitter.com/AdamMancini4",
  "https://twitter.com/CordovaTrades",
  "https://twitter.com/Barchart",
  "https://twitter.com/RoyLMattox",
];

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function scrapeProfile(page, profileUrl, keywords, timeLimit) {
  await page.goto(profileUrl, { waitUntil: "networkidle2" });
  console.log(`Scraping profile: ${profileUrl}`);

  // Scroll to load more content
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await delay(1000);
  }

  await countKeywords(page, keywords, timeLimit);
}

/**
 * Counts the number of times a keyword appears in tweets from the last given time period.
 *
 * @async
 * @param {import("puppeteer").Page} page - The Puppeteer page object.
 * @param {string[]} keywords - An array of keywords to search for in the tweets.
 *
 *
 */
async function countKeywords(page, keywords) {
  const tweets = await page.evaluate(() => {
    const articles = [
      ...document.querySelectorAll('article[data-testid="tweet"]'),
    ];
    return articles.map((article) => article.innerText);
  });

  keywords.forEach((keyword) => {
    const count = tweets.reduce(
      (count, tweet) =>
        count +
        tweet
          .split(" ")
          .filter(
            (word) =>
              word === keyword.toLowerCase() ||
              word === keyword.toUpperCase() ||
              word === keyword
          ).length,
      0
    );
    console.log(`${keyword} was mentioned ${count} times recently`);
  });
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Login to Twitter
  // Replace with your own X username and password
  // Click on all the buttons that pop up
  await page.goto("https://x.com/i/flow/login", {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.locator('input[name="text"]').fill("napir96457@esterace.com");
  await delay(2000);
  await page.locator("input").fill("PuppeterTest");
  await page
    .locator('input[name="password"]')
    .fill(process.env.TWITTER_PASSWORD);
  await delay(200);
  await page.waitForNavigation();

  // Scrape profiles
  for (const profile of PROFILES) {
    await scrapeProfile(page, profile, KEYWORDS, 15);
    await delay(2000);
  }

  await browser.close();
}

main().catch(console.error);
