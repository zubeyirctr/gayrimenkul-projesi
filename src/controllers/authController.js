const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await authService.registerUser(username, email, password);
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu", user });
  } catch (err) {
    if (err.message.includes("zaten")) return res.status(409).json({ error: err.message });
    if (
      err.message.includes("zorunludur") ||
      err.message.includes("formatı") ||
      err.message.includes("karakter")
    ) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    if (err.message.includes("zorunludur")) return res.status(400).json({ error: err.message });
    if (err.message === "Email veya şifre hatalı") return res.status(401).json({ error: err.message });
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

module.exports = { register, login };
