const propertyService = require("../services/propertyService");

const getAll = async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties(req.user.id);
    res.json(properties);
  } catch {
    res.status(500).json({ error: "Veriler alınamadı" });
  }
};

const getById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id, req.user.id);
    res.json(property);
  } catch (err) {
    if (err.message === "Mülk bulunamadı") return res.status(404).json({ error: err.message });
    if (err.message === "Bu mülke erişim yetkiniz yok") return res.status(403).json({ error: err.message });
    res.status(500).json({ error: "Mülk alınamadı" });
  }
};

const create = async (req, res) => {
  try {
    const { title, price, type, location, description, room_count, square_meters, floor, image_url } = req.body;
    const property = await propertyService.createProperty(
      { title, price, type, location, description, room_count, square_meters, floor, image_url },
      req.user.id
    );
    res.status(201).json(property);
  } catch (err) {
    if (err.message === "Bu mülk zaten kayıtlı") return res.status(409).json({ error: err.message });
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, price, type, location, description, room_count, square_meters, floor, image_url } = req.body;
    const property = await propertyService.updateProperty(
      req.params.id,
      { title, price, type, location, description, room_count, square_meters, floor, image_url },
      req.user.id
    );
    res.json(property);
  } catch (err) {
    if (err.message === "Mülk bulunamadı") return res.status(404).json({ error: err.message });
    if (err.message === "Bu mülke erişim yetkiniz yok") return res.status(403).json({ error: err.message });
    res.status(500).json({ error: "Mülk güncellenemedi" });
  }
};

const remove = async (req, res) => {
  try {
    const result = await propertyService.deleteProperty(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    if (err.message === "Mülk bulunamadı") return res.status(404).json({ error: err.message });
    if (err.message === "Bu mülke erişim yetkiniz yok") return res.status(403).json({ error: err.message });
    res.status(500).json({ error: "Mülk silinemedi" });
  }
};

module.exports = { getAll, getById, create, update, remove };
