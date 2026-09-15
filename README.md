# Mohamed Rashed Portfolio Platform

Production-focused portfolio platform for Mohamed Rashed Abdelazim, a Full-Stack .NET Engineer and AI Evaluation Specialist. The site combines a bilingual React experience, interactive project and architecture showcases, an admin dashboard, persistent profile media, and a clean ASP.NET Core backend.

Live demo: https://developer-portfolio-8ll0.bolt.host/

## Highlights

- React, TypeScript, Vite, Tailwind CSS, Framer Motion, and responsive bilingual UI.
- ASP.NET Core 8 Web API with JWT admin authentication and Clean Architecture.
- Project showcase, API playground, schema viewer, AI evaluation lab, inquiries, and admin tools.
- WebP/AVIF image variants, LCP-aware loading, stable cache-busting, and versioned OG metadata.
- Cloudinary-backed profile image uploads with database metadata and authenticated replacement/deletion.
- GitHub Actions CI, Vercel Analytics, and opt-in Sentry error tracking.

## Architecture

The backend follows Clean Architecture boundaries:

```text
Backend/
   Domain/          Entities and business concepts
   Application/     DTOs and application contracts
   Infrastructure/  EF Core persistence, services, and integrations
   WebApi/          Controllers, JWT, middleware, static/API delivery
```

The frontend is organized by responsibility:

```text
src/
   components/     Reusable UI and image components
   pages/          Route-level views
   context/        Theme, language, data, and profile media state
   hooks/          Data-fetching and workflow hooks
   services/       API and browser-storage boundaries
   data/           Seed content for local/demo workflows
   utils/          Image URLs, downloads, and shared helpers
```

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Lucide React, Vitest, React Testing Library.

**Backend:** ASP.NET Core 8, C#, Entity Framework Core, PostgreSQL via Npgsql for production, SQLite for local development/tests, JWT Bearer authentication, rate limiting, Swagger, CloudinaryDotNet.

**Delivery and operations:** Vercel static deployment, Cloudinary media storage, GitHub Actions, Vercel Analytics, Sentry.

## Local Setup

### Frontend

Prerequisites: Node.js 20 or newer and npm.

```bash
npm ci
npm run generate:images
npm run dev
```

The frontend reads these variables when needed:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SITE_URL=http://localhost:3000
VITE_SENTRY_DSN=
```

`npm run build` regenerates the local OG image and injects an automatic content hash into the OG/Twitter image URL. Run `npm run generate:images` after adding PNG/JPG/JPEG assets.

### Backend

Prerequisites: .NET 8 SDK.

Set configuration through environment variables or user secrets. Never commit secrets:

```env
ConnectionStrings__DefaultConnection=Host=ep-example.eu-central-1.aws.neon.tech;Port=5432;Database=portfolio;Username=portfolio_owner;Password=<NEON_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true;Pooling=true;Maximum Pool Size=10
Database__Provider=Postgres
Jwt__Secret=replace-with-a-random-secret-at-least-32-characters
Jwt__Issuer=Portfolio.WebApi
Jwt__Audience=Portfolio.Client
Admin__Email=admin@example.com
Admin__Password=replace-with-a-strong-password
Cors__Frontend=https://your-production-domain.example

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Cloudinary variables are required for durable production profile uploads. When they are absent, local development falls back to `Backend/WebApi/wwwroot/uploads`; that filesystem is not durable on serverless hosting. Use `Database__Provider=Sqlite` and `Data Source=portfolio.db` only for local development.

Run the API:

```bash
dotnet restore Backend/WebApi/WebApi.csproj
dotnet run --project Backend/WebApi/WebApi.csproj
```

The database initializer applies migrations at startup. The profile media endpoints are:

- `GET /api/v1/profile-image` for public media metadata.
- `POST /api/v1/profile-image` for an authenticated admin upload.
- `DELETE /api/v1/profile-image` for an authenticated admin reset.

## Testing and Quality

```bash
npm run lint
npm test
npm run build

dotnet build Backend/WebApi/WebApi.csproj
dotnet test Backend.Tests/Backend.Tests.csproj
```

The current lint output has legacy warnings for Fast Refresh exports and two `autoFocus` usages, but no errors. Frontend and backend tests run in CI.

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request targeting `main`:

- Frontend: `npm ci`, lint, tests, and production build.
- Backend: restore, Release build, and tests.

For protected `main`, enable branch protection in GitHub and require the `Frontend` and `Backend` status checks before merging. Also require pull requests, dismiss stale approvals when new commits are pushed, and prevent force pushes.

## Deployment Notes

Set these Vercel environment variables for production builds:

```env
VITE_SITE_URL=https://your-production-domain.example
VITE_API_BASE_URL=https://your-api-domain.example/api/v1
VITE_SENTRY_DSN=https://...@sentry.io/...
```

Set the backend secrets in the backend host's secret manager, including the three Cloudinary variables. Do not use Vercel's writable filesystem as permanent media storage. Cloudinary makes uploaded profile images available immediately without a frontend redeploy, while the database stores the current URL, content version, and Cloudinary public ID.
