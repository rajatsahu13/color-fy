if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Album = require("./models/album");
const axios = require("axios");
const cron = require("node-cron");
const { seedDb, generatePalettes } = require("./scripts");

const app = express();
app.use(cors());

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.get("/", async (req, res) => {
  const albums = await Album.find({});
  res.json({ albums });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Run scripts every Sunday
cron.schedule("0 4 * * Sunday", async () => {
  await Promise.resolve(seedDb());
});

cron.schedule("15 4 * * Sunday", async () => {
  await Promise.resolve(generatePalettes());
});

// Keep server alive
cron.schedule("*/5 * * * *", async () => {
  console.log("Pinging server");
  await axios.get("https://color-fy-api.herokuapp.com/");
});
