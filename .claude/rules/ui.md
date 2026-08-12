# UI qoidalari

## Kutubxona: `dgz-ui-shared`

Versiya `^1.2.47`, bazasi `dgz-ui@1.4.16` (shadcn/ui uslubi), Tailwind v4.1.18 ustiga qurilgan.

### Import yo'llari

```ts
// main.tsx — TARTIB MUHIM va IKKALA css ham kerak
import 'dgz-ui/styles.css';                                 // baza komponentlar (111KB)
import 'dgz-ui-shared/styles.css';                          // ⚠️ dist/dgz-ui-shared.css EMAS
import './index.css';                                       // bizning tokenlar, oxirida

import { ThemeProvider } from 'dgz-ui-shared/providers';
import { DataTable } from 'dgz-ui-shared/components/datatable';
import { MyInput, MySelect } from 'dgz-ui-shared/components/form';
import { MyModal } from 'dgz-ui-shared/components/modal';
import { Empty } from 'dgz-ui-shared/components/empty';
import { Loader } from 'dgz-ui-shared/components/loader';
import { useConfirm, useTheme } from 'dgz-ui-shared/hooks';
import { Button } from 'dgz-ui/button';
import { Card } from 'dgz-ui/card';
```

> Paket README'sida `dgz-ui-shared/dist/dgz-ui-shared.css` yozilgan — **bu eskirgan, bunday fayl yo'q.** To'g'ri yo'l `dgz-ui-shared/styles.css`.

> ⚠️ **`dgz-ui/styles.css` ni tushirib qoldirmang.** Komponentlarning utility'lari (`bg-item-primary`, `border-border-alpha-strong`, `rounded-4`, `text-body-*`) aynan o'sha faylda. Busiz tugmalar fonsiz, inputlar chegarasiz chiqadi va sabab darrov ko'rinmaydi — bizning Tailwind build'imiz `node_modules` ni skanerlamaydi.

### ⚠️ Kutubxonaning tuzoqlari (amalda uchraganlari)

Bular paket hujjatlarida yozilmagan, brauzerda topilgan:

| Tuzoq | Oqibati | Yechim |
|---|---|---|
| `My*` komponentlari ichida `useFormContext()` chaqiriladi | Faqat `control` uzatsangiz ilova **ishga tushmaydi**: `Cannot destructure property 'getFieldState' of 'useFormContext(...)' as it is null` | Formani `<Form {...form}>` (FormProvider) bilan o'rang. README'dagi namuna bu joyda noto'g'ri. |
| `CardTitle` da `justify-between` qattiq yozilgan | Ikona + matn qo'ysangiz matn o'ng chekkaga uchadi | `justify-start` bilan bekor qiling — yoki `components/ui/SectionCard` ishlating |
| `CardDescription` ichida `cn("text-body-sm-regular text-secondary")` | tailwind-merge ikkalasini `text-*` deb to'qnashtiradi va o'lchamni tashlaydi → izoh sarlavha kattaligida chiqadi | O'lcham va rangni o'zingiz bering (`text-sm text-muted-foreground`) |
| `SheetContent` da fon klassi umuman yo'q | Mobil drawer **shaffof**, orqadagi kontent ko'rinib turadi | `bg-background-secondary` (yoki `bg-background`) qo'shing |
| i18n kalitlari sifatida inglizcha matnning o'zi ishlatiladi (`t("Light")`, `t("Rows per page")`) | uz/ru interfeysda kutubxona matnlari inglizcha qoladi | Bu kalitlar locale fayllarining **ildizida** turibdi — yangi kutubxona komponenti qo'shsangiz, uning kalitlarini ham qo'shing |

### Mavjud komponentlar

| Toifa | Komponentlar |
|---|---|
| Ma'lumot | `DataTable`, `MyTable`, `MyGallery` |
| Forma | `MyInput`, `MySelect`, `MyShadcnSelect`, `MyCheckbox`, `MyRadio`, `MySwitch`, `MyTextarea`, `MyDatePicker`, `MyDateRangePicker`, `MyTimePicker`, `MyHtmlEditor`, `MyMaskInput` |
| Fikr-mulohaza | `Loader`, `Spin`, `Empty` |
| Ustki qatlam | `MyModal`, `Confirm`, `PasswordConfirm`, `MyTooltip` |
| Navigatsiya | `MyPagination`, `MyLimitSelect` |
| Yordamchi | `ThemeToggle`, `ExportData`, `FilterWrapper`, `Search` |

Hooklar: `useConfirm`, `useColumns`, `useDataTable`, `useDocumentTitle`, `useFilter`, `useMediaQuerySizes`, `useSortable`, `useTheme`.

**Yangi komponent yozishdan oldin shu ro'yxatni tekshiring.** Modal, jadval, tasdiqlash dialogi, pagination — hammasi tayyor.

## ⚠️ Tailwind token ko'prigi

`dgz-ui-shared/styles.css` — **oldindan kompilyatsiya qilingan** CSS va faqat kutubxonaning **o'zi ishlatgan** utility klasslarini saqlaydi. Masalan `.text-foreground` va `.rounded-lg` bor, lekin `.bg-primary`, `.bg-card`, `.border-border` **yo'q**.

Ya'ni bizning kodimiz ishlatadigan utility'lar bizning Tailwind build'imizda generatsiya bo'lishi kerak. Buning uchun `src/index.css` da `@theme` bloki kutubxonaning `:root` o'zgaruvchilariga bog'lanadi.

**Qiymat formatlari aralash** — ko'prik yozayotganda diqqat qiling:

| Format | Misol | Ko'prikda |
|---|---|---|
| Tayyor rang | `--primary: var(--color-neutral-950)` | to'g'ridan-to'g'ri: `var(--primary)` |
| Tayyor rang | `--border: #30303033` | to'g'ridan-to'g'ri |
| `hsl()` siz HSL triplet | `--foreground: 0 0% 3.9%` | o'rash kerak: `hsl(var(--foreground))` |
| `hsl()` siz HSL triplet | `--muted: 0 0% 96.1%`, `--card`, `--accent`, `--destructive`, `--popover`, `--input`, `--ring` | o'rash kerak |

Tripletni o'ramasangiz rang jimgina ishlamaydi (xato bermaydi) — brauzerda ko'zdan kechiring.

`tailwind.config.js` **yaratmang** — Tailwind v4 CSS-first, hamma sozlama `src/index.css` da.

## Ranglar

- ❌ Qo'lda rang yozmang: `#fff`, `bg-white`, `bg-zinc-800`, `text-gray-500`.
- ✅ Token ishlating: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`.

Brend akssenti — `bg-brand` / `text-brand` / `bg-brand-muted`. U kutubxonaning o'z shkalasiga (`--color-blue-600` / `--color-blue-50`) bog'langan, chunki `Button` ning akssenti ham o'sha. Alohida rang tanlasangiz tugmalar bilan faol navigatsiya turli ohangda chiqadi. Shkalalarning o'zi `.dark` da qayta aniqlanadi, shuning uchun dark uchun alohida qiymat yozish shart emas.

Semantik: `text-success`, `bg-success-muted`, `text-warning`, `bg-warning-muted`, `text-info`, `bg-info-muted`.

Sabab: dark rejim `.dark` klassi orqali o'zgaruvchilarni almashtiradi (`--color-neutral-base` `#fff` → `#131313`). Qo'lda yozilgan rang almashmaydi.

Status ranglari uchun bitta joyda xarita saqlang (`components/ui/StatusBadge.tsx`), har sahifada takrorlamang:

| Status | Ohang |
|---|---|
| `PENDING` | neytral / kutish |
| `CONFIRMED` | ma'lumot (ko'k) |
| `SHIPPED` | jarayon (binafsha) |
| `DELIVERED` | muvaffaqiyat (yashil) |
| `CANCELLED`, `FAILED` | destructive |

Rang **yagona signal bo'lmasin** — matn yorlig'i bilan birga bering (rang ko'rmaydiganlar uchun).

## Tema

`ThemeProvider` (`dgz-ui-shared/providers`) ilovani o'raydi, `defaultTheme="system"`. Almashtirish uchun tayyor `ThemeToggle` bor. Har bir yangi ekranni **ikkala temada** ham ko'zdan kechiring.

## DataTable

Barcha ro'yxatlar uchun standart. Backend javobini adapter orqali bering — `dataSource` `{ docs, page, limit, total, totalPages }` shaklini kutadi, backend esa `{ data, meta }` beradi. `lib/api.ts` dagi `toPagination()` ishlating.

```tsx
<DataTable<Product>
  tableKey="products"        // ustun ko'rinishi shu kalit bo'yicha saqlanadi — noyob bo'lsin
  rowKey="id"
  columns={columns}
  dataSource={toPagination(items, meta)}
  onParamChange={setParams}  // qidiruv, filtr, sahifa, limit, sort — hammasi shu yerdan
  loading={isLoading}
  hasPagination
  hasSearch
  hasColumnsVisibilityDropdown
/>
```

Ustun tipi:

```ts
{ key: string; dataIndex: keyof TData; name?: ReactNode; sortable?: boolean;
  hidden?: boolean; type?: 'data' | 'action'; render?: (value, record) => ReactNode }
```

Sahifalash serverda bo'lsa (mahsulotlar), `onParamChange` → query params → yangi so'rov. Sahifalash serverda bo'lmasa (kategoriyalar, foydalanuvchilar, buyurtmalar) — hammasini bir marta olib, DataTable'ga to'liq ro'yxat bering.

> `DataTable` ichida `react-i18next`ning `useTranslation` chaqiriladi. **i18n init qilinmasa runtime xato beradi.**

## i18n

- UI tili: uz (standart) / ru / en. `i18next` + `react-i18next`, locale fayllari `src/i18n/locales/`.
- Tanlov `localStorage` da saqlanadi va `PATCH /api/users/profile { language }` orqali serverga ham yoziladi.
- **API `ln` parametri bilan aralashtirmang** — u doim `en`.
- Yangi matn qo'shganda uchala locale'ga ham kalit qo'shing, aks holda konsolda "missing key" ogohlantirishi chiqadi.

## Maket va responsive

- **Sidebar** — yig'iladigan (collapsible); `md` dan kichikda `Sheet` drawer.
- **Header** — sticky; breadcrumb, qidiruv, til select, `ThemeToggle`, profil dropdown.
- Breakpointlar: `375px` (mobil), `768px` (planshet), `1280px` (desktop) — har uchalasida tekshiring.
- Jadval mobilda gorizontal scroll ichida bo'lsin, sahifaning o'zi gorizontal scroll qilmasin.
- Sahifa sarlavhasi + amal tugmalari uchun umumiy `PageHeader` komponenti — har sahifada qayta yozmang.

## Holatlar

Har bir ma'lumot ko'rsatadigan ekran **uchala holatni** qamrashi shart:

| Holat | Nima ko'rsatiladi |
|---|---|
| Yuklanmoqda | Skeleton (maket sakramasligi uchun) yoki `Loader` |
| Bo'sh | `Empty` + nima qilish kerakligi haqida taklif (masalan "Birinchi mahsulotni qo'shing") |
| Xato | Xato matni + "Qayta urinish" tugmasi |

Mutatsiya natijasi — `react-toastify` orqali (muvaffaqiyat ham, xato ham).

O'chirish/arxivlash kabi qaytarib bo'lmaydigan amallarda `useConfirm()` majburiy:

```tsx
const { confirm } = useConfirm();
confirm({ onConfirm: () => remove.mutate(id) });
```

## Formalar

`react-hook-form` + `zod`. Kutubxonaning `My*` komponentlari `control` va `name` oladi:

```tsx
<MyInput control={control} name="email" label={t('auth.email')} required />
```

- Validatsiya qoidalari backend DTO'lariga mos bo'lsin (masalan parol ≥ 6 belgi) — foydalanuvchi 400 xatosini kutib o'tirmasin.
- Yuborilayotgan tiplar to'g'ri bo'lsin: `price` — `Number`, string emas.
- Formani yuborayotganda submit tugmasi `disabled` + loader holatida bo'lsin.
