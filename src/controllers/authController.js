const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await authService.registerUser(username, email, password);
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { register, login };
