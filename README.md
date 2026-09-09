# 🍔 Sonic Backend API

باك إند كامل بـ Node.js + Express مبني على Postman Collection.

## 🚀 تشغيل المشروع

```bash
# 1. تثبيت الـ packages
npm install

# 2. تشغيل development
npm run dev

# 3. أو تشغيل production
npm start
```

السيرفر هيشتغل على: `http://127.0.0.1:8000/api`

---

## 📁 هيكل المشروع

```
sonic-backend/
├── src/
│   ├── app.js                  # Entry point
│   ├── config/
│   │   ├── db.js               # In-memory database + seed data
│   │   └── response.js         # Helper للـ responses
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── upload.js           # Multer file upload
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── favoriteController.js
│   │   ├── optionsController.js
│   │   ├── orderController.js
│   │   └── cartController.js
│   └── routes/
│       └── index.js            # كل الـ routes
├── uploads/                    # الصور المرفوعة
├── .env
└── package.json
```

---

## 📋 الـ Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | ❌ | تسجيل مستخدم جديد (form-data + image) |
| POST | `/api/login` | ❌ | تسجيل الدخول |
| POST | `/api/logout` | ✅ | تسجيل الخروج |
| GET | `/api/profile` | ✅ | بيانات البروفايل |
| POST | `/api/update-profile` | ✅ | تحديث البروفايل (form-data + image) |

### Category
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | ❌ | كل الفئات |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ✅ | كل المنتجات (مع search وfilter بالـ category) |
| GET | `/api/products/:id` | ✅ | منتج بالـ ID |

**Query params للـ products:**
- `?name=Burger` → بحث بالاسم
- `?category_id=1` → فلتر بالـ category

### Favorites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/toggle-favorite` | ✅ | إضافة أو إزالة من المفضلة |
| GET | `/api/favorites` | ✅ | المفضلة |

### Product Options
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/toppings` | ✅ | كل الـ toppings |
| GET | `/api/side-options` | ✅ | كل الـ side options |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✅ | إنشاء أوردر جديد |
| GET | `/api/orders` | ✅ | كل أوردرات المستخدم |
| GET | `/api/orders/:id` | ✅ | أوردر بالـ ID |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/cart/add` | ✅ | إضافة items للـ cart |
| GET | `/api/cart` | ✅ | محتوى الـ cart |
| DELETE | `/api/cart/remove/:id` | ✅ | حذف item من الـ cart |

---

## 📦 نموذج الـ Response

```json
{
  "status": true,
  "message": "Success",
  "data": { ... }
}
```

---

## 🗄️ قاعدة البيانات

المشروع بيستخدم **In-Memory Database** (بيانات في الـ RAM). 
لو عايز تربطه بـ database حقيقية:
- **MySQL** → استخدم `mysql2` + `sequelize`
- **MongoDB** → استخدم `mongoose`
- **PostgreSQL** → استخدم `pg` + `sequelize`

---

## 🔐 المصادقة

كل الـ endpoints اللي محتاجة auth بتستخدم **JWT Bearer Token**:

```
Authorization: Bearer <your_token>
```

---

## 🚀 الرفع على سيرفر (Production)

### 1. جهّز المتغيرات
انسخ `.env.example` لـ `.env` وحط قيمك:
```bash
cp .env.example .env
```
- `JWT_SECRET`: لازم تغيّرها لقيمة عشوائية طويلة (تقدر تولّد وحدة بالأمر ده):
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `CORS_ORIGIN`: حط دومين الفرونت اند/الموبايل بتاعك (فاصلة بين أكتر من دومين)، أو سيبها فاضية لو عايز تسمح للكل.

### 2. تثبيت الباكدجات وتشغيل بـ PM2
```bash
npm install --production
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup && pm2 save
```

### 3. Nginx كـ reverse proxy (اختياري بس موصى بيه)
وجّه الدومين بتاعك لـ `http://127.0.0.1:8000` وركّب شهادة SSL مجانية بـ Let's Encrypt (`certbot`).

### 4. تخزين البيانات
المشروع بيستخدم In-Memory DB لكن **بيحفظ نسخة تلقائيًا** في `data/db.json` بعد كل عملية تعديل (تسجيل، أوردر، كارت...)، وبيقرأها تاني عند تشغيل السيرفر من جديد — يعني الداتا مش بتتمسح مع كل `restart`/`redeploy`.

⚠️ **ده حل مؤقت مناسب لمشروع صغير/تجريبي بس.** لو التطبيق هيكبر أو هيشتغل بأكتر من instance (cluster/load balancer)، لازم تستبدل `db.json` بقاعدة بيانات حقيقية:
- **MySQL** → `mysql2` + `sequelize`
- **MongoDB** → `mongoose`
- **PostgreSQL** → `pg` + `sequelize`

### 5. الصور المرفوعة (`uploads/`)
لو هتنشر على منصة مفيهاش persistent disk (زي بعض PaaS اللي بتعمل reset للـ filesystem)، الصور هتتمسح مع كل deploy. الأفضل تستخدم تخزين خارجي زي **AWS S3** أو **Cloudinary** بدل التخزين المحلي.
