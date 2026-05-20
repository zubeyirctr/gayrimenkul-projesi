const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../../database.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    type TEXT,
    location TEXT,
    description TEXT,
    room_count INTEGER,
    square_meters REAL,
    floor INTEGER,
    image_url TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  db.get("SELECT COUNT(*) as count FROM properties WHERE user_id = 2", (err, row) => {
    if (row && row.count === 0) {
      const props = [
        ["Kadıköy Merkezde 3+1 Daire", 2850000, "Satılık", "İstanbul, Kadıköy", "Metro ve denize yürüme mesafesinde, güneş alan, bakımlı daire.", 3, 120, 4, 2],
        ["Beşiktaş Deniz Manzaralı 2+1", 4200000, "Satılık", "İstanbul, Beşiktaş", "Boğaz manzaralı, yüksek kat, prestijli lokasyon.", 2, 95, 8, 2],
        ["Ataşehir Kiralık Ofis", 45000, "Kiralık", "İstanbul, Ataşehir", "Plaza katında, açık ofis düzeni, otopark dahil.", null, 180, 12, 2],
        ["Çankaya Köşk Tarzı Villa", 8500000, "Satılık", "Ankara, Çankaya", "Müstakil bahçeli, 4 yatak odalı, çift garajlı villa.", 4, 320, 0, 2],
        ["Alsancak Kiralık 1+1", 18000, "Kiralık", "İzmir, Alsancak", "Eşyalı, denize 5 dakika, yeni bina.", 1, 55, 3, 2],
        ["Muratpaşa Satılık Dükkan", 1950000, "Satılık", "Antalya, Muratpaşa", "Ana cadde üzeri, yüksek trafik, devren satılık.", null, 85, 0, 2],
        ["Nilüfer Kiralık 3+1 Daire", 22000, "Kiralık", "Bursa, Nilüfer", "Site içinde, havuzlu, güvenlikli, otoparklı.", 3, 130, 2, 2],
        ["Karşıyaka Satılık Arsa", 3200000, "Satılık", "İzmir, Karşıyaka", "İmarlı, köşe arsa, inşaata hazır.", null, 400, null, 2],
        ["Şişli Kiralık 2+1", 35000, "Kiralık", "İstanbul, Şişli", "Yeni bina, beyaz eşyalı, merkezi konum.", 2, 90, 5, 2],
        ["Konak Tarihi Konak", 6750000, "Satılık", "İzmir, Konak", "Restore edilmiş tarihi yapı, 6 oda, bahçe.", 6, 450, 0, 2],
        ["Çeşme Yazlık Villa", 12000000, "Satılık", "İzmir, Çeşme", "Denize sıfır, özel havuz, 5 yatak odası.", 5, 280, 0, 2],
        ["Bodrum Kiralık Yazlık", 85000, "Kiralık", "Muğla, Bodrum", "Yaz sezonu kiralık, deniz manzaralı, klimalı.", 3, 110, 1, 2],
        ["Bakırköy Satılık 4+1", 5100000, "Satılık", "İstanbul, Bakırköy", "Geniş balkonlu, site içinde, yüzme havuzu.", 4, 175, 6, 2],
        ["Kızılay Kiralık Ofis", 28000, "Kiralık", "Ankara, Kızılay", "Merkezi iş alanı, asansörlü bina, 7/24 güvenlik.", null, 95, 4, 2],
        ["Üsküdar Boğaz Manzaralı", 9800000, "Satılık", "İstanbul, Üsküdar", "Boğaz ve şehir manzarası, lüks rezidans.", 3, 160, 15, 2],
        ["Fethiye Kiralık Dükkan", 15000, "Kiralık", "Muğla, Fethiye", "Turistik bölge, yüksek müşteri potansiyeli.", null, 70, 0, 2],
        ["Maslak Kiralık 3+1", 55000, "Kiralık", "İstanbul, Maslak", "İş merkezine yakın, lüks site, vale park.", 3, 145, 18, 2],
        ["Bornova Satılık 2+1", 1750000, "Satılık", "İzmir, Bornova", "Üniversiteye yakın, yatırımlık daire.", 2, 80, 2, 2]
      ];

      const stmt = db.prepare("INSERT INTO properties (title, price, type, location, description, room_count, square_meters, floor, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      props.forEach(p => stmt.run(p));
      stmt.finalize();
    }
  });
});

module.exports = db;
