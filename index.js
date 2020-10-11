const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const PAGE_URL = 'https://www.takealot.com/dell-se2719hr-69cm-27-fhd-ips-led-monitor/PLID68852194'; // for take alot dell monitor


checkPrice = async () => {

   /* Initiate the Puppeteer browser */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  /* Go to the page url and wait for it to load */
  await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });

  /* Run javascript inside of the page */
  let data = await page.evaluate(() => {
    let name = document.querySelector('div[class="cell auto"] > h1').innerText;
    let randPrice = document.querySelector('span[class="currency plus currency-module_currency_29IIm"]').innerText;
    //let price = Number(randPrice.replace(/[^0-9.-]+/g,""));
    return { name, randPrice }; /* Returning with the scraped data */
  });

  /* Outputting what we scraped */
  console.log(data);
  await browser.close();
};

checkPrice();