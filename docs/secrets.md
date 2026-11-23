# กฎการจัดการ Secret และความปลอดภัยของ Request

อ่านก่อนเริ่มพัฒนา และใช้เป็น checklist ตอนเปิด PR

## หลักการ 4 ข้อ

1. **เบราว์เซอร์เป็นของผู้ใช้ ซ่อน secret ใน FE ไม่ได้** ค่า `VITE_*` ถูกฝังลง JS ตอน build เปิด DevTools → Sources → Ctrl+F ก็เจอ การ obfuscate, encode, โหลด key ตอน runtime หรือเซ็น signature ด้วย secret ที่เก็บใน FE ก็ไม่ช่วย เพราะ secret นั้นอยู่ในไฟล์ที่ผู้ใช้ดาวน์โหลดไปทั้งหมด
2. **secret อยู่ฝั่ง API เท่านั้น** (Key Vault / env var / user-secrets)
3. **สมมติว่าใครก็ยิง API ได้** (Postman, curl, สคริปต์) ทุก endpoint ต้องปลอดภัยด้วยตัวมันเอง
4. **ไม่เชื่อค่าที่ client ส่งมา** API ตรวจและคำนวณจากข้อมูลฝั่งเซิร์ฟเวอร์เสมอ

## กฎสำหรับ FE

### ใส่ใน `VITE_*` ได้เฉพาะค่า public

| ใส่ได้                                                                     | ห้ามใส่                             |
| -------------------------------------------------------------------------- | ----------------------------------- |
| API base URL                                                               | app secret, app token               |
| LIFF ID                                                                    | LINE channel access token           |
| ชื่อ environment, feature flag                                             | JWT signing secret                  |
| key แบบ publishable ที่ล็อกกับโดเมนแล้ว (เช่น map key, Turnstile site key) | connection string, ค่าจาก Key Vault |
|                                                                            | secret key ของบริการภายนอกทุกชนิด   |
|                                                                            | shared secret สำหรับเซ็น signature  |

ถ้าไม่แน่ใจว่าค่านั้น public ได้ไหม ให้ถือว่า **ไม่ได้** แล้วย้ายไปไว้ที่ API

### การเพิ่มตัวแปร `VITE_*`

1. ประกาศชื่อใน `ImportMetaEnv` ของ `env.d.ts`
2. เพิ่มใน `.env.example` โดยไม่ใส่ค่าจริง
3. ถามตอน review: "ถ้าค่านี้ถูกเปิดเผยต่อสาธารณะ จะเกิดอะไรขึ้น" ถ้ามีผลเสีย ห้ามใช้ `VITE_*`

ตัวแปรที่ใช้เฉพาะ `vite.config.ts` (เช่น ปลายทางของ dev proxy) ให้ตั้งชื่อ **ไม่ขึ้นต้นด้วย `VITE_`** อย่างไรก็ตาม ชื่อที่ไม่มี `VITE_` แค่กันการรั่วโดยไม่ตั้งใจ ถ้าโค้ดในหน้าเว็บต้องใช้ค่านั้นจริง ค่านั้นก็ยังถึงผู้ใช้อยู่ดี

### ห้ามทำ

- ตั้ง `envPrefix: ''` ใน `vite.config.ts`
- ใช้ `define` ส่งค่าจาก `loadEnv` หรือ `process.env` เข้า client
- เขียน key, token, password หรือ URL ที่มี credential ตรง ๆ ในโค้ด, comment, ไฟล์ docs หรือ test
- commit ไฟล์ `.env`, `.env.*` (ยกเว้น `.env.example`)
- ใส่ token ใน URL หรือ query string
- `console.log` ค่า token, response ที่มีข้อมูลส่วนบุคคล (build ของ template ไม่ได้ drop `console` ให้ ต้องไม่ log ค่าเหล่านี้เอง)
- ใช้ `v-html` กับข้อมูลที่ผู้ใช้ควบคุมได้โดยไม่ sanitize (ช่องทางหลักของ XSS ที่ขโมย token)

### บริการภายนอกที่ต้องใช้ secret ให้เรียกผ่าน API

```
เบราว์เซอร์ → endpoint ของ API ของโปรเจค → บริการภายนอก (แนบ secret ที่ฝั่งเซิร์ฟเวอร์)
```

## กฎสำหรับ API

1. secret ทุกตัวมาจาก Key Vault, env var หรือ `dotnet user-secrets` ห้ามอยู่ใน `appsettings.json` ที่ commit
2. ห้าม commit `appsettings.*.json` (ยกเว้น `appsettings.json`) ห้ามเก็บค่าจริงในโฟลเดอร์ที่ซิงก์ cloud ถ้าเลี่ยงได้ ให้ใช้ user-secrets
3. CORS ระบุ origin ของ FE ผ่าน `Cors:AllowedOrigins` เท่านั้น ห้ามใช้ `AllowAnyOrigin`
4. ห้ามปิดการตรวจ TLS certificate นอก Development
5. ทุก endpoint ที่คืนหรือแก้ข้อมูลผู้ใช้ต้องมี `[ApiAuthorize]` และตรวจสิทธิ์ (ผู้ใช้คนนี้ทำสิ่งนี้กับข้อมูลนี้ได้ไหม)
6. ดึง user id จาก claim ใน token เท่านั้น ห้ามใช้ id ที่ client ส่งมาเป็นตัวระบุเจ้าของข้อมูล
7. ราคา แต้ม สิทธิ์ ยอดรวม คำนวณและตรวจที่ API เสมอ
8. ห้าม log token, secret, header `Authorization` หรือ body ที่มีข้อมูลส่วนบุคคล
9. error response ห้ามมี stack trace, connection string หรือรายละเอียดภายใน
10. endpoint ที่เสี่ยง (แลกสิทธิ์, สมัคร, ส่ง OTP) ต้องมี rate limit (`BCRM_Throttle`) และพิจารณา Turnstile/reCAPTCHA

## การยืนยันตัวตนและ token

1. ล็อกอินผ่าน LIFF ได้ LINE ID token
2. FE ส่ง ID token ให้ API API ส่งไปตรวจกับ LINE (verify endpoint) ตรวจ `aud` ตรงกับ channel ของเรา และยังไม่หมดอายุ
3. API ออก JWT ของเราเอง **อายุสั้น (5–15 นาที)** พร้อม refresh token แบบหมุนเวียน (ใช้แล้วออกใหม่ ถ้าเจอการใช้ซ้ำให้ยกเลิกทั้งชุด)
4. FE เก็บ JWT ใน memory (Pinia) หรือ HttpOnly + Secure + SameSite cookie เลี่ยง `localStorage` ถ้าใช้ cookie ต้องกัน CSRF
5. API เพิกถอน session ได้ (เก็บ session ฝั่งเซิร์ฟเวอร์ หรือ denylist ด้วย `jti`)

### เรื่อง "ยืนยันว่า request มาจาก FE ของเรา"

ทำไม่ได้แบบรับประกันด้วย secret เพราะ client ตัวไหนก็ทำซ้ำ logic ของ FE ได้ และ token ที่ถือไว้ใช้จาก Postman ได้เสมอ ให้ใช้ชั้นป้องกันตามลำดับนี้แทน

1. พิสูจน์ตัวตนผ่าน LINE จริง (ข้อ 2 ด้านบน) แล้วผูกทุก request กับผู้ใช้
2. ตรวจสิทธิ์และข้อมูลทุกอย่างที่ API
3. rate limit รายผู้ใช้/IP และตรวจพฤติกรรมผิดปกติ
4. Turnstile/reCAPTCHA เฉพาะ endpoint ที่มีมูลค่า (secret key ตรวจที่ API)
5. ตรวจ `Origin` เป็นชั้นเสริม (ปลอมได้นอกเบราว์เซอร์)
6. ถ้ายังไม่พอ: เซ็น request ด้วย session key รายผู้ใช้ที่ API ออกให้ (HMAC ของ method + path + body + timestamp + nonce, API ตรวจเวลา ±1–2 นาที และจำ nonce) ถือเป็น speed bump ไม่ใช่หลักประกัน และห้ามใช้ shared secret ตัวเดียวฝังใน FE

## Checklist ตอนเปิด PR

- [ ] ไม่มี key, token, password หรือ URL ที่มี credential ในโค้ด, docs, test, screenshot
- [ ] ตัวแปร `VITE_*` ใหม่ทุกตัวประกาศใน `env.d.ts` และ `.env.example` และเป็นค่า public จริง
- [ ] ไม่มีการแตะ `envPrefix` หรือ `define` ที่ส่ง env เข้า client
- [ ] การเรียกบริการที่ต้องใช้ secret ผ่าน API ไม่ได้เรียกจาก FE ตรง ๆ
- [ ] endpoint ใหม่มี `[ApiAuthorize]`, ตรวจสิทธิ์, ดึง user id จาก token, และมี rate limit ถ้าเสี่ยง
- [ ] ไม่ log token หรือข้อมูลส่วนบุคคล
- [ ] `git ls-files | grep -E "appsettings|\.env"` เห็นแค่ `appsettings.json` และ `.env.example`
- [ ] รัน `gitleaks detect` ผ่าน (ถ้าติดตั้งแล้ว)

## ตรวจก่อน release

```bash
yarn build:prod
grep -rEi "secret|token|apikey|password" dist/
```

ผลที่เจอต้องเป็นชื่อตัวแปรหรือข้อความทั่วไปเท่านั้น ไม่มีค่า secret จริง แล้วลองเปิดแอปที่ build แล้ว → DevTools → Sources → Ctrl+F ค้นชื่อ secret ที่รู้จัก ต้องไม่พบ

## ถ้า secret หลุด

1. **Rotate ทันที** (สร้างค่าใหม่ใน Key Vault/ระบบต้นทาง แล้วยกเลิกค่าเก่า) การลบออกจาก git ไม่พอ เพราะค่าอยู่ใน history และอาจถูกคัดลอกไปแล้ว
2. แจ้งผู้ดูแลระบบและทีม
3. ตรวจ log ว่ามีการใช้ค่าเก่าผิดปกติหรือไม่
4. ถ้ากระทบ token ผู้ใช้ ให้เพิกถอน session ทั้งหมดและบังคับล็อกอินใหม่
5. หาสาเหตุและเพิ่มกฎหรือ check ที่กันไม่ให้เกิดซ้ำ
