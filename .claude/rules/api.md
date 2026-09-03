# API qoidalari

Manba: `../e-commerse/docs/admin-frontend.md`. Bu fayl — amaliy qisqartma.

## Base

- `VITE_API_URL` → `http://localhost:3000`
- Barcha yo'llar `/api/...` bilan boshlanadi
- Statik fayllar: `<BASE_URL>/uploads/<fayl>`

## 1. Til: `ln` — ro'yxatlarga, `raw=true` — formalarga

Backend `name`, `description`, atribut `key`/`value`/`unit` maydonlarini **bazadagi** tarjimadan qaytaradi. Til tanlash tartibi: `?ln=uz|ru|en` → JWT dagi `user.language` → `uz`.

`ln` `lib/api.ts` interceptorida markazlashgan va **interfeys tiliga ergashadi**:

```ts
let apiLanguage: Language = 'uz'          // i18n/index.ts `setApiLanguage()` bilan yangilaydi
config.params = { ln: apiLanguage, ...(config.params ?? {}) }
```

> Ilgari bu qiymat `'en'` ga qotirilgan edi, chunki tarjima lug'at orqali qilinardi va tahrirlash formasiga tarjima qilingan nom tushib, saqlaganda bazadagi asl nom buzilardi. **Endi bunday emas** — tarjima bazadan keladi.

**Tahrirlash formasi doim `?raw=true` bilan yuklansin.** U bitta tarjima o'rniga `name_uz`/`name_ru`/`name_en` (va `description_*`, atributlarda `key_*`/`value_*`/`unit_*`) qaytaradi — ya'ni forma boshqa tillarni ustidan yozib yubormaydi.

| Nima | Chaqiruv |
|---|---|
| Ro'yxat, jadval, tanlov (select) | `get` / `getList` — `raw` **yo'q** |
| Tahrirlash modali | `getRaw` (`?raw=true`) → `useCategoryRaw`, `useProductRaw` |

`raw` javobini `lib/localized.ts` yordamchilari ochadi: `fromRaw(raw, 'name')` → `{ uz, ru, en }`, `cleanLocalized()` esa bo'sh tillarni tashlab yuboradi.

> Til almashganda TanStack Query keshi eskiradi — `useChangeLanguage()` shu sababli `qc.invalidateQueries()` chaqiradi. Tilni to'g'ridan-to'g'ri `setLanguage()` bilan almashtirmang (login sahifasidan tashqari — u yerda hali kesh yo'q).

## 2. Ko'p tilli yozish

`name` va `description` **obyekt** sifatida yuboriladi:

```ts
{ name: { uz: 'Kabel', ru: 'Кабель' } }   // en tegilmaydi
```

- `name` uchun kamida bitta til to'ldirilgan bo'lishi shart (`hasAnyLocale`).
- PATCH da **yuborilmagan til o'zgarmaydi**.
- Bo'sh satr = "to'ldirilmagan", tozalash emas. Tarjimani o'chirish uchun alohida yo'l yo'q.

## 3. Javob konverti

Muvaffaqiyatli javob:

```jsonc
{ "success": true, "data": {...}, "language": "uz" }
```

⚠️ `message` va `meta` bo'sh bo'lsa **`null` emas, umuman yo'q** — `res.message ?? ''` kabi ixtiyoriy o'qish ishlating, `res.message === null` tekshiruvi endi ishlamaydi.

`meta` faqat sahifalanadigan ro'yxatda:

```jsonc
{ "meta": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 } }
```

Konvert `lib/api.ts` yordamchilarida ochiladi — komponentlarda `res.data.data` yozilmasin:

| Yordamchi | Qaytaradi |
|---|---|
| `get<T>(url, params)` | `T` |
| `getRaw<T>(url, params)` | `T` — `?raw=true` bilan, faqat tahrirlash formalari uchun |
| `getList<T>(url, params)` | `{ items: T[], meta?, language? }` |
| `post/patch/del<T>(...)` | `T` |
| `toPagination(items, meta)` | `DataTable` uchun `{ docs, page, limit, total, totalPages }` |
| `paginateLocal(items, page, limit)` | server sahifalamaydigan ro'yxatlar uchun |
| `fileUrl(path)` | `"uploads/x.png"` → `"http://localhost:3000/uploads/x.png"` |

**Har doim `lib/api.ts` dagi instance orqali so'rov yuboring.** Chetlab o'tilgan `axios`/`fetch` da `ln` ham, token ham, refresh ham yo'q.

## 4. Xatolar

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

## 5. Auth

| Metod | Yo'l | Izoh |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → `{ user, access_token, refresh_token }` |
| POST | `/api/auth/refresh` | `{ refresh_token }` → yangi juftlik |
| POST | `/api/auth/forgot-password` | `{ email }` → parolni tiklash kodi yuboriladi |
| POST | `/api/auth/reset-password` | `{ email, code, new_password }` → yangi parol o'rnatiladi |
| POST | `/api/auth/logout` | Tokenlarni bekor qilish va tizimdan chiqish |
| POST | `/api/auth/change-password` | `{ old_password, new_password }`, token kerak |
| GET | `/api/users/profile` | Joriy foydalanuvchi — **rolni shu yerdan oling** |

- `access_token` — 15 daqiqa. `refresh_token` — 7 kun.
- Login to'g'ridan-to'g'ri `user` obyektini qaytaradi (avvalgi faqat tokenlar o'rniga).
- Login rad etilishi: 401 `Invalid credentials` · 401 `Account not verified` · 403 `Forbidden resource` (roli ADMIN emas).
- Refresh oqimi bir martalik navbat bilan (`refreshing` promise) — parallel 401'lar bitta refresh kutadi.

## 6. Endpointlar

🔓 ochiq · 🔑 token · 👑 faqat ADMIN

**Dashboard** `/api/dashboard` — GET `/stats` 👑 (umumiy tushum, to'langan tushum, buyurtmalar, mahsulotlar, foydalanuvchilar, oylik dinamika, top 5 mahsulotlar)

**Products** `/api/products` — GET 🔓 (sahifalash + `meta`), GET `/:id` 🔓, POST 👑, PATCH `/:id` 👑, DELETE `/:id` 👑

Query: `page`, `limit`, `search`, `category_id`, `min_price`, `max_price`, `sortBy` (`name|price|stock|created_at`), `sortOrder` (`asc|desc`), `all`, `price_on_request`.

- `search` uchala tilda ham qidiradi — interfeys tiliga qarab natija yo'qolmaydi.
- `include_descendants` **olib tashlangan** (kategoriyalar endi tekis).

> ⚠️ **`all=false` yubormang** — backend bug'i tufayli `true` kabi ishlaydi va arxivlanganlarni ham qaytaradi. Arxivlanganlar kerak bo'lmasa parametrni **umuman qo'shmang**. Adminkada odatda `all=true` kerak.

Body: `{ name: {uz,ru,en}, description?, price: number, stock?, images?, category_id, tags?, attributes?, price_on_request?, ikpu_code?, package_code?, vat_percent?, units? }`. PATCH da hammasi ixtiyoriy + `is_archived?`.

- `price` — `Float`. `Number` yuboring, string emas (`"999.99"` validatsiyadan o'tmaydi).
- `price_on_request: true` bo'lsa narx maydonlari bloklanadi va mahsulotni buyurtma qilib bo'lmaydi.
- `attributes` — `[{ key: {uz,ru,en}, value: {…}, unit?: {…} }]`. **PATCH da massiv to'liq almashtiriladi**, shuning uchun tahrirlashda hamma qatorni qayta yuboring. O'lchov birligini `key` ichiga yozmang (`"Uzunlik (m)"` ❌) — `unit` alohida. Sonli qiymat uchala tilda bir xil bo'lsin, aks holda faset ikkiga bo'linadi.
- Fiskalizatsiya: `vat_percent` faqat `0` yoki `12`; yuborilmasa `.env` dagi standart ishlatiladi.

Faset atributlari `key` (filtrlash uchun barqaror kalit) va `label` (ko'rsatish uchun tarjima) ga bo'lingan. **Filtrga `key` yuboring, ekranga `label` chizing** — aralashtirsangiz til almashganda tanlangan filtr yo'qoladi.

**Categories** `/api/categories` — GET 🔓 (`?all=true` arxivlanganlar bilan), GET `/all` 🔓 (menyu va select uchun, sahifalashsiz), GET `/:id` 🔓, POST/PATCH/DELETE 👑. Sahifalash yo'q.

Katalog **tekis**: `parent_id`, `children`, `breadcrumbs`, `GET /tree`, `GET /:id/breadcrumbs`, `?root_only`, `?parent_id` — hammasi olib tashlangan.

- Kategoriya arxivlansa **ichidagi mahsulotlar ham arxivlanadi** — tasdiqlash dialogida shuni aytib qo'ying.
- Mahsuloti bor kategoriyani o'chirib bo'lmaydi (400).

**Users** `/api/users` — GET `/profile` 🔑, PATCH `/profile` 🔑, GET 👑 (`?page=1&limit=10&role=USER&search=...`), GET `/stats` 👑, GET `/:id` 👑, PATCH `/:id` 👑, PATCH `/:id/role` 👑 (`{ role: 'ADMIN' | 'USER' }`), DELETE `/:id` 👑

Tahrirlanadigan maydonlar: `full_name`, `phone`, `photo`, `language`. Admin tomonidan rol o'zgartirish `PATCH /api/users/:id/role` orqali amalga oshiriladi. `language` ∈ `uz|ru|en`.

**Orders** `/api/orders` — GET `/admin/all` 👑 (`?page=1&limit=10&status=...&search=...&start_date=...`), GET `/:id` 🔑, PATCH `/:id/status` 👑 `{ status }`, PATCH `/:id/cancel` 👑, PATCH `/:id/archive` 👑

Model: `user`, `items.product`, `payment`, `shipping_address`, `customer_phone`, `customer_name`, `notes`, `payment_method`, `is_archived`.

**Payments** `/api/payments` — GET `/admin/all` 👑 (`?page=1&limit=10&status=...&provider=...&search=...`), GET `/status/:order_id` 🔑. Statuslar: `PENDING`, `SUCCESSFUL`, `FAILED`, `REFUNDED`.

Payme maydonlari: `payme_transaction_id` (avvalgi `transaction_id`), `payme_state`, `payme_create_time` / `payme_perform_time` / `payme_cancel_time` (**millisekundlik timestamp**, ISO satr emas), `payme_reason`.

`payme_state`: `CREATED` · `PERFORMED` · `CANCELLED` · `CANCELLED_AFTER_PERFORM`.

> `status` yolg'iz yetarli emas: bekor qilingan to'lov ham, qaytarilgan pul ham `FAILED` bo'lib keladi — farqi faqat `payme_state` da. Shuning uchun ro'yxatda ikkalasi ham ko'rsatiladi (`PaymeStateBadge`).

> Adminkada to'lov tugmasi **qo'ymang**. Eski `POST /api/payments` o'chirilgan; o'rniga `POST /api/payments/checkout` → `checkout_url`, u faqat mijozning o'z buyurtmasi uchun ishlaydi. Monitoring sahifasi `/payments` orqali kuzatiladi.

**Upload** — `POST /api/upload` 🔑 (`file`), `POST /api/upload/multiple` 🔑 (`files` - 10 tagacha), `DELETE /api/upload?path=...` 🔑.

## 7. TanStack Query konvensiyasi

Query key — massiv, birinchi element resurs nomi:

```ts
['profile']
['products', filters]
['product', id]
['product', id, 'raw']        // tahrirlash formasi — ?raw=true
['categories', filters]
['categories', 'all', params] // GET /api/categories/all
['category', id, 'raw']
['orders', 'admin', filters]
['payments', 'admin', filters]
['dashboard', 'stats']
['users', 'list', filters]
['users', 'stats']
```

Mutatsiyadan keyin `qc.invalidateQueries({ queryKey: [...] })`.

`'raw'` kalitini oxiriga qo'ying — shunda `['product', id]` prefiksi bilan invalidatsiya ikkalasini ham yangilaydi.

Sahifa almashganda "sakramaslik" uchun: `placeholderData: (prev) => prev`.
