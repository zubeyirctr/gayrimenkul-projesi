const db = require("../models/db");

const getAllProperties = (userId) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM properties WHERE user_id = ?", [userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const getPropertyById = (id, userId) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM properties WHERE id = ?", [id], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error("Mülk bulunamadı"));
      if (row.user_id !== userId) return reject(new Error("Bu mülke erişim yetkiniz yok"));
      resolve(row);
    });
  });
};

const createProperty = (data, userId) => {
  const { title, price, type, location, description, room_count, square_meters, floor, image_url } = data;

  if (!title || price === null || price === undefined || price === "" || !type || !location) {
    return Promise.reject(new Error("title, price, type ve location zorunludur"));
  }

  if (price <= 0) {
    return Promise.reject(new Error("Fiyat 0'dan büyük olmalıdır"));
  }

  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM properties WHERE title = ? AND location = ? AND user_id = ?",
      [title, location, userId],
      (err, existing) => {
        if (err) return reject(err);
        if (existing) return reject(new Error("Bu mülk zaten kayıtlı"));

        db.run(
          `INSERT INTO properties
            (title, price, type, location, description, room_count, square_meters, floor, image_url, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, price, type, location, description || null, room_count || null, square_meters || null, floor ?? null, image_url || null, userId],
          function (insertErr) {
            if (insertErr) return reject(insertErr);
            resolve({ id: this.lastID, title, price, type, location, description, room_count, square_meters, floor, image_url, user_id: userId });
          }
        );
      }
    );
  });
};

const updateProperty = (id, data, userId) => {
  return getPropertyById(id, userId).then(() => {
    const { title, price, type, location, description, room_count, square_meters, floor, image_url } = data;
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE properties
         SET title = ?, price = ?, type = ?, location = ?,
             description = ?, room_count = ?, square_meters = ?, floor = ?, image_url = ?
         WHERE id = ? AND user_id = ?`,
        [title, price, type, location, description || null, room_count || null, square_meters || null, floor ?? null, image_url || null, id, userId],
        function (err) {
          if (err) return reject(err);
          resolve({ id: Number(id), title, price, type, location, description, room_count, square_meters, floor, image_url, user_id: userId });
        }
      );
    });
  });
};

const deleteProperty = (id, userId) => {
  return getPropertyById(id, userId).then(() => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM properties WHERE id = ? AND user_id = ?", [id, userId], function (err) {
        if (err) return reject(err);
        resolve({ message: "Mülk silindi" });
      });
    });
  });
};

module.exports = { getAllProperties, getPropertyById, createProperty, updateProperty, deleteProperty };
