const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();

//  JSON formatı 
app.use(express.json());

// Swagger dokümanını yükleme
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

// Swagger UI'ı en üste ekleyelim ki rotalarla çakışmasın 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Statik dosyalar (HTML, CSS, JS) 
app.use(express.static(path.join(__dirname, "../public")));

// SPA ana sayfa 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = 3000;
// Rotaları bağla 
app.use("/api/properties", require("./routes/propertyRoutes"));
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
  console.log(`Dokümantasyon: http://localhost:${PORT}/api-docs`);
});

module.exports = app;