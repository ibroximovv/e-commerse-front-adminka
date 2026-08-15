# Next.js Mijoz (Storefront) Veb-Sayti bo'yicha Texnik Hujjat

Ushbu hujjat `e-commerse` NestJS backendi hamda mavjud backend API shartnomalari (`../e-commerse/docs/admin-frontend.md` va `docs/update.md`) asosida **Next.js (App Router)** da mijozlar (xaridorlar) uchun elektron tijorat saytini yaratish bo'yicha to'liq yo'riqnomadir.

---

## 1. Loyiha haqida va Maqsad

- **Loyiha turi:** E-Commerce Online Storefront (Mijozlar sayti)
- **Framework:** Next.js 15+ (App Router, Server & Client Components)
- **Tillar:** TypeScript, HTML5
- **Backend Base URL:** `http://localhost:3000` (Dev) / `https://api.domain.com` (Prod)
- **API Formati:** RESTful JSON Envelope (`{ success, data, meta, message }`)

---

## 2. Texnologiyalar Steki

| Qatlam | Tanlov | Izoh |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, ISR, SEO optimallashtirish va Server Components uchun |
| **Til** | TypeScript | Tip xavfsizligi va DTO mosligi |
| **Uslub / UI** | Tailwind CSS v4 + Lucide Icons | Tezkor va moslashuvchan dizayn |
| **State Management** | Zustand | Global savat, foydalanuvchi sessiyasi va filtrlar |
| **Server State / Fetching** | TanStack Query v5 / Native `fetch` | Kesh, revalidation va client-side fetching |
| **Formalar va Validatsiya** | React Hook Form + Zod | Ro'yxatdan o'tish va me'yordagi formalarni validatsiya qilish |
| **i18n (Ko'p tillilik)** | `next-intl` yoki `i18next` | `uz`, `ru`, `en` tillarini qo'llab-quvvatlash |
| **Xabarlar** | `sonner` yoki `react-toastify` | Bildirishnomalar uchun |

---

## 3. Loyiha Strukturasi (Next.js App Router)

```text
src/
├── app/
│   ├── [lang]/                       # i18n marshrutlash (uz/ru/en)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Kirish sahifasi
│   │   │   ├── register/page.tsx     # Ro'yxatdan o'tish
│   │   │   └── verify/page.tsx       # SMS/Email kodni tasdiqlash
│   │   ├── (shop)/
│   │   │   ├── page.tsx              # Bosh sahifa (Home)
│   │   │   ├── catalog/page.tsx      # Katalog va fasetli filtrlar
│   │   │   ├── categories/[slug]/page.tsx # Kategoriya mahsulotlari
│   │   │   ├── product/[slug]/page.tsx    # Mahsulot batafsil sahifasi
│   │   │   ├── cart/page.tsx         # Savat
│   │   │   ├── checkout/page.tsx     # Buyurtma berish
│   │   │   ├── orders/page.tsx       # Buyurtmalar tarixi
│   │   │   └── orders/[id]/page.tsx  # Buyurtma tafsiloti
│   │   ├── profile/page.tsx          # Shaxsiy kabinet
│   │   └── layout.tsx                # Asosiy layout (Header, Footer)
│   └── api/                          # Next.js Route Handlers (kerak bo'lsa)
├── components/
│   ├── common/                       # Header, Footer, Navbar, LanguageSwitcher
│   ├── ui/                           # Button, Input, Modal, Badge, Drawer
│   ├── product/                      # ProductCard, ProductGrid, PriceTag, RatingStars
│   ├── category/                     # CategoryTree, CategoryCard
│   ├── cart/                         # CartDrawer, CartItemRow, CartSummary
│   └── checkout/                     # PaymentProviderSelect, AddressForm
├── lib/
│   ├── api.ts                        # Fetch/Axios API mijoz va interceptorlar
│   ├── auth.ts                       # Tokenlar va auth yordamchilar
│   ├── types.ts                      # Backend DTO va interfeyslar
│   └── utils.ts                      # formatPrice, fileUrl, slugify
├── services/                         # API servis funksiyalari (products, categories, cart...)
└── store/                            # Zustand do'konlari (useCartStore, useAuthStore)
```

---

## 4. Backend API Integratsiyasi

### 4.1. Response Envelope va Ma'lumot Strukturasi

Backend barcha javoblarni bir xil konvertda qaytaradi:

```json
{
  "success": true,
  "data": { ... },
  "message": null,
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

- **Muvaffaqiyatli ma'lumot:** `res.data.data` ichidan olinadi.
- **Sahifalash:** `res.data.meta` tarkibida `total`, `page`, `limit`, `totalPages` keladi.
- **Xatolar:** Validatsiya xatolarida `message` massiv bo'lib kelishi mumkin (`['email must be an email']`).

### 4.2. Til parametri (`?ln`)

Backend dynamic kontentni (`name`, `description`, `message`, `error`) tarjima qilib beradi:
- `?ln=uz` (standart)
- `?ln=ru`
- `?ln=en`

> **Mijoz saytida:** Har bir API so'roviga joriy tanlangan til `?ln=${currentLang}` parametri bilan birga yuborilishi shart.

### 4.3. Statik fayllar (Rasmlar)

Backend rasmlarni nisbiy yo'lda qaytaradi (masalan: `"uploads/1712345678-123.png"`).
Saytda ko'rsatish uchun yordamchi funksiya:

```ts
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function fileUrl(path?: string | null): string {
  if (!path) return '/placeholder-image.png';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/${path.replace(/^\//, '')}`;
}
```

---

## 5. Autentifikatsiya va Foydalanuvchi Oqimi

Mijozlar (xaridorlar) uchun ishlatiladigan API endpointlar:

| Amaliyot | Metod | Endpoint | Body / Izoh |
|---|---|---|---|
| **Ro'yxatdan o'tish** | POST | `/api/auth/register` | `{ email, password, full_name?, phone? }` |
| **Kodni tasdiqlash** | POST | `/api/auth/verify` | `{ email, code }` |
| **Kodni qayta yuborish**| POST | `/api/auth/resend-code` | `{ email }` |
| **Tizimga kirish** | POST | `/api/auth/login` | `{ email, password }` |
| **Tokenni yangilash** | POST | `/api/auth/refresh` | `{ refresh_token }` |
| **Profil ma'lumoti** | GET | `/api/users/profile` | Header: `Authorization: Bearer <token>` |
| **Profilni tahrirlash**| PATCH | `/api/users/profile` | `{ full_name?, phone?, photo?, language? }` |

### Tokenlarni saqlash va Next.js Middleware

1. `access_token` (15 daqiqa) va `refresh_token` (7 kun) HTTP-only Cookie yoki `localStorage` da saqlanadi.
2. Next.js **Middleware** orqali `/checkout`, `/orders`, `/profile` sahifalariga kirishda token mavjudligi tekshiriladi.
3. Token muddati tugaganda API interceptor avtomatik `/api/auth/refresh` ni chaqirib tokenni yangilaydi.

---

## 6. Mijoz Sayti Sahifalari va Endpointlar Xaritasi

### 6.1. Bosh sahifa (`/`)

Bosh sahifada parallel so'rovlar (Server Component orqali SSR / ISR):

```ts
// Bosh sahifa uchun kerakli so'rovlar:
const [categoriesTree, topProducts, discounted, newArrivals, bestSellers] = await Promise.all([
  get<Category[]>('/api/categories/tree?with_product_count=true'),
  getList<Product>('/api/products/top?limit=8'),
  getList<Product>('/api/products/discounted?limit=8'),
  getList<Product>('/api/products/new-arrivals?limit=8'),
  getList<Product>('/api/products/best-sellers?limit=8'),
]);
```

- **Hero Banner & Kategoriya menyusi:** `GET /api/categories/tree` (ierarxik daraxt).
- **TOP Mahsulotlar:** `GET /api/products/top` (`is_top` va `popularity_score` bo'yicha).
- **Aksiyadagi mahsulotlar:** `GET /api/products/discounted` (chegirma foizi bo'yicha).
- **Yangi kelganlar:** `GET /api/products/new-arrivals?within_days=30`.
- **Eng ko'p sotilganlar:** `GET /api/products/best-sellers`.

---

### 6.2. Katalog va Filtrlash Sahifasi (`/catalog` & `/categories/[slug]`)

Filtrlash va fasetlar bitta so'rovda olinadi:

```http
GET /api/products?category_slug=electronics&with_facets=true&sort=relevance&page=1&limit=20
```

#### Backend Fasetlari (`meta.facets`):
- `price.min` va `price.max` — Narx slideri chegaralari.
- `categories` — Ichki kategoriyalar va ulardagi mahsulotlar soni (`count`).
- `brands` — Filtrdagi brendlar va sanoqlar (`Apple`, `Samsung`...).
- `attributes` — Atributlar (masalan: `Color`, `Storage`, `RAM`).
- `counts` — Zaxira va aksiya sanoqlari (`in_stock`, `discounted`, `rating_4_plus`).

#### Sortlash Presetlari (`sort` parametri):
- `relevance` (Default: TOP → reyting → yangilik)
- `newest` / `oldest`
- `price_asc` / `price_desc`
- `popular` (sotuvlar soni bo'yicha)
- `top_rated` (eng yuqori baholanganlar)
- `discount` (chegirma foizi bo'yicha)

---

### 6.3. Mahsulot Batafsil Sahifasi (`/product/[slug]`)

Mahsulot batafsil sahifasi uchun so'rovlar:

1. **Mahsulot ma'lumotlari:** `GET /api/products/slug/:slug`
   - Qaytadi: `breadcrumbs`, `stock_status` (`in_stock` | `low_stock` | `out_of_stock`), `is_new`, `final_price`, `price`, `discount_percent`, `images`, `attributes`.
2. **O'xshash mahsulotlar:** `GET /api/products/:id/related?limit=8`
3. **Izohlar va summary:**
   - Summary: `GET /api/products/:productId/reviews/summary` (O'rtacha baho, yulduzlar taqsimoti).
   - Izohlar ro'yxati: `GET /api/products/:productId/reviews?page=1&limit=10`.

#### Narx ko'rsatish mantiqi:
```tsx
const displayPrice = product.final_price; // Haqiqiy to'lanadigan narx
const hasDiscount = product.discount_percent > 0;

return (
  <div className="flex items-center gap-2">
    <span className="text-2xl font-bold text-foreground">
      {formatPrice(displayPrice)}
    </span>
    {hasDiscount && (
      <>
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(product.price)}
        </span>
        <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-500">
          -{product.discount_percent}%
        </span>
      </>
    )}
  </div>
);
```

---

### 6.4. Savat (Cart) va Checkout Oqimi

#### Savat Operatsiyalari (`/api/carts`):
- `GET /api/carts` — Joriy foydalanuvchi savatini olish.
  ```json
  "totals": {
    "items_count": 2,
    "subtotal": 1799.98,      // Frontendda qayta hisoblamang, shu summani ko'rsating
    "original_total": 1999.98,
    "discount_total": 200
  }
  ```
- `POST /api/carts/items` — Savatga mahsulot qo'shish (`{ product_id, quantity }`).
- `PATCH /api/carts/items/:product_id` — Miqdorni o'zgartirish (`{ quantity }`).
- `DELETE /api/carts/items/:product_id` — Mahsulotni savatdan olib tashlash.

#### Buyurtma Rasmiylashtirish (Checkout):
1. **Buyurtma yaratish:** `POST /api/orders/checkout` (Body yo'q yoki manzil ma'lumotlari). Savat avtomatik buyurtmaga aylanadi.
2. **To'lov holati va provayder tanlovi:**
   - Statusni olish: `GET /api/payments/status/:order_id`
   - To'lov tashkillashtirish: `POST /api/payments` (`{ order_id, provider: "CLICK" | "PAYME" | "STRIPE" }`).
   - To'lov muvaffaqiyatli bo'lsa, buyurtma statusi avtomatik `CONFIRMED` bo'ladi.

---

### 6.5. Buyurtmalar Tarixi va Status Kuzatuvi (`/orders`)

- **Buyurtmalar ro'yxati:** `GET /api/orders` (`?archived=false`).
- **Buyurtma batafsil:** `GET /api/orders/:id`.
- **Statuslar zanjiri:**
  - `PENDING` (Kutilmoqda)
  - `CONFIRMED` (Tasdiqlandi)
  - `SHIPPED` (Yo'lda / Yuborildi)
  - `DELIVERED` (Yetkazib berildi)
  - `CANCELLED` (Bekor qilindi)

---

### 6.6. Izoh va Reyting Qoldirish

- **Izoh yozish / baholash:** `POST /api/products/:productId/reviews`
  ```json
  {
    "rating": 5,
    "comment": "Juda sifatli mahsulot, tavsiya qilaman!"
  }
  ```
- Agar xaridor mahsulotni xarid qilgan bo'lsa, javobda `is_verified_purchase: true` chiqadi va saytda **"Tasdiqlangan Xarid"** belgisi ko'rsatiladi.

---

## 7. SEO va Performance (Next.js Optimizatsiya)

1. **Dynamic Metadata & OpenGraph:**
   ```tsx
   // app/[lang]/product/[slug]/page.tsx
   export async function generateMetadata({ params }: Props): Promise<Metadata> {
     const product = await getProductBySlug(params.slug);
     return {
       title: `${product.name} — Online Do'kon`,
       description: product.description,
       openGraph: {
         images: [fileUrl(product.images[0])],
       },
     };
   }
   ```
2. **Next.js Image Component:**
   `next.config.js` da `remotePatterns` ga backend hostini qo'shish:
   ```js
   module.exports = {
     images: {
       remotePatterns: [
         { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
       ],
     },
   };
   ```
3. **ISR (Incremental Static Regeneration):**
   Kategoriya va bosh sahifa ma'lumotlarini revalidate qilish (`revalidate: 60` soniya).

---

## 8. Muhim Eslatmalar va Qoidalar (Dos & Don'ts)

- ❌ **Narxni frontendda hisoblamang:** Har doim backend yuborgan `final_price` va savatdagi `totals.subtotal` ishlatilsin.
- ❌ **Backendga `all=true` yoki `include_archived=true` yubormang:** Bu parametrlar faqat ADMIN paneli uchun. Mijoz saytida arxivlangan mahsulotlar va kategoriyalar ko'rinmasligi kerak.
- ❌ **Soxta (mock) to'lov tugmasini to'g'ri ko'rsating:** `POST /api/payments` hozircha simulyatsiya rejimidagi to'lov statusini qaytaradi.
- ✅ **Har bir API so'roviga `?ln=${lang}` qo'shing:** Mijoz qaysi tilni tanlagan bo me (`uz`, `ru`, `en`), backend ma'lumotlarni o'sha tilda qaytaradi.
- ✅ **Kategoriya ierarxiyasida `GET /api/categories/tree` ishlating:** Barcha ota va ichki kategoriyalarni bitta daraxt shaklida olish imkonini beradi.

---

Ushbu yo'riqnoma asosida Next.js mijoz veb-saytini yaratish backend bilan 100% moslikni va yuqori unumdorlikni ta'minlaydi.
