if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Album = require("./models/album");
const puppeteer = require("puppeteer");
const axios = require("axios");

const album_count = 15; // Number of albums to display
const client_id = "c5be357d4ca84b5b8bd086363ac4730a";
const redirect_uri = "https%3A%2F%2Fcolor-fy.vercel.app%2F";

// Scipt for getting oauth token from spotify
// and updating db with new releases
module.exports.seedDb = async () => {
  let token;
  console.log("Seeding database");
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}`
  );
  await page.waitForSelector("input#login-username");
  await page.waitForSelector("input#login-password");
  await page.type("input#login-username", process.env.sp_username);
  await page.type("input#login-password", process.env.sp_password);
  await page.click("button#login-button");
  await page.waitForNavigation();
  await page.waitForSelector("button[data-testid='auth-accept']");
  await page.click("button[data-testid='auth-accept']");
  await page.waitForNavigation();
  const url = await page.url();
  const code = url.slice(34);
  const data = `grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}`;
  axios
    .post("https://accounts.spotify.com/api/token", data, {
      headers: {
        Authorization: `Basic ${process.env.sp_secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then(async (response) => {
      token = response.data.access_token;
      console.log("Token generated successfully");
      await Album.deleteMany({});
      const res = await axios.get(
        `https://api.spotify.com/v1/browse/new-releases?limit=50`,
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tempData = res.data.albums.items;
      const filteredData = tempData
        .filter((album) => album.album_type === "album")
        .slice(0, album_count);
      for (let i = 0; i < filteredData.length; i++) {
        const albumData = new Album({
          name: `${filteredData[i].name}`,
          artist: `${filteredData[i].artists[0].name}`,
          cover: `${filteredData[i].images[0].url}`,
          url: `${filteredData[i].external_urls.spotify}`,
        });
        await albumData.save();
      }
      console.log("Database seeded successfully");
    });
  await browser.close();
};

// Scipt for generating color palettes
module.exports.generatePalettes = async () => {
  console.log("Generating color palettes");
  const albums = await Album.find({});
  for (let i = 0; i < albums.length; i++) {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions("https://coolors.co/image-picker", [
      "clipboard-read",
    ]);
    const page = await browser.newPage();
    await page.goto("https://coolors.co/image-picker");
    await page.waitForSelector(".iubenda-cs-container");
    await page.waitForSelector(".iubenda-cs-accept-btn");
    await page.click(".iubenda-cs-accept-btn");
    await page.waitForSelector("#image-picker_browse-btn");
    await page.click("#image-picker_browse-btn");
    await page.waitForSelector("#image-browser");
    await page.click("a[href='url']");
    await page.waitForSelector("#image-browser_url_input");
    await page.type("#image-browser_url_input", albums[i].cover);
    await page.click("#image-browser_url_ok-btn");
    await page.waitForSelector("#image-picker_palette");
    await page.waitForSelector(".palette-selector_buttons a:first-child");
    await page.waitForTimeout(4000);
    await page.click(".palette-selector_buttons a:first-child");
    await page.waitForTimeout(4000);
    await page.click(".palette-selector_buttons a:first-child");
    await page.waitForTimeout(4000);
    await page.click(".palette-selector_buttons a:first-child");
    await page.click("#image-picker_export-btn");
    await page.waitForSelector("#palette-exporter_links");
    await page.click("a[data-type='url']");
    let url;
    url = await page.evaluate(() => navigator.clipboard.readText());
    url = url.slice(19);
    let colors = [];
    for (let j = 0; j < url.length; j = j + 7) {
      colors.push(`#${url.slice(j, j + 6)}`);
    }
    const doc = await Album.findOne({ name: albums[i].name });
    doc.palette = colors;
    await doc.save();
    await browser.close();
  }
  console.log("Palettes generated successfully");
};
