# Backlog

Adminka ishlari bosqichlarga bo'lingan. Har bir bosqich mustaqil tugallanadi va `npm run build` dan xatosiz o'tadi.

**Holat belgilari:** `[ ]` qilinmagan · `[~]` jarayonda · `[x]` tugallangan

> **Holat (2026-08-14):** 0–8-bosqichlar tugallandi va brauzerda backend bilan
> tekshirildi (test buyurtmalar bilan). `npm run build` va `npm run lint` toza,
> Vite'ning chunk hajmi ogohlantirishi ham yo'q. Konsol toza.

---

## Bosqich 0 — Poydevor

Qolgan hamma narsa shunga tayanadi. Birinchi bo'lib bajariladi.

- [x] Paketlar: `dgz-ui-shared i18next react-i18next react-router-dom @tanstack/react-query axios dayjs` (+ dev: `@tanstack/react-query-devtools`)
- [x] `.env` va `.env.example` → `VITE_API_URL=http://localhost:3000`; `.env` ni `.gitignore` ga qo'shish
- [x] `@/` alias → `vite.config.ts` + `tsconfig.app.json`
- [x] `src/index.css`: Tailwind + `@theme` **token ko'prigi** (HSL tripletlarni `hsl()` ga o'rash) + brend/semantik ranglar kutubxona shkalasiga bog'landi
- [x] `main.tsx` da **ikkala** kutubxona CSS'i: `dgz-ui/styles.css` + `dgz-ui-shared/styles.css` (birinchisisiz komponentlar uslubsiz chiqadi — `.claude/rules/ui.md` ga qarang)
- [x] `src/lib/types.ts` — `User`, `Category`, `Product`, `Order`, `Role`, `OrderStatus`, `PaymentStatus`
- [x] `src/lib/api.ts` — axios instance, `ln=en` interceptor, Bearer token, bir martalik refresh navbati, xato normalizatsiyasi, `get/getList/post/patch/del`, `fileUrl()`, `toPagination()`, `uploadImage()` (Content-Type o'chirilgan holda)
- [x] `src/i18n/` — init + `locales/{uz,ru,en}.json`, standart `uz`, tanlov `localStorage` da
- [x] `src/app/providers.tsx` — QueryClient, `ThemeProvider`, i18n, `ToastContainer`
- [x] `src/app/router.tsx` — marshrutlar skeleti
- [x] `src/components/layout/` — `AdminLayout`, `Sidebar` (collapsible + mobil `Sheet`), `Header` (breadcrumb, qidiruv, til, tema, profil), `PageHeader`
- [x] `src/components/ui/` — `StatusBadge`, `EmptyState`, `ErrorState`, `PageSkeleton`

## Bosqich 1 — Auth

- [x] `LoginPage` — zod sxema (email, parol ≥ 6), `MyInput`, submit holatida loader
- [x] `login()` oqimi: `POST /api/auth/login` → tokenlarni saqlash → `GET /api/users/profile` → `role !== 'ADMIN'` bo'lsa tokenlarni tozalash va aniq xato
- [x] `ProtectedRoute` — `queryKey: ['profile']`, `retry: false`, ADMIN tekshiruvi
- [x] Avtomatik refresh oqimi (401 → bitta refresh → so'rovni qayta yuborish; refresh ham yiqilsa `/login`)
- [x] Logout — `localStorage` tozalash + query cache tozalash + `/login`
- [x] Xato holatlari: `Invalid credentials`, `Account not verified`, `Forbidden resource` uchun tushunarli matnlar
- [x] `403` va `404` sahifalari

## Bosqich 2 — Profil

- [x] `ProfilePage` — `GET /api/users/profile`, tahrirlash: `full_name`, `phone`
- [x] Avatar yuklash — `POST /api/upload` → `photo` (nisbiy yo'l), ko'rsatishda `fileUrl()`; 5MB va format cheklovi frontendda tekshiriladi
- [x] Til tanlash — `PATCH /api/users/profile { language }` + i18next tilini almashtirish
- [x] `ChangePasswordForm` — `POST /api/auth/change-password`, zod (`new_password` ≥ 6 + tasdiqlash maydoni frontendda)

## Bosqich 3 — Dashboard

Backendda statistika endpointi yo'q — hammasi frontendda hisoblanadi.

- [x] Stat kartalar: buyurtmalar soni statuslar bo'yicha, jami mahsulot (`GET /api/products?all=true&limit=1` → `meta.total`), foydalanuvchilar soni, umumiy tushum
- [x] Statuslar taqsimoti (diagramma) — alohida chart kutubxonasisiz, token ranglarida
- [x] Oxirgi 5 buyurtma ro'yxati
- [x] Yuklanish skeletonlari va xato holati

> Diagramma va "oxirgi buyurtmalar" endi **ma'lumot bilan** ham tekshirildi
> (6-bosqichda test buyurtmalar yaratilgan).

---

---

## Bosqich 4 — Kategoriyalar

- [x] Ro'yxat — `GET /api/categories?all=true` (sahifalash yo'q, `DataTable` ga to'liq ro'yxat)
- [x] Yaratish / tahrirlash — `MyModal` ichida forma, rasm yuklash
- [x] **Nom takrorlanishini frontendda tekshirish** — bazada unikal indeks amalda yo'q
- [x] Arxivlash (`PATCH { is_archived: true }`); `DELETE` alohida, `useConfirm` bilan va ogohlantirish matni bilan
- [x] Arxivlanganlarni ko'rsatish/yashirish filtri

## Bosqich 5 — Mahsulotlar

- [x] Ro'yxat — server tomonda sahifalash, `toPagination()` adapteri, `all: true` bug amalda inobatga olingan
- [x] Filtrlar: `search`, `category_id`, `sortBy`/`sortOrder`, `includeArchived`
- [x] **Jadval ⇄ grid almashtirgichi** — bir xil query va filtr state, faqat render boshqacha; tanlov `localStorage` da
- [x] Forma: ko'p rasm yuklash, `attributes` repeateri, kategoriya `select` dan (500 xatosining oldini oladi), `price` — `Number`
- [x] Arxivlash / o'chirish

## Bosqich 6 — Buyurtmalar

- [x] Ro'yxat — `GET /api/orders/admin/all` (sahifalash yo'q; `paginateLocal()` bilan frontendda kesiladi)
- [x] Detal ko'rinishi — `user`, `items.product`, `payment`
- [x] Status o'zgartirish — `PATCH /api/orders/:id/status`; **ketma-ketlik frontendda cheklanadi** (`ORDER_STATUS_FLOW`), yakuniy statuslarda tugma yo'q
- [x] To'lov statusi — faqat ko'rsatish, **to'lov tugmasi yo'q**
- [x] Status va sana bo'yicha filtr (+ qidiruv: raqam, ism, email, telefon)

> Detal sahifasi alohida `GET /api/orders/:id` **yubormaydi** — o'sha javobda
> bog'langan yozuvlar (mahsulot nomi, to'lov) kelishi hujjatlashtirilmagan.
> `admin/all` da esa kafolatlangan, ustiga kesh ro'yxat va dashboard bilan
> bo'lishiladi (`['orders', 'admin']`).

## Bosqich 7 — Foydalanuvchilar

- [x] Ro'yxat — `GET /api/users` (sahifalash yo'q, `paginateLocal()`)
- [x] Tahrirlash — `full_name`, `phone`, `photo`, `language`
- [x] O'chirish — `useConfirm` bilan; joriy admin **o'zini o'chira olmaydi**
- [x] Rolni o'zgartirib bo'lmasligi UI'da aniq ko'rsatilgan (sahifada ogohlantirish + modalda tahrirlanmaydigan blok)

## Bosqich 8 — Sayqal

- [x] Responsive audit: 375 / 768 / 1280 — sahifa gorizontal scroll qilmaydi, jadval o'z konteyneri ichida siljiydi
- [x] A11y: `role="tab"`/`aria-selected`, `aria-label` filtrlarda, status rangi doim matn yorlig'i bilan
- [x] Barcha ro'yxatlarga skeleton
- [x] Error boundary (`components/ui/ErrorBoundary.tsx`, `App.tsx` da)
- [x] Konsol toza (i18next "missing key" yo'q — uchala locale kalit-ma-kalit teng)
- [x] `npm run build` va `npm run lint` toza
- [x] **Bundle hajmi** — marshrutlar `lazy()` bilan bo'lindi: entry 1.13 MB → **259 KB**
      (gzip 81 KB), Vite ogohlantirishi yo'q.

> Eng katta chunk hali ham `dgz-ui/form` (474 KB / gzip 150 KB) — ichida quill
> (html-editor) va react-select bor. `dgz-ui` da alohida `./input` kabi yengil
> subpath **yo'q**, shuning uchun undan qutulishning yagona yo'li — `MyInput`
> o'rniga o'z inputimizni yozish. Endi u faqat forma bor sahifada yuklanadi.

---

## Backendda yo'q — frontend qoplaydi

Bular endpoint qidirib vaqt yo'qotmaslik uchun qayd etilgan:

| Yetishmayotgan | Yechim |
|---|---|
| Dashboard statistikasi | Frontendda hisoblanadi |
| `GET /api/users` sahifalashi | Frontendda cheklab ko'rsatiladi |
| `GET /api/orders/admin/all` sahifalashi | Frontendda cheklab ko'rsatiladi |
| Rolni o'zgartirish | Umuman yo'q — faqat seed/baza orqali |
| Logout endpointi | `localStorage` tozalanadi |
| Kategoriya nomi unikalligi | Frontendda tekshiriladi |
| Buyurtma status ketma-ketligi | Frontendda cheklanadi |

---

## Tuzatilgan xatolar

**`type: 'action'` ustunlari jadvalda umuman chizilmasdi** (2026-08-14).
`dgz-ui-shared` ning `useColumns` hooki `columns.filter((c) => c.type !== 'action')`
qiladi — ya'ni `type: 'action'` ustunni **o'chirib tashlaydi**, amal ustuni deb
belgilamaydi. Natijada kategoriyalar va mahsulotlar sahifalarida tahrirlash,
arxivlash va o'chirish tugmalari umuman ko'rinmasdi (xato ham bermasdi).
Yechim: amal ustuniga `type` bermaslik. Batafsil —
[`.claude/rules/ui.md`](../.claude/rules/ui.md) dagi tuzoqlar jadvali.
