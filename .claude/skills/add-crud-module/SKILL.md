---
name: add-crud-module
description: Adminkaga yangi CRUD moduli (kategoriyalar, mahsulotlar, buyurtmalar, foydalanuvchilar kabi) qo'shish. Ro'yxat sahifasi, forma, mutatsiyalar va marshrutni loyihaning mavjud konvensiyalari bo'yicha yaratadi.
---

# Yangi CRUD moduli qo'shish

Bu skill `src/features/<modul>/` ostida to'liq modul yaratadi. Avval [`.claude/rules/api.md`](../../rules/api.md) va [`.claude/rules/ui.md`](../../rules/ui.md) ni o'qing.

## 0. Oldindan tekshiring

1. `../e-commerse/docs/admin-frontend.md` dan modulning endpointlarini toping.
2. `../e-commerse/src/api/<modul>/dto/*.dto.ts` dan validatsiya qoidalarini o'qing — forma sxemasi shunga mos bo'lishi kerak.
3. Modulda **sahifalash bormi?** Hozircha faqat `GET /api/products` da `meta` qaytadi. Qolganlarida yo'q — bu 3-qadamni o'zgartiradi.
4. `src/lib/types.ts` da domen tipi bormi? Bo'lsa qayta yozmang.

## 1. `api.ts` — faqat HTTP

React yo'q, `lib/api.ts` yordamchilaridan foydalaning.

```ts
import { get, getList, post, patch, del } from '@/lib/api';
import type { Thing } from '@/lib/types';

export const thingsApi = {
  list: (params?: ThingFilters) => getList<Thing>('/api/things', params),
  byId: (id: string) => get<Thing>(`/api/things/${id}`),
  create: (body: ThingInput) => post<Thing>('/api/things', body),
  update: (id: string, body: Partial<ThingInput>) => patch<Thing>(`/api/things/${id}`, body),
  archive: (id: string) => patch<Thing>(`/api/things/${id}`, { is_archived: true }),
  remove: (id: string) => del<Thing>(`/api/things/${id}`),
};
```

Diqqat:
- `ln=en` interceptorda — qo'lda qo'shmang.
- Arxivlanganlar kerak bo'lsa `all: true`. **Kerak bo'lmasa `all` ni umuman yubormang** (`all=false` bug'i).

## 2. `hooks.ts` — TanStack Query

```ts
export function useThings(filters: ThingFilters) {
  return useQuery({
    queryKey: ['things', filters],
    queryFn: () => thingsApi.list(filters),
    placeholderData: (prev) => prev,   // sahifa almashganda maket sakramaydi
  });
}

export function useThingMutations() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: ['things'] });
  return {
    create: useMutation({ mutationFn: thingsApi.create, onSuccess }),
    update: useMutation({ mutationFn: ({ id, body }) => thingsApi.update(id, body), onSuccess }),
    archive: useMutation({ mutationFn: thingsApi.archive, onSuccess }),
    remove: useMutation({ mutationFn: thingsApi.remove, onSuccess }),
  };
}
```

## 3. Ro'yxat sahifasi

`DataTable` + `PageHeader`. Ustunlarni alohida faylga chiqaring (`components/columns.tsx`) — sahifa yupqa qolsin.

**Sahifalash serverda bo'lsa** (mahsulotlar): `onParamChange` → filtr state → yangi so'rov; `dataSource={toPagination(items, meta)}`.

**Sahifalash bo'lmasa** (kategoriyalar, foydalanuvchilar, buyurtmalar): hammasini bir marta oling va to'liq ro'yxatni bering — `DataTable` o'zi bo'ladi.

Uchala holat majburiy: yuklanmoqda (skeleton), bo'sh (`Empty` + taklif), xato (+ "Qayta urinish").

`tableKey` noyob bo'lsin — ustun ko'rinishi shu kalit bilan saqlanadi.

## 4. Forma

`react-hook-form` + `zod`, kutubxonaning `My*` komponentlari. `MyModal` ichida (kichik forma) yoki alohida sahifada (katta forma, masalan mahsulot).

- Sxema backend DTO'siga mos: majburiy maydonlar, minimal uzunliklar, son turlari.
- Yaratish va tahrirlash **bitta** forma komponenti bo'lsin, `defaultValues` bilan farqlansin.
- Rasm kerak bo'lsa `components/ui/ImageUpload` ishlating — u `POST /api/upload` ga yuboradi va **nisbiy** yo'l qaytaradi (`uploads/...`). Bazaga shu nisbiy yo'l saqlanadi, ko'rsatishda `fileUrl()`.

## 5. O'chirish

Standart amal — **arxivlash** (`PATCH { is_archived: true }`), o'chirish emas. `DELETE` bazadan butunlay o'chiradi va eski buyurtmalardagi bog'lanishni uzadi.

`DELETE` ni faqat alohida, aniq belgilangan "butunlay o'chirish" amali sifatida bering va `useConfirm()` bilan o'rang.

## 6. Marshrut va navigatsiya

1. `src/app/router.tsx` ga marshrut qo'shing (`ProtectedRoute` + `AdminLayout` ichiga).
2. `src/components/layout/Sidebar.tsx` ga havola va ikonka (`lucide-react`) qo'shing.
3. Sahifa sarlavhasi uchun `useDocumentTitle` ishlating.

## 7. i18n

Barcha matnlarni `src/i18n/locales/{uz,ru,en}.json` ga `<modul>.*` prefiksi bilan qo'shing. **Uchala faylga ham** — aks holda konsolda "missing key".

## 8. Yakuniy tekshiruv

- [ ] `npm run build` — TS xatosiz
- [ ] Network panelida har bir so'rovda `ln=en`
- [ ] Yaratish → ro'yxat yangilandi → tahrirlash → arxivlash ishlaydi
- [ ] Bo'sh va xato holatlari ko'rinadi
- [ ] Light va dark temada tekshirildi
- [ ] 375px / 768px / 1280px da maket buzilmaydi
- [ ] `docs/BACKLOG.md` da tegishli bosqich belgilandi
