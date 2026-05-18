# Gayrimenkul Yönetim Sistemi

JWT tabanlı kimlik doğrulama ile çalışan, kullanıcıya özel mülk yönetim uygulaması.

## Teknolojiler

| Katman    | Teknoloji                           |
|-----------|-------------------------------------|
| Backend   | Node.js, Express 5                  |
| Veritabanı | SQLite3                            |
| Auth      | JSON Web Token (JWT), bcryptjs      |
| Frontend  | Vanilla JS, HTML5, CSS3             |
| Dokümantasyon | Swagger UI (OpenAPI 3.0)        |
| Test      | Jest, Supertest                     |

## Kurulum

```bash
# 1. Repoyu klonla
git clone <repo-url>
cd gayrimenkul-projesi

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle → JWT_SECRET değerini değiştir

# 4. Sunucuyu başlat
npm start
```

Uygulama `http://localhost:3000` adresinde çalışır.

## Ortam Değişkenleri

| Değişken     | Açıklama                        | Örnek                              |
|--------------|---------------------------------|------------------------------------|
| `JWT_SECRET` | JWT imzalama anahtarı           | `gayrimenkul_super_secret_key_2026` |
| `PORT`       | Sunucu portu (varsayılan: 3000) | `3000`                             |

## API Endpoint'leri

### Auth

| Method | Endpoint               | Açıklama                        | Auth |
|--------|------------------------|---------------------------------|------|
| POST   | `/api/auth/register`   | Yeni kullanıcı kaydı            | —    |
| POST   | `/api/auth/login`      | Giriş yap, JWT token al         | —    |

**Register request body:**
```json
{ "username": "johndoe", "email": "john@example.com", "password": "sifre123" }
```

**Login request body:**
```json
{ "email": "john@example.com", "password": "sifre123" }
```

### Properties (JWT Gerektirir)

Tüm isteklere `Authorization: Bearer <token>` başlığı eklenmelidir.

| Method | Endpoint                 | Açıklama                     |
|--------|--------------------------|------------------------------|
| GET    | `/api/properties`        | Kullanıcıya ait mülkleri listele |
| POST   | `/api/properties`        | Yeni mülk ekle               |
| GET    | `/api/properties/:id`    | Tek mülk getir               |
| PUT    | `/api/properties/:id`    | Mülk güncelle                |
| DELETE | `/api/properties/:id`    | Mülk sil                     |

**Property request body:**
```json
{
  "title": "3+1 Daire Kadıköy",
  "price": 500000,
  "type": "Satılık",
  "location": "İstanbul, Kadıköy"
}
```

## Proje Yapısı

```
gayrimenkul-projesi/
├── public/
│   ├── css/
│   │   └── style.css          # Tüm sayfalar için CSS
│   ├── js/
│   │   └── main.js            # SPA mantığı
│   ├── index.html             # Ana uygulama (SPA)
│   ├── login.html             # Giriş sayfası
│   └── register.html          # Kayıt sayfası
├── src/
│   ├── controllers/
│   │   ├── authController.js  # Auth HTTP handler'ları
│   │   └── propertyController.js
│   ├── middleware/
│   │   └── auth.js            # JWT doğrulama middleware
│   ├── models/
│   │   └── db.js              # SQLite bağlantısı ve tablo oluşturma
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── propertyRoutes.js
│   ├── services/
│   │   ├── authService.js     # Kayıt ve giriş iş mantığı
│   │   └── propertyService.js # CRUD iş mantığı
│   ├── app.js                 # Express uygulaması
│   └── swagger.yaml           # API dokümantasyonu
├── tests/
│   ├── authService.test.js
│   └── propertyService.test.js
├── .env                       # Ortam değişkenleri (git'e eklenmez)
├── .env.example               # Örnek ortam dosyası
├── .gitignore
└── package.json
```

## Testler

```bash
npm test
```

Jest, `tests/` klasöründeki tüm `*.test.js` dosyalarını çalıştırır. Testler gerçek veritabanı yerine mock kullanır.

## Swagger Dokümantasyonu

Sunucu çalışırken API dokümantasyonuna şu adresten ulaşabilirsiniz:

```
http://localhost:3000/api-docs
```

"Authorize" butonuna tıklayarak JWT token girin, ardından korumalı endpoint'leri test edebilirsiniz.

## Frontend Kullanımı

1. `http://localhost:3000/register.html` → Hesap oluşturun
2. `http://localhost:3000/login.html` → Giriş yapın
3. Giriş başarılıysa `index.html`'e yönlendirilirsiniz
4. Mülk ekleyin, düzenleyin, silin ve arama yapın
