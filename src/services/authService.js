const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

const registerUser = (username, email, password) => {
  if (!username || !email || !password) {
    return Promise.reject(new Error("Tüm alanlar zorunludur"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Promise.reject(new Error("Geçersiz email formatı"));
  }

  if (password.length < 6) {
    return Promise.reject(new Error("Şifre en az 6 karakter olmalıdır"));
  }

  return bcrypt.hash(password, 10).then((hashedPassword) => {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        function (err) {
          if (err) {
            if (err.message.includes("UNIQUE constraint failed: users.email")) {
              return reject(new Error("Bu email zaten kullanılıyor"));
            }
            if (err.message.includes("UNIQUE constraint failed: users.username")) {
              return reject(new Error("Bu kullanıcı adı zaten kullanılıyor"));
            }
            return reject(err);
          }
          resolve({ id: this.lastID, username, email });
        }
      );
    });
  });
};

const loginUser = (email, password) => {
  if (!email || !password) {
    return Promise.reject(new Error("Email ve şifre zorunludur"));
  }

  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) return reject(err);
      if (!user) return reject(new Error("Email veya şifre hatalı"));

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return reject(new Error("Email veya şifre hatalı"));

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      resolve({ token, user: { id: user.id, email: user.email, username: user.username } });
    });
  });
};

module.exports = { registerUser, loginUser };
