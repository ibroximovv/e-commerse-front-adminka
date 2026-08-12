# Kod uslubi

## Papka tuzilishi

Feature-based. Modulga tegishli hamma narsa bitta papkada:

```
src/
  app/
    App.tsx           # providers zanjiri
    router.tsx        # marshrutlar
    providers.tsx     # QueryClient, ThemeProvider, i18n, ToastContainer
  components/
    layout/           # AdminLayout, Sidebar, Header, PageHeader
    ui/               # loyihaga xos umumiy komponentlar (StatusBadge, ImageUpload, ...)
  features/
    <modul>/
      api.ts          # faqat HTTP chaqiruvlar, React yo'q
      hooks.ts        # TanStack Query hooklari
      components/
      pages/
      types.ts        # faqat shu modulga xos tiplar
  i18n/
    index.ts
    locales/{uz,ru,en}.json
  lib/
    api.ts            # axios instance + get/post/patch/del/getList/toPagination/fileUrl
    types.ts          # umumiy domen tiplari (User, Product, Category, Order)
    utils.ts
```

Qaerga qo'yishni bilmasangiz: **ikki va undan ortiq feature ishlatsa** — `lib/` yoki `components/ui/`; aks holda feature papkasida qoldiring. Ehtimoliy qayta ishlatish uchun oldindan `ui/` ga chiqarmang.

## Qatlamlar

`api.ts` → `hooks.ts` → `components/` → `pages/`. Bir yo'nalishda. Komponent to'g'ridan-to'g'ri `api.ts` ni chaqirmasin, `hooks.ts` orqali o'tsin.

## Nomlash

| Nima | Uslub | Misol |
|---|---|---|
| Komponent fayli | PascalCase | `ProductForm.tsx` |
| Qolgan fayllar | camelCase | `api.ts`, `useProducts.ts` |
| Papkalar | kebab-case | `features/dashboard/` |
| Tiplar/interfeyslar | PascalCase, prefikssiz | `Product` (❌ `IProduct`) |
| Query hooklari | `use<Resurs>` | `useProducts`, `useProfile` |
| Mutatsiya hooklari | `use<Resurs>Mutations` | `useProductMutations` |
| Boolean | `is/has/can` | `isArchived`, `hasPayment` |

Domen maydonlari backenddagidek `snake_case` qoladi (`full_name`, `category_id`, `is_archived`) — konvertatsiya qilmang, chalkashlik chiqadi.

## TypeScript

- `any` ishlatmang. Noma'lum bo'lsa `unknown` + tor qilish.
- Umumiy domen tiplari `lib/types.ts` da — bitta manba, takrorlamang.
- Statuslar uchun union tip (`OrderStatus`), enum emas.
- Komponent proplari — `type`, `interface` emas (kengaytirish kerak bo'lsa `interface`).
- Funksiya qaytish tipini yozishga majbur emassiz, agar aniq ko'rinib tursa.

## React

- Faqat funksional komponentlar.
- **React Compiler yoqilgan** — `useMemo`/`useCallback` ni qo'lda qo'shmang, kompilyator o'zi hal qiladi. Faqat o'lchab, haqiqiy muammo topsangiz qo'shing.
- Server state — TanStack Query. `useState` + `useEffect` bilan fetch qilmang.
- Client state — `useState`; global kerak bo'lsa `zustand` (kutubxona bilan keladi).
- Ro'yxatlarda `key` — barqaror `id`, indeks emas.
- Sahifa komponentlari yupqa bo'lsin: ma'lumot olish + maket. Mantiq hooklarda, ko'rinish kichik komponentlarda.

## Query kalitlari

Massiv, birinchi element resurs nomi, keyin parametrlar:

```ts
['profile']
['products', filters]
['product', id]
['categories', { all: true }]
```

Invalidatsiya prefiks bo'yicha: `qc.invalidateQueries({ queryKey: ['products'] })`.

## Importlar

Tartib: tashqi paketlar → `dgz-ui*` → loyiha (`@/...`) → nisbiy → uslub.

`@/` aliasi `src/` ga ishora qiladi (`vite.config.ts` + `tsconfig.app.json` da sozlanadi). Uch va undan chuqur nisbiy yo'l yozmang (`../../../`).

## Izohlar

Kod nima qilayotganini emas, **nega** shunday qilinganini yozing. Backend gotcha'lari (masalan `all=false` bug'i, `ln=en` sababi) — albatta izohlansin, aks holda keyingi odam "tozalab" buzadi.

Ortiqcha izoh yozmang — atrofdagi kodning zichligiga moslashing.

## Til

- Kod, o'zgaruvchi nomlari, izohlar — **inglizcha**.
- UI matnlari — locale fayllarida, komponentda qattiq yozilmasin.
- Hujjatlar (`.md`) — o'zbekcha.
