const express = require("express");
const router = express.Router();
const propertyService = require("../services/propertyService");

// Tüm mülkleri listele (GET)
router.get("/", async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: "Veriler alınamadı" });
  }
});

// Yeni mülk ekle (POST)
router.post("/", async (req, res) => {
  try {
    const newProperty = await propertyService.createProperty(req.body);
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(500).json({ error: "Mülk eklenemedi" });
  }
});

module.exports = router;