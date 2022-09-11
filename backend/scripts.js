if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Album = require("./models/album");
const puppeteer = require("puppeteer");
const axios = require("axios");
const { getPaletteFromURL } = require("color-thief-node");

const album_count = 15; // Number of albums to display
const client_id = "c5be357d4ca84b5b8bd086363ac4730a";
const redirect_uri = "https%3A%2F%2Fcolor-fy.vercel.app%2F";

const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

const getSpotifyCode = async () => {
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
  await browser.close();
  return url.slice(34);
};

const fetchToken = async (payload) => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    payload,
    {
      headers: {
        Authorization: `Basic ${process.env.sp_secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};

const fetchAlbums = async (token) => {
  const response = await axios.get(
    `https://api.spotify.com/v1/browse/new-releases?country=US&limit=50`,
    {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const albums = response.data.albums.items
    .filter((album) => album.album_type === "album")
    .slice(0, album_count);
  return albums;
};

// Update database with new releases
module.exports.seedDb = async () => {
  console.log("Seeding database");
  const code = await getSpotifyCode();
  const data = `grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}`;
  const token = await fetchToken(data);
  const albums = await fetchAlbums(token);
  await Album.deleteMany({});
  for (let i = 0; i < albums.length; i++) {
    const doc = new Album({
      name: `${albums[i].name}`,
      artist: `${albums[i].artists[0].name}`,
      cover: `${albums[i].images[0].url}`,
      url: `${albums[i].external_urls.spotify}`,
    });
    await doc.save();
  }
  console.log("Database seeded successfully");
};

// Generate color palettes
module.exports.generatePalettes = async () => {
  console.log("Generating color palettes");
  const albums = await Album.find({});
  for (let i = 0; i < albums.length; i++) {
    const colorPallete = await getPaletteFromURL(albums[i].cover, 9);
    for (let i = 0; i < colorPallete.length; i++) {
      colorPallete[i] = rgbToHex(...colorPallete[i]);
    }
    const doc = await Album.findOne({ name: albums[i].name });
    doc.palette = colorPallete;
    await doc.save();
  }
  console.log("Palettes generated successfully");
};
