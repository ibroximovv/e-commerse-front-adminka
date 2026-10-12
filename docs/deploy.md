# Serverga joylashtirish — `admin.ocomarket.uz`

Adminka — **statik SPA**. Node server kerak emas, PM2 ham kerak emas: `npm run build`
natijasidagi `dist/` papkani nginx to'g'ridan-to'g'ri beradi.

Backend allaqachon `api.ocomarket.uz` da (`/var/www/e-commerse-back`, PM2). Bu hujjat
o'sha serverda ikkinchi sub-domen ochish tartibini tavsiflaydi.

| Nima | Qiymat |
|---|---|
| Domen | `admin.ocomarket.uz` |
| Repo | `/var/www/e-commerse-front-adminka` |
| Nginx `root` | `/var/www/e-commerse-front-adminka/dist` |
| Nginx konfigi | `/etc/nginx/sites-available/admin.ocomarket.uz.conf` |
| API manzili | `https://api.ocomarket.uz` |

> **PM2 kerak emas.** Adminka — statik fayllar to'plami, ishlab turadigan jarayon
> emas: kod foydalanuvchining brauzerida bajariladi, nginx esa `dist/` ni shunchaki
> diskdan o'qiydi. `pm2 start dist/index.html` Node'ga `.html` ni import qildirishga
> urinadi va `ERR_UNKNOWN_FILE_EXTENSION` bilan yiqiladi. PM2 faqat backend uchun.

---

## 0. Oldindan tayyorgarlik

**DNS.** `admin.ocomarket.uz` uchun **A** yozuvi server IP siga qarasin.
Certbot HTTP-01 tekshiruvidan foydalanadi — DNS tarqalmaguncha sertifikat olinmaydi.

```bash
dig +short admin.ocomarket.uz     # server IP sini qaytarishi kerak
```

**Portlar.** 80 va 443 ochiq bo'lsin (`sudo ufw status`).

---

## 1. ⚠️ `VITE_API_URL` — eng ko'p yiqiladigan joy

Vite env qiymatlarini **build paytida** kodga singdiradi. Ya'ni noto'g'ri qiymat bilan
yig'ilgan `dist/` ni keyin tuzatib bo'lmaydi — qayta build qilish kerak.

Repodagi `.env` da `http://localhost:3000` turadi. U bilan yig'sangiz:

- brauzer `localhost:3000` ga so'rov yuboradi (foydalanuvchining o'z kompyuteriga),
- HTTPS sahifadan HTTP ga so'rov **mixed content** sifatida bloklanadi,
- ekranda hech qanday ma'lumot chiqmaydi, konsolda esa tarmoq xatosi.

Build qilinadigan mashinada `.env.production` yarating (u `.gitignore` da,
`.env` ni ustidan yozmang):

```bash
echo 'VITE_API_URL=https://api.ocomarket.uz' > .env.production
```

`npm run build` `production` rejimda ishlaydi va aynan shu faylni o'qiydi.

---

## 2. Build

Serverda Node bor (backend shunda ishlaydi), ya'ni qo'shimcha narsa kerak emas.

```bash
git clone <repo-url> /var/www/e-commerse-front-adminka
cd /var/www/e-commerse-front-adminka

echo 'VITE_API_URL=https://api.ocomarket.uz' > .env.production
npm ci
npm run build          # tsc -b + vite build -> dist/
ls -la dist/index.html # mavjudligiga ishonch hosil qiling
```

> ⚠️ Serverda `NODE_ENV=production` eksport qilingan bo'lsa `npm ci` dev paketlarni
> o'tkazib yuboradi va build `vite: not found` bilan yiqiladi (`vite`, `typescript` —
> devDependencies). Bunday holda: `npm ci --include=dev`.

`dist/` `.gitignore` da — `git pull` uni olib kelmaydi, har safar serverda yig'iladi.

---

## 3. Ruxsatlar

Nginx `www-data` nomidan o'qiydi. Papkalar `755` (`drwxr-xr-x`) bo'lsa yetarli —
`git clone` odatda shunday qoldiradi. Tekshirish:

```bash
sudo -u www-data stat /var/www/e-commerse-front-adminka/dist/index.html >/dev/null \
  && echo "OK" || echo "RUXSAT MUAMMOSI"
```

Muammo chiqsa: `sudo chmod o+rx /var/www/e-commerse-front-adminka{,/dist}`

---

## 4. Nginx

Konfig namunasi repoda: [`nginx.conf.example`](../nginx.conf.example).

```bash
sudo cp /var/www/e-commerse-front-adminka/nginx.conf.example \
        /etc/nginx/sites-available/admin.ocomarket.uz.conf

sudo ln -s /etc/nginx/sites-available/admin.ocomarket.uz.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Tekshirish (sertifikatdan oldin, HTTP orqali):

```bash
curl -I http://admin.ocomarket.uz          # 200 va text/html
```

Konfigdagi ikki muhim nuqta:

- `try_files $uri $uri/ /index.html` — busiz `/products` sahifasini **yangilaganda**
  nginx 404 qaytaradi (bu yo'l diskda fayl emas, React Router marshruti).
- `index.html` ga `no-cache` — busiz foydalanuvchi deploydan keyin ham eski
  `index.html` ni ochib, endi mavjud bo'lmagan asset nomlariga 404 oladi va
  ekran oq qoladi.

---

## 5. SSL — certbot

```bash
sudo certbot --nginx -d admin.ocomarket.uz
```

Certbot:

1. `/.well-known/acme-challenge/` orqali domenni tekshiradi (konfigda shu blok bor),
2. `443` server blokini va sertifikat yo'llarini **o'sha faylga o'zi qo'shadi**,
3. `80` dan `443` ga yo'naltirishni qo'shadi (so'raganda "Redirect" ni tanlang).

Avtomatik yangilanishni tekshirish:

```bash
sudo certbot renew --dry-run
systemctl list-timers | grep certbot
```

---

## 6. Yakuniy tekshiruv

```bash
curl -I https://admin.ocomarket.uz                 # 200, HTTP/2
curl -I https://admin.ocomarket.uz/orders          # 200 (SPA fallback ishlayapti)
curl -s https://admin.ocomarket.uz | grep -o 'assets/[^"]*\.js' | head -1
```

Brauzerda:

- Login sahifasi ochilsin,
- DevTools → Network: so'rovlar **`https://api.ocomarket.uz/api/...`** ga ketsin
  (agar `localhost:3000` ko'rinsa — 1-bo'limga qayting va qayta build qiling),
- tizimga kiring, dark/light rejimni almashtirib ko'ring.

> CORS: backendda `app.enableCors()` hamma origin uchun ochiq, shuning uchun
> `admin.ocomarket.uz` dan `api.ocomarket.uz` ga so'rov qo'shimcha sozlashsiz ishlaydi.
> Kelajakda CORS ni toraytirsangiz, ro'yxatga shu domenni qo'shishni unutmang.

---

## 7. Yangilash (keyingi deploylar)

```bash
cd /var/www/e-commerse-front-adminka
git pull
npm ci                 # package-lock o'zgargan bo'lsa
npm run build
```

Tamom — nginx to'g'ridan-to'g'ri `dist/` ni o'qiydi, nusxa ko'chirish kerak emas.
Nginx'ni qayta yuklash ham **shart emas**. Konfig o'zgarganda esa:
`sudo nginx -t && sudo systemctl reload nginx`.

> `vite build` `dist/` ni har safar tozalab qayta yozadi, ya'ni eski hash'li
> assetlar to'planib qolmaydi. Build davomida bir necha soniya sahifa
> yangilansa 404 chiqishi mumkin — adminka uchun bu muammo emas.

---

## 8. Muammolarni topish

| Belgi | Sabab |
|---|---|
| Hamma yo'lda 404, lekin javobda bizning sarlavhalar bor | Konfig ishlayapti, fayl yo'q: `root` noto'g'ri joyga qarayapti yoki `npm run build` qilinmagan. Error logda aniq yo'l yozilgan bo'ladi |
| `ERR_UNKNOWN_FILE_EXTENSION ".html"` | Adminka PM2 ga qo'shilgan — u statik sayt, jarayon kerak emas: `pm2 delete e-commerse-front && pm2 save` |
| Sahifa oq, konsolda asset'ga 404 | Brauzer eski `index.html` ni keshdan olgan — `no-cache` sarlavhasini tekshiring |
| `/orders` ni yangilaganda 404 | `try_files ... /index.html` yo'q |
| Konsolda "Mixed Content" yoki `localhost:3000` | `.env.production` siz build qilingan |
| Konsolda CORS xatosi | Backend CORS ro'yxati toraytirilgan — domen qo'shing |
| Login 401 `Forbidden resource` | Hisob roli `ADMIN` emas |
| certbot "Timeout during connect" | DNS hali server IP siga qaramayapti yoki 80-port yopiq |
| 403 Forbidden | `/var/www/admin.ocomarket.uz` ni `www-data` o'qiy olmayapti (`chown`) |

Loglar:

```bash
sudo tail -f /var/log/nginx/admin.ocomarket.uz.error.log
sudo tail -f /var/log/nginx/admin.ocomarket.uz.access.log
```
