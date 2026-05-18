const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();

app.use(express.json());


const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(express.static(path.join(__dirname, "../public")));


const propertyRoutes = require("./routes/propertyRoutes");
app.use("/api/properties", propertyRoutes);


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
  console.log(`Dokümantasyon: http://localhost:${PORT}/api-docs`);
});

module.exports = app;