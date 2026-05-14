const express = require("express");
const path = require("path");
const app = express();

//  JSON formatı 
app.use(express.json());

// Frontend dosyaları için public klasörünü açma
app.use(express.static(path.join(__dirname, "../public")));

// SPA yapısı için ana sayfa rotası 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});

module.exports = app;