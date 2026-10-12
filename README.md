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

## Serverga joylashtirish

Adminka — statik SPA, `admin.ocomarket.uz` da. To'liq tartib (nginx, certbot, yangilash):
[`docs/deploy.md`](docs/deploy.md). Nginx namunasi: [`nginx.conf.example`](nginx.conf.example).

> ⚠️ Build qilishdan oldin `.env.production` da `VITE_API_URL=https://api.ocomarket.uz`
> bo'lsin. Vite env ni build paytida singdiradi — `localhost:3000` bilan yig'ilgan
> `dist/` serverda ishlamaydi va uni keyin tuzatib bo'lmaydi.

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
    categories/
    products/
    orders/
    users/
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

1. **Har bir API so'roviga `ln` qo'shiladi** va u interfeys tiliga ergashadi. Bu `lib/api.ts` interceptorida markazlashgan — qo'lda `axios` ishlatmang, aks holda na `ln`, na token, na refresh bo'ladi.
2. **Tahrirlash formasi `?raw=true` bilan yuklanadi.** Oddiy so'rov bitta tilni qaytaradi; u bilan saqlasangiz qolgan ikki til shu tarjima bilan almashib ketadi. `getRaw` / `useProductRaw` / `useCategoryRaw` ishlating.
3. **Arxivlanganlar uchun `include_archived=true`** (eski `all` parametri deprecated). Kerak bo'lmasa parametrni umuman qo'shmang.
4. **Fiskal kodlar (IKPU) kategoriyada to'ldiriladi**, mahsulotdagisi faqat qoplash uchun. To'ldirilmasa Payme to'lovni boshlatmaydi (`-31008`).
4. **`DELETE` — haqiqiy o'chirish.** Odatiy holatda `PATCH { is_archived: true }` ishlating.
5. **Access token 15 daqiqa.** Avtomatik refresh `lib/api.ts` da.
6. **Jadval ustuniga `type: 'action'` bermang** — kutubxona bunday ustunni jimgina olib tashlaydi va amal tugmalari yo'qoladi.

---

## Loyiha holati

Bajarilgan va rejadagi ishlar — [`docs/BACKLOG.md`](docs/BACKLOG.md).
