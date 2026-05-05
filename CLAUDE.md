# Ofis Uygulaması — CLAUDE.md

Hukuk ofisleri için tasarlanmış kurumsal workflow ve ekip yönetimi platformu. Next.js 14 App Router üzerine inşa edilmiştir.

## Uygulama Amacı

Hukuk bürolarının dijital ofis altyapısını yönetmesini sağlar. Bir kullanıcı kendi ofisini kaydeder, departmanlar oluşturur, avukat ve personelini davet eder, rol ve süpervizörlük atar.

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Dil | TypeScript (strict) |
| Auth & DB | Supabase |
| UI Bileşenleri | shadcn/ui (Default style, Neutral renk) |
| CSS | Tailwind CSS v4 |
| Font | Geist (Google Fonts) |
| E-posta | Resend (davet ve bildirim mailleri) |
| Form | react-hook-form + zod + @hookform/resolvers |

---

## Dizin Yapısı

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx    # react-hook-form + zod
│   │   └── register/page.tsx # react-hook-form + zod
│   ├── (dashboard)/          # Ana uygulama — sidebar + header var
│   ├── layout.tsx            # Root layout (TooltipProvider, Toaster)
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn bileşenleri — doğrudan düzenleme yapma
│   │   └── form.tsx          # shadcn Form (react-hook-form wrapper)
│   ├── layout/               # AppSidebar, Header
│   └── shared/               # Uygulamaya özel paylaşımlı bileşenler
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Tarayıcı tarafı — createBrowserClient<Database>
│   │   └── server.ts         # Server Components ve Route Handlers — createServerClient<Database>
│   ├── auth-errors.ts        # Supabase hata mesajlarını Türkçe'ye çevirir
│   ├── resend.ts             # Resend e-posta istemcisi (henüz eklenmedi)
│   └── utils.ts              # cn() helper
├── types/
│   ├── database.types.ts     # Supabase'den üretilen ham tipler (generate_typescript_types)
│   └── index.ts              # Uygulama tipleri — any yasak, DB tiplerinden türetilir
└── middleware.ts             # Auth yönlendirme
```

---

## Temel Kurallar

### TypeScript
- `any` tipi **kesinlikle yasaktır** — her değişken, parametre ve dönüş tipi açıkça tanımlanmalıdır.
- `unknown` kullanılabilir; ancak type guard ile daraltılmalıdır.
- Tüm Supabase sorgu sonuçları için tip tanımları `src/types/index.ts`'de tutulur.

### Form Geliştirme
- Tüm formlarda `react-hook-form` + `zod` + `@hookform/resolvers/zod` kullanılır.
- shadcn `<Form>` bileşeni (`src/components/ui/form.tsx`) zorunludur — ham `<form>` + `useState` kullanılmaz.
- Şema tanımı: `z.object({...})` → `z.infer<typeof schema>` ile tip türetme.
- Supabase/sunucu hataları `src/lib/auth-errors.ts` üzerinden Türkçe'ye çevrilir; her zaman kullanıcı dostu mesaj gösterilir.
- Form submit durumu `form.formState.isSubmitting` ile yönetilir — ayrı `loading` state'i açılmaz.

### Server vs Client Components
- Veri çekme → Server Component (`src/lib/supabase/server.ts`)
- Kullanıcı etkileşimi, state, event → Client Component (`'use client'` + `src/lib/supabase/client.ts`)
- Middleware session yenilemeyi otomatik halleder

### Supabase Kullanımı
```typescript
// Server Component / Route Handler
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Ortam Değişkenleri
```
NEXT_PUBLIC_SUPABASE_URL      → Supabase proje URL'si
NEXT_PUBLIC_SUPABASE_ANON_KEY → Supabase anon key
SUPABASE_SERVICE_ROLE_KEY     → Sadece server-side (asla client'a sızdırma)
RESEND_API_KEY                → Resend API anahtarı (sadece server-side)
NEXT_PUBLIC_APP_URL           → Uygulama base URL'si (davet linkleri için)
```

---

## Supabase MCP

Proje `.claude/settings.json` içinde MCP sunucusu tanımlıdır ve **aktif** — Claude doğrudan tablo sorgulayabilir, migration uygulayabilir, TypeScript tiplerini yenileyebilir.

Tipler güncellendiğinde: `mcp__supabase__generate_typescript_types` → çıktıyı `src/types/database.types.ts`'e yapıştır.

---

## Mimari: Ofis & Organizasyon Yapısı

### Temel Kavramlar

| Kavram | Açıklama |
|--------|----------|
| **Office** | Hukuk bürosu — en üst organizasyon birimi. |
| **Department** | Ofis içindeki alt birim (örn. "Ceza Hukuku", "İdare Hukuku"). |
| **OfficeMember** | Bir kullanıcının bir ofise üyeliği. Rol bilgisi burada tutulur. |
| **DepartmentMember** | Bir kullanıcının bir departmana atanması. |
| **Invitation** | Uygulamada hesabı olmayan kişilere gönderilen token'lı davet kaydı. |

### Rol Hiyerarşisi

```
admin       → Ofisi kuran ve yöneten kişi. Tüm yetkiler: departman yönetimi,
              üye davet/çıkarma, rol atama, ofis ayarları.
supervisor  → Belirli üyelerin veya departmanların süpervizörü.
              Atandığı kapsamda üyelerin görev ve süreçlerini takip edebilir.
member      → Standart ofis üyesi.
```

```typescript
// src/types/index.ts
export type OfficeRole = 'admin' | 'supervisor' | 'member'
```

- `supervisor` rolü hem `office_members.role` alanında tutulur hem de `is_supervisor` boolean'ı ile daha granüler atama yapılabilir.
- Bir kullanıcı birden fazla departmanda olabilir.
- `guest` rolü şimdilik kapsam dışıdır.

### Davet Akışı

1. `admin`, e-posta adresi girerek davet oluşturur ve departman seçer.
2. Sistem, `invitations` tablosuna token'lı kayıt oluşturur.
3. **Resend** üzerinden davete özel link içeren mail gönderilir.
4. Davetli link'e tıklar → `/invite/[token]` sayfası açılır.
5. Uygulamada hesabı yoksa kayıt formu gösterilir; varsa direkt giriş.
6. Kayıt/giriş tamamlandıktan sonra `OfficeMember` ve `DepartmentMember` kayıtları otomatik oluşturulur, token `accepted` durumuna geçer.

### Veritabanı Tabloları (Aktif — Supabase'de mevcut)

```sql
profiles           -- id (= auth.users.id), full_name, avatar_url, updated_at
offices            -- id, name, slug, owner_id, created_at
departments        -- id, office_id, name, created_at
office_members     -- id, office_id, user_id, role (admin|supervisor|member),
                   --   is_supervisor, joined_at
department_members -- id, department_id, user_id, joined_at
invitations        -- id, office_id, department_id, email, token, role,
                   --   invited_by, status (pending|accepted|expired),
                   --   expires_at, created_at
```

RLS tüm tablolarda aktif. Yardımcı DB fonksiyonları: `is_office_member(uuid)`, `is_office_admin(uuid)`.
Yeni kullanıcı kaydında `handle_new_user()` trigger'ı otomatik `profiles` satırı oluşturur.

---

## Tasarım Rehberi

- **Renk paleti:** Neutral (shadcn Default theme) — kurumsal, temiz
- **Tipografi:** Geist Sans, hiyerarşi için font-weight kullan
- **Spacing:** 4px grid (Tailwind spacing scale)
- **Border radius:** rounded-md varsayılan (shadcn defaults)
- **İkon seti:** lucide-react
- **Tema:** Şimdilik sadece light mode; dark mode sonraki aşamada

---

## Mevcut Durum

### Tamamlananlar
- [x] Next.js 14 projesi kuruldu (TypeScript strict, Tailwind v4, shadcn/ui)
- [x] Supabase client/server/middleware hazır — `Database` generic'iyle tam tip güvenli
- [x] Temel dizin yapısı: `(auth)/login`, `(auth)/register`, `(dashboard)/` layout
- [x] shadcn `Form` bileşeni eklendi (`form.tsx`)
- [x] Auth sayfaları react-hook-form + zod ile yeniden yazıldı
- [x] Supabase hata mesajları Türkçe'ye çeviren `src/lib/auth-errors.ts` eklendi
- [x] `.env.local` Supabase credentials'ları güncellendi (gerçek değerler)
- [x] Veritabanı tabloları oluşturuldu: `profiles`, `offices`, `departments`, `office_members`, `department_members`, `invitations`
- [x] RLS politikaları ve yardımcı fonksiyonlar (`is_office_member`, `is_office_admin`) aktif
- [x] Yeni kullanıcı kaydında otomatik `profiles` kaydı oluşturan trigger
- [x] `src/types/database.types.ts` — Supabase'den üretilen kaynak tipler
- [x] `src/types/index.ts` — uygulama tipleri (`OfficeRole`, join tipleri, validation tipi — `any` yok)

### Bekleyen — Faz 1: Ofis & Organizasyon Altyapısı
- [ ] Ofis kayıt akışı (onboarding)
- [ ] Departman oluşturma ve yönetimi
- [ ] Resend entegrasyonu (`src/lib/resend.ts`)
- [ ] Üye daveti (mail ile, hesabı olmayanlar dahil)
- [ ] Davet token akışı (`/invite/[token]`)
- [ ] Üye departman ataması
- [ ] Süpervizör atama

### Bekleyen — Faz 2: Görev & Proje Yönetimi
- [ ] Görev yönetimi (Kanban + Liste görünümü)
- [ ] Proje yönetimi

### Bekleyen — Faz 3: İletişim & Takvim
- [ ] Mesajlaşma
- [ ] Takvim
- [ ] Bildirimler

---

## Geliştirme

```bash
npm run dev    # localhost:3000
npm run build  # Production build
npm run lint   # ESLint
```
