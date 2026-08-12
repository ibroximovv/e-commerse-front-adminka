# E-commerce Adminka (frontend)

`e-commerse` (NestJS + Prisma + MongoDB) backendi uchun admin panel.

- **Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · [`dgz-ui-shared`](https://www.npmjs.com/package/dgz-ui-shared) · TanStack Query · React Router · react-hook-form + zod · i18next
- **Backend:** `http://localhost:3000` · Swagger: `http://localhost:3000/api/docs`
- **API shartnomasi:** [`../e-commerse/docs/admin-frontend.md`](../e-commerse/docs/admin-frontend.md) — yagona haqiqat manbai.

---

## Ishga tushirish

### 1. Backend

```bash
cd ../e-commerse && npm run start:dev
```

Admin hisobi faqat seed orqali yaratiladi (API'da `role` maydonini o'zgartirish imkoni yo'q):

```bash
cd ../e-commerse && npx prisma db seed
```

Seed hisobi: `admin@gmail.com` / `password`.

### 2. Frontend

```bash
npm install
```

`.env` faylini yarating (`.env.example` dan nusxa oling):

```
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

Adminka `http://localhost:5173` da ochiladi. Backend'da `app.enableCors()` yoqilgan, proxy kerak emas.

---

## Skriptlar

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Vite dev server (HMR) |
| `npm run build` | `tsc -b` + production build |
| `npm run preview` | Build natijasini ko'rish |
| `npm run lint` | ESLint |

---

## Papka tuzilishi

```
src/
  app/            # Router, providers (QueryClient, Theme, i18n), root App
  components/
    layout/       # AdminLayout, Sidebar, Header, PageHeader
    ui/           # Loyihaga xos umumiy komponentlar (dgz-ui ustiga qurilgan)
  features/       # Har bir modul o'z papkasida: api, hooks, components, pages
    auth/
    profile/
    dashboard/
  i18n/           # i18next init + locales/{uz,ru,en}.json
  lib/            # api.ts (axios instance), types.ts, utils
  index.css       # Tailwind + dgz-ui-shared styles + @theme token ko'prigi
```

Feature papkasi ichidagi tartib:

```
features/<modul>/
  api.ts          # faqat HTTP chaqiruvlar
  hooks.ts        # TanStack Query hooklari
  components/     # shu modulga xos komponentlar
  pages/          # marshrutga ulanadigan sahifalar
  types.ts        # modulga xos tiplar (umumiylari lib/types.ts da)
```

---

## Muhim eslatmalar

Batafsil qoidalar — [`.claude/rules/`](.claude/rules/) va [`AGENTS.md`](AGENTS.md) da. Eng kritiklari:

1. **Har bir API so'roviga `ln=en` qo'shiladi.** Backend `name`/`description` maydonlarini tarjima qiladi; `ln` yubormasangiz tahrirlash formasiga tarjima qilingan matn tushadi va saqlaganda bazadagi asl nom buziladi. Bu `lib/api.ts` interceptorida markazlashgan — qo'lda `axios` ishlatmang.
2. **UI tili ≠ API tili.** Interfeys uz/ru/en bo'la oladi, lekin API so'rovlari **doim** `ln=en` bilan ketadi.
3. **`all=false` yubormang** (mahsulotlarda) — backend bug'i tufayli `true` kabi ishlaydi. Kerak bo'lmasa parametrni umuman qo'shmang.
4. **`DELETE` — haqiqiy o'chirish.** Odatiy holatda `PATCH { is_archived: true }` ishlating.
5. **Access token 15 daqiqa.** Avtomatik refresh `lib/api.ts` da.

---

## Loyiha holati

Bajarilgan va rejadagi ishlar — [`docs/BACKLOG.md`](docs/BACKLOG.md).
