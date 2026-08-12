# AGENTS.md

Bu repoda ishlaydigan AI agent uchun ko'rsatma. Odam uchun umumiy ma'lumot — [`README.md`](README.md) da.

## Kontekst

`e-commerse` NestJS backendi uchun **admin panel**. Mijoz (do'kon) tomoni bu repoda emas — `register`, `verify`, `resend-code`, `carts`, `checkout` kabi endpointlar adminkaga kerak emas.

API shartnomasining yagona haqiqat manbai: **`../e-commerse/docs/admin-frontend.md`**. Endpoint, body yoki javob formati haqida shubha bo'lsa — avval shu faylni o'qing, keyin `../e-commerse/src/api/**/dto/*.dto.ts` dan validatsiya qoidalarini tekshiring. Taxmin qilmang.

## Stack

| Qatlam | Tanlov |
|---|---|
| Build | Vite 8, React 19 (React Compiler yoqilgan) |
| Uslub | Tailwind CSS v4 (`@theme` orqali, `tailwind.config.js` **yo'q**) |
| UI kutubxona | `dgz-ui-shared` (baza: `dgz-ui`, shadcn/ui uslubi) |
| Server state | TanStack Query |
| Formalar | react-hook-form + zod (`@hookform/resolvers`) |
| Marshrut | React Router |
| i18n | i18next + react-i18next (uz/ru/en) |
| Xabarlar | react-toastify |

## Qoidalar

Ular alohida fayllarga bo'lingan — tegishlisini o'qing:

- [`.claude/rules/api.md`](.claude/rules/api.md) — API bilan ishlash
- [`.claude/rules/ui.md`](.claude/rules/ui.md) — UI va uslub
- [`.claude/rules/code-style.md`](.claude/rules/code-style.md) — kod tuzilishi

Yangi CRUD moduli qo'shayotgan bo'lsangiz — [`.claude/skills/add-crud-module/SKILL.md`](.claude/skills/add-crud-module/SKILL.md).

## Ish tartibi

1. `docs/BACKLOG.md` dan qaysi bosqichda ekanligingizni aniqlang.
2. Mavjud kodni o'qing — `lib/api.ts` dagi yordamchilar, `components/ui/` dagi komponentlar allaqachon bor bo'lishi mumkin. Takror yozmang.
3. Bosqichni tugatgach `npm run build` ni ishga tushiring (TS xatolari faqat shu yerda ko'rinadi — `npm run dev` type-check qilmaydi).
4. `docs/BACKLOG.md` dagi belgilarni yangilang.

## Qilmang

- ❌ `lib/api.ts` dagi instance'ni chetlab o'tib `axios`/`fetch` chaqirmang — `ln=en` va token refresh yo'qoladi.
- ❌ `tailwind.config.js` yaratmang — Tailwind v4 CSS-first, tokenlar `src/index.css` dagi `@theme` da.
- ❌ Rangni qo'lda yozmang (`#fff`, `bg-zinc-800`) — token ishlating (`bg-background`, `text-foreground`, `border-border`), aks holda dark rejim buziladi.
- ❌ Backendga endpoint qo'shishni taklif qilmang — bu repo faqat frontend. Yetishmayotgan narsani frontendda hisoblang va `docs/BACKLOG.md` da qayd qiling.
- ❌ `role` ni tahrirlash UI'si yasamang — backend DTO'sida bunday maydon yo'q (`../e-commerse/src/api/users/dto/update-user.dto.ts` da tasdiqlangan).
- ❌ Adminkaga to'lov qilish tugmasi qo'ymang — `POST /api/payments` faqat **o'z** buyurtmasi uchun ishlaydi, admin boshqa foydalanuvchi nomidan to'lay olmaydi (404 keladi). Faqat statusni ko'rsating.
- ❌ Xom backend xatosini foydalanuvchiga ko'rsatmang — mavjud bo'lmagan `category_id` bilan `POST /api/products` 500 qaytaradi va `message` ichida Prisma'ning server fayl yo'llari keladi.
