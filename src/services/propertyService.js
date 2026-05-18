const db = require("../models/db");

const getAllProperties = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM properties", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

const createProperty = (data) => {
  return new Promise((resolve, reject) => {
    const { title, price, type, location } = data;
    db.run(
      "INSERT INTO properties (title, price, type, location) VALUES (?, ?, ?, ?)",
      [title, price, type, location],
      function (err) {
        if (err) reject(err);
        resolve({ id: this.lastID, ...data });
      }
    );
  });
};

module.exports = { getAllProperties, createProperty };