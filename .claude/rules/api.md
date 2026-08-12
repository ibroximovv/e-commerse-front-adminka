# API qoidalari

Manba: `../e-commerse/docs/admin-frontend.md`. Bu fayl — amaliy qisqartma.

## Base

- `VITE_API_URL` → `http://localhost:3000`
- Barcha yo'llar `/api/...` bilan boshlanadi
- Statik fayllar: `<BASE_URL>/uploads/<fayl>`

## 1. `ln=en` — majburiy

Backend javoblarni tarjima qiladi. Standart til `uz`, ya'ni `ln` yubormasangiz `name`, `description`, `message`, `error`, `full_name` maydonlari lug'atdagi so'zlarga almashtirilib keladi.

Adminkada bu ma'lumot yo'qotadi: tahrirlash formasiga tarjima qilingan qiymat tushadi, saqlasangiz bazadagi asl nom buziladi.

`lib/api.ts` interceptorida markazlashgan:

```ts
config.params = { ln: 'en', ...(config.params ?? {}) };
```

**Shu sababli har doim `lib/api.ts` dagi instance orqali so'rov yuboring.** Chetlab o'tilgan `axios`/`fetch` chaqiruvi jimgina buzilgan ma'lumot beradi.

> UI tili (i18next, uz/ru/en) bilan aralashtirmang — ular butunlay boshqa narsa. UI qanday tilda bo'lishidan qat'i nazar API `ln=en` oladi.

## 2. Javob konverti

Muvaffaqiyatli javob:

```jsonc
{ "success": true, "data": {...}, "message": null, "meta": null }
```

`meta` faqat sahifalanadigan ro'yxatda (**hozircha faqat `GET /api/products`**):

```jsonc
{ "meta": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 } }
```

Konvert `lib/api.ts` yordamchilarida ochiladi — komponentlarda `res.data.data` yozilmasin:

| Yordamchi | Qaytaradi |
|---|---|
| `get<T>(url, params)` | `T` |
| `getList<T>(url, params)` | `{ items: T[], meta? }` |
| `post/patch/del<T>(...)` | `T` |
| `toPagination(items, meta)` | `DataTable` uchun `{ docs, page, limit, total, totalPages }` |
| `fileUrl(path)` | `"uploads/x.png"` → `"http://localhost:3000/uploads/x.png"` |

## 3. Xatolar

```jsonc
{ "success": false, "statusCode": 400, "error": "Bad Request",
  "message": "Email already registered", "path": "...", "timestamp": "..." }
```

Validatsiya xatosida `message` — **massiv**. `lib/api.ts` uni normallashtiradi:

```ts
const raw = error.response?.data?.message ?? error.message;
throw new Error(Array.isArray(raw) ? raw.join(', ') : raw);
```

500 xatolarida `message` ichida Prisma'ning xom xatosi (server fayl yo'llari bilan) kelishi mumkin — foydalanuvchiga ko'rsatmang, umumiy xabar bering.

## 4. Auth

| Metod | Yo'l | Izoh |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → `{ access_token, refresh_token }` |
| POST | `/api/auth/refresh` | `{ refresh_token }` → yangi juftlik |
| POST | `/api/auth/change-password` | `{ old_password, new_password }`, token kerak |
| GET | `/api/users/profile` | Joriy foydalanuvchi — **rolni shu yerdan oling** |

- `access_token` — 15 daqiqa. `refresh_token` — 7 kun.
- Rolni token'ni `atob()` qilib emas, `GET /api/users/profile` orqali tekshiring — bazadagi haqiqiy holatni beradi.
- **Logout endpointi yo'q** — tokenlar stateless. Chiqish = `localStorage` tozalash.
- Login rad etilishi: 401 `Invalid credentials` · 401 `Account not verified` · 403 `Forbidden resource` (roli ADMIN emas).
- Refresh oqimi bir martalik navbat bilan (`refreshing` promise) — parallel 401'lar bitta refresh kutadi.

## 5. Endpointlar

🔓 ochiq · 🔑 token · 👑 faqat ADMIN

**Products** `/api/products` — GET 🔓 (sahifalash + `meta`), GET `/:id` 🔓, POST 👑, PATCH `/:id` 👑, DELETE `/:id` 👑

Query: `page`, `limit`, `search`, `category_id`, `min_price`, `max_price`, `sortBy` (`name|price|stock|created_at`), `sortOrder` (`asc|desc`), `all`.

> ⚠️ **`all=false` yubormang** — backend bug'i tufayli `true` kabi ishlaydi va arxivlanganlarni ham qaytaradi. Arxivlanganlar kerak bo'lmasa parametrni **umuman qo'shmang**. Adminkada odatda `all=true` kerak.

Body: `{ name, description?, price: number, stock?, images?: string[], category_id, attributes?: [{key, value}] }`. PATCH da hammasi ixtiyoriy + `is_archived?`.

> `price` — `Float`. `Number` yuboring, string emas (`"999.99"` validatsiyadan o'tmaydi).

**Categories** `/api/categories` — GET 🔓 (`?all=true` arxivlanganlar bilan), GET `/:id` 🔓, POST/PATCH/DELETE 👑. Sahifalash yo'q.

> ⚠️ `name` schema'da `@unique`, lekin MongoDB'da indeks amalda yaratilmagan — takrorlanish bemalol o'tadi. **Saqlashdan oldin mavjud ro'yxatdan qidiring.**
> ⚠️ Kategoriyani o'chirsangiz mahsulotlarning `category_id` si osilib qoladi (MongoDB'da FK yo'q). `PATCH { is_archived: true }` ishlating.

**Users** `/api/users` — GET `/profile` 🔑, PATCH `/profile` 🔑, GET 👑 (**sahifalashsiz**), GET `/:id` 👑, PATCH `/:id` 👑, DELETE `/:id` 👑

Tahrirlanadigan maydonlar faqat: `full_name`, `phone`, `photo`, `language`. **`role` yo'q** — API orqali admin yaratib bo'lmaydi, faqat seed yoki baza orqali. `language` ∈ `uz|ru|en`.

**Orders** `/api/orders` — GET `/admin/all` 👑 (ichida `user`, `items.product`, `payment`; **sahifalash yo'q**), GET `/:id` 🔑, PATCH `/:id/status` 👑 `{ status }`

Status: `PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED`, yoki `CANCELLED`. **Backend ketma-ketlikni tekshirmaydi** — `DELIVERED` dan `PENDING` ga ham qaytaradi. Mantiqni frontend cheklaydi.

**Payments** `/api/payments` — GET `/status/:order_id` 🔑. Statuslar: `PENDING`, `SUCCESSFUL`, `FAILED`, `REFUNDED`. To'lov muvaffaqiyatli bo'lsa buyurtma avtomat `CONFIRMED` ga o'tadi. To'lov hozircha **mock**.

> Adminkada to'lov tugmasi **qo'ymang** — `POST /api/payments` faqat o'z buyurtmasi uchun ishlaydi.

**Upload** `POST /api/upload` 🔑 — `multipart/form-data`, maydon nomi **`file`**, faqat rasm (`jpg|jpeg|png|gif|webp`), maks **5MB**. Javob: `{ url: "uploads/1712345678-123.png" }`.

> `url` **nisbiy** va boshida `/` yo'q. Bazaga aynan shu nisbiy yo'lni saqlang, ko'rsatishda `fileUrl()` bilan to'liq manzilga aylantiring.
> ⚠️ Instance'da global `Content-Type: application/json` bor — upload'da uni **o'chirish** kerak, aks holda FormData boundary buziladi.

## 6. TanStack Query konvensiyasi

Query key — massiv, birinchi element resurs nomi:

```ts
['profile']
['products', filters]
['product', id]
['categories', { all: true }]
['orders']
```

Mutatsiyadan keyin `qc.invalidateQueries({ queryKey: ['products'] })`.

Sahifa almashganda "sakramaslik" uchun: `placeholderData: (prev) => prev`.

## 7. Backendda yo'q narsalar

Bularni frontend hisoblaydi — endpoint qidirmang:

- **Dashboard statistikasi** — `GET /api/orders/admin/all` ni olib, statuslar bo'yicha frontendda sanang. Jami mahsulot soni: `GET /api/products?all=true&limit=1` → `meta.total`.
- **Foydalanuvchi rolini o'zgartirish** — umuman yo'q.
- **Logout** — yo'q.
- **`GET /api/users` va `GET /api/orders/admin/all` da sahifalash** — yo'q, ma'lumot ko'paysa sekinlashadi. Frontendda cheklab ko'rsating.
