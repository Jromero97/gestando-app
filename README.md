# GestandoApp

Una app para acompañar el embarazo semana a semana: seguimiento de edad
gestacional, agenda médica (citas y exámenes), diario con fotos y notas de
audio, registro de peso/progreso, y recordatorios push de las próximas citas.

Monorepo con tres apps (npm workspaces): API, landing page y app mobile.

## Estructura

```
apps/
  api/     NestJS + Prisma — backend REST
  web/     Next.js — landing page pública (waitlist, política de privacidad)
  mobile/  Expo / React Native — la app
```

### `apps/api`

- **NestJS 11** + **Prisma 7** (driver adapter `@prisma/adapter-pg`, sin motor
  Rust) sobre PostgreSQL.
- Auth por JWT (`@nestjs/jwt` + Passport), rate limiting global
  (`@nestjs/throttler`), headers de seguridad (`helmet`).
- Filtro global de excepciones (`src/common/filters/all-exceptions.filter.ts`)
  que normaliza cualquier error a `{ statusCode, message }` con un mensaje
  legible para mostrar directo en el cliente.
- Almacenamiento de archivos (fotos, audio) vía Supabase Storage.
- Recordatorios push: cron (`@nestjs/schedule`) que revisa citas y exámenes
  próximos y envía notificaciones vía Expo Push Service (`expo-server-sdk`),
  con Firebase Cloud Messaging V1 del lado de Android y APNs del lado de iOS.
- Cumplimiento: política de privacidad con consentimiento explícito en el
  registro, endpoint de borrado de cuenta (derecho al olvido, purga también
  los archivos en Supabase).

### `apps/web`

- **Next.js 16** (Turbopack) + **next-intl** (español por defecto, inglés en
  `/en`).
- Landing page de espera (waitlist) con capturas reales de la app mobile
  dentro de un marco de iPhone, y la política de privacidad.

### `apps/mobile`

- **Expo SDK 57** / React Native, `expo-router`, **NativeWind** (Tailwind)
  para estilos, **Zustand** para estado, **react-i18next** (español/inglés).
- Notificaciones push (`expo-notifications`) para recordatorios de citas y
  exámenes.
- Accesible (auditado y corregido contra WCAG 2.1 AA: contraste, labels de
  accesibilidad, tamaños mínimos de touch target).

## Desarrollo local

Cada app tiene su propio `.env.example` — copiarlo a `.env` (`.env.local` en
el caso de la web) y completar los valores antes de arrancar.

```bash
# API (necesita Postgres corriendo y las migraciones aplicadas)
cd apps/api
npm run prisma:migrate
npm run start:dev          # http://localhost:3000/api

# Web
cd apps/web
npm run dev                 # http://localhost:3000 (ajustar puerto si el API ya lo usa)

# Mobile
cd apps/mobile
npm start                   # abre Expo Dev Tools / Metro
npm run ios                 # build nativo + simulador iOS
npm run android              # build nativo + emulador Android
```

La app mobile usa módulos nativos (`expo-notifications`, `expo-device`,
`expo-constants`, etc.), así que cualquier cambio en `app.json` → `plugins`
requiere volver a correr `expo prebuild` y reinstalar el dev client — un
simple reload de Metro no alcanza.

## Testing

```bash
cd apps/api && npm test     # Jest, cobertura de servicios/DTOs/filtros
```

## Deploy

`apps/api` y `apps/web` tienen `Dockerfile` propio, pensados para desplegar
en cualquier plataforma que reciba una imagen Docker (Coolify, Dokploy,
etc.). La app mobile se distribuye vía EAS Build hacia las tiendas de
iOS/Android — necesita cuenta paga de Apple Developer Program para push en
iOS (Android no tiene esa restricción, solo un proyecto de Firebase propio).
