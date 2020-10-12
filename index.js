const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const PAGE_URL = 'https://www.takealot.com/dell-se2719hr-69cm-27-fhd-ips-led-monitor/PLID68852194'; // for take alot dell monitor


scrap = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });

  let data = await page.evaluate(() => {
    let name = document.querySelector('div[class="cell auto"] > h1').innerText;
    let price = document.querySelector('span[class="currency plus currency-module_currency_29IIm"]').innerText;
    return { name, price };
  });

  await browser.close();
  return data; /* Returning with the scraped data */
};


startTracking = async (dealPrice) => {
  let job = new CronJob('*/5 * * * * *', async () => { //runs every 5 seconds in this config for development purpose
    let { name, price, ...rest } = await scrap();

    if (await formatPrice(price) <= dealPrice) {
      // if the item price is equal or less that the my dealPrice then send email
      return console.log(`Sending an email, The ${name} is now ${price}`);
    }
    return console.log(`The ${name} is still ${price}`);
  }, null, true);
  job.start();
}

// format 'R 3,399' to '3399' or 'R 3,399.99' to '3399.99'
formatPrice = async randPrice => Number(randPrice.replace(/[^0-9.-]+/g, ""));

// configure email with nodemailer
// configureEmail() = async () => {}

// start tracking
startTracking(300);

