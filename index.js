const puppeteer = require("puppeteer");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");

const url =
  "https://www.takealot.com/dell-se2719hr-69cm-27-fhd-ips-led-monitor/PLID68852194"; // for take alot dell monitor

scrap = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  let data = await page.evaluate(() => {
    let title = document.querySelector('div[class="cell auto"] > h1').innerText;
    let price = document.querySelector('span[class="currency plus currency-module_currency_29IIm"]').innerText;
    return { title, price };
  });

  await browser.close();
  return data; /* Returning with the scraped data */
};

startTracking = async (dealPrice) => {
  let job = new CronJob("*/5 * * * * *", async () => { //runs every 5 seconds in this config 
      let data = await scrap();
      let { title, price } = data;

      if ((await formatPrice(price)) <= dealPrice) {
        return console.log(`Sending an email, The ${title} is now ${price}`);
        // await sendEmail(data); //send email
      }
      return console.log(`The ${title} is still ${price}`);
    }, null, true
  ); job.start();
};

// configure email with nodemailer
sendEmail = async (data) => {
  let { title, price, ...rest } = data;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: EMAIL, // your gmail address
      pass: EMAIL_PASSWORD, // your gmail password
    },
  });

  let mailOptions = {
    subject: `Takealot.com Deal`,
    to: `giftmbanda@gmail.com`, // recipient email
    from: `TakealotPriceMonitor`,
    html: `<h2>Hi there!</h2>
    <p>The ${title} is now ${price}</p>
    <p>Please click <a href="">here</a> to view or buy the product.</p>`,
  };
  return await transporter.sendMail(mailOptions);
};

// format 'R 3,399' to '3399' or 'R 3,399.99' to '3399.99'
formatPrice = async (randPrice) => Number(randPrice.replace(/[^0-9.-]+/g, ""));

// start tracking
startTracking(4400);
