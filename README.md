# Full-Stack Engineering Portfolio & Enterprise Architecture Showcase

A production-grade, full-stack portfolio and technical showcase engineered with **ASP.NET Core 8 Web API** and **React 18 + TypeScript**. Built to demonstrate real-world enterprise software engineering practices: Clean Architecture, Entity Framework Core persistence, JWT authentication, fixed-window rate limiting, and an interactive, read-only API Playground with real production endpoints.

---

## 🌐 Live Demonstrations

* **Frontend Client:** Live Demo: See the repository deployment configuration / project profile
* **Production API Service:** Hosted on RunASP Cloud Platform (`https://mohamedrashedportofolio.runasp.net`)
* **Interactive API Documentation:** Integrated Swagger UI available at `/swagger` on the backend host.

> **Security Notice:** All production secrets, database credentials, and signing keys are securely managed via environment variables and external secret stores. Never committed to source control.

---

## 🛠️ Engineering Highlights

* **Backend Engine:** ASP.NET Core 8 Web API following strict **Clean Architecture (Domain, Application, Infrastructure, WebApi)** boundaries.
* **Database & Persistence:** Entity Framework Core 8 with Microsoft SQL Server, Code-First migrations, automated seed initialization, and optimized query execution (`AsNoTracking`).
* **Authentication & Authorization:** JWT Bearer authentication with symmetric HMAC-SHA256 key validation (enforcing ≥ 32 characters), expiry clock-skew tolerance, and role-protected administrative endpoints.
* **Adaptive Rate Limiting:** Built-in .NET 8 Rate Limiting middleware with dual partitioned policies:
  * `public`: 30 requests per minute per client IP for public catalog and inquiries.
  * `admin`: 10 requests per minute per client IP for authentication and administrative endpoints.
* **Frontend Architecture:** React 18, TypeScript 5, Vite 5, Tailwind CSS, Framer Motion animations, and custom state contexts for bilingual (Arabic RTL / English LTR) layout and theming.
* **Dual-Mode API Playground:** Real-time HTTP exploration supporting both **Live Production API** (real HTTP dispatch with latency measurement) and **Simulated Sandbox** (deterministic schema inspection).
* **Secure Asset Management:** Serverless signature generation (`/api/cloudinary-sign`) verifying admin bearer tokens before authoring Cloudinary upload signatures.
* **Enterprise Testing:** Comprehensive unit tests covering validation rules, business logic, controller action results, and security middleware.

---

## 🏛️ System Architecture

The solution follows strict Clean Architecture dependency rules where inner layers have zero knowledge of outer layers:

```
┌─────────────────────────────────────────────────────────┐
│                 Presentation (WebApi)                   │
│   Controllers, Middlewares, Rate Limiting, Swagger      │
└───────────────────────────┬─────────────────────────────┘
                            │ depends on
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Application                        │
│   Use Cases, Service Interfaces, DTOs, Validation       │
└─────────────┬─────────────────────────────┬─────────────┘
              │                             ▲
   depends on │                  implements │
              ▼                             │
┌───────────────────────────┐  ┌────────────┴─────────────┐
│          Domain           │  │      Infrastructure      │
│  Entities, Value Objects  │  │  EF Core, SQL Server,    │
│  Business Invariants      │  │  Email, JWT Generation   │
└───────────────────────────┘  └──────────────────────────┘
```

### Layer Responsibilities

1. **Domain (`Backend/Domain`):**
   * Core domain entities (`Project`, `Technology`, `Inquiry`, `AdminUser`, `GithubMetricsCache`, `AiEvaluationCase`).
   * Contains pure business domain concepts without dependencies on frameworks or ORMs.

2. **Application (`Backend/Application`):**
   * Data Transfer Objects (DTOs) for incoming requests and outgoing responses (`CreateProjectDto`, `CreateInquiryDto`, `TechnologyDto`, etc.).
   * Service abstractions (`IProjectService`, `IInquiryService`, `IEmailService`, `ISchemaService`, `ITokenService`).

3. **Infrastructure (`Backend/Infrastructure`):**
   * Database persistence with `ApplicationDbContext` (EF Core SQL Server).
   * Password hashing via `IPasswordHasher<AdminUser>` (PBKDF2 with SHA-256).
   * SMTP email notifications for contact inquiries (`EmailService`).
   * Automated database schema migrations and seed initializer (`DatabaseInitializer`).

4. **WebApi (`Backend/WebApi`):**
   * HTTP RESTful Controllers with routing and model binding.
   * `ExceptionHandlingMiddleware` for unified RFC 7807 problem details.
   * Dual-tier rate limiting policies (`AdminRateLimitingConvention`).
   * CORS configuration supporting local and production frontends.

---

## 📁 Repository Structure

```text
├── Backend/
│   ├── Domain/                 # Pure domain entities & aggregates
│   │   ├── Entities/
│   │   └── Domain.csproj
│   ├── Application/            # DTOs, abstractions & use-case contracts
│   │   ├── DTOs/
│   │   ├── Interfaces/
│   │   └── Application.csproj
│   ├── Infrastructure/         # EF Core, SQL Server, Identity & External Services
│   │   ├── Persistence/
│   │   ├── Services/
│   │   └── Infrastructure.csproj
│   ├── WebApi/                 # ASP.NET Core 8 Web API Host
│   │   ├── Controllers/        # Projects, Content, Inquiries, Playground, Auth
│   │   ├── Middleware/         # Exception handling & read-only guard
│   │   ├── appsettings.json    # Runtime configuration & templates
│   │   └── Program.cs          # Dependency injection, middleware pipeline
│   └── README.md
├── Backend.Tests/              # Unit & integration tests (xUnit, NSubstitute)
│   ├── Controllers/
│   ├── Validation/
│   └── Backend.Tests.csproj
├── src/                        # React 18 TypeScript Frontend
│   ├── components/             # Reusable UI components & ApiPlayground
│   ├── context/                # Language (RTL/LTR), Theme & Profile contexts
│   ├── data/                   # Initial seeds & fallback datasets
│   ├── hooks/                  # Custom React hooks (useProjects, useInquiries)
│   ├── pages/                  # Home, ProjectDetail, Admin, Contact
│   ├── services/               # Typed API client (apiFetch, buildApiUrl)
│   └── types/                  # TypeScript domain models & DTO interfaces
├── api/                        # Serverless edge endpoints (Cloudinary upload signing)
│   └── cloudinary-sign.ts
├── public/                     # Static web assets & icons
├── package.json                # Frontend dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundling & reverse-proxy configuration
```

---

## 📡 API Endpoint Reference

### 1. Public Read-Only Endpoints (Playground-Safe)
Safe for anonymous client queries. Protected by the `public` rate-limiting policy (30 req/min).

| HTTP Method | Route | Description | Response Model |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | Retrieves all featured portfolio projects with tech stack and layers | `IReadOnlyList<ProjectDto>` |
| `GET` | `/api/v1/projects/{slug}` | Retrieves complete project metadata, architecture layers, and schema tables | `ProjectDto` |
| `GET` | `/api/v1/technologies` | Returns categorized skill matrix and technology stack | `IReadOnlyList<TechnologyDto>` |
| `GET` | `/api/v1/github/metrics` | Fetches synchronized repository metrics and language breakdowns | `GithubMetricsDto` |
| `GET` | `/api/v1/ai/cases` | Retrieves curated AI architectural evaluation case studies | `IReadOnlyList<AiEvaluationCaseDto>` |
| `GET` | `/api/v1/projects/{slug}/schema` | Retrieves normalized relational schema tables and ER relationships | `IReadOnlyList<SchemaTableDto>` |
| `GET` | `/api/playground/adros/courses` | Live playground endpoint: demo courses catalog | `JSON Object` |
| `GET` | `/api/playground/helpdesk/tickets` | Live playground endpoint: demo support tickets | `JSON Object` |
| `GET` | `/api/playground/dentzone/appointments` | Live playground endpoint: demo appointments list | `JSON Object` |

### 2. Public Submission Endpoint
| HTTP Method | Route | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/contact/inquiries` | Submits a contact inquiry & dispatches asynchronous email notification | Valid email, Name 2-100 chars, Message 10-2000 chars |

### 3. Protected Administrative Endpoints
Requires `Authorization: Bearer <JWT>` header. Protected by the `admin` rate-limiting policy (10 req/min).

| HTTP Method | Route | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/admin/auth/login` | Authenticates administrator credentials and returns JWT bearer token | Public (Rate-limited) |
| `GET` | `/api/v1/admin/inquiries` | Retrieves paginated client inquiries and contact submissions | `[Authorize]` Admin |
| `PATCH` | `/api/v1/admin/inquiries/{id}/status` | Updates inquiry lifecycle status (`New`, `Read`, `Archived`) | `[Authorize]` Admin |
| `POST` | `/api/v1/projects` | Creates a new portfolio project entry | `[Authorize]` Admin |
| `PUT` | `/api/v1/projects/{id}` | Updates existing project details, metrics, and architecture | `[Authorize]` Admin |
| `DELETE` | `/api/v1/projects/{id}` | Permanently deletes a portfolio project | `[Authorize]` Admin |
| `POST` | `/api/cloudinary-sign` | Validates admin JWT and signs a Cloudinary upload signature | Serverless Bearer Check |

---

## 🧪 Interactive API Playground

The portfolio features an integrated **API Playground** (`src/components/ApiPlayground.tsx`) demonstrating real API consumption:

1. **Live API Mode (RunASP Production):**
   * Dispatches real HTTP requests directly to the live backend server.
   * Measures precise network round-trip latency (`performance.now()`).
   * Displays the true HTTP response code, actual headers, and formatted JSON payload.
   * Displays meaningful error information if the server responds with a non-200 status.
2. **Simulated Sandbox Mode:**
   * Instant, deterministic mock simulation using verified schema payloads.
   * Ideal for offline testing or environments with restricted external internet connectivity.
3. **Strict Read-Only Guard:**
   * Mutation operations (`POST`, `PUT`, `DELETE`) are strictly forbidden in the public playground.
   * Both frontend allowlists and backend middleware (`Program.cs`) reject non-GET requests to `/api/playground/*` with `403 Forbidden`.

---

## 💻 Local Development Setup

### Prerequisites
* **.NET 8.0 SDK** ([Download .NET 8](https://dotnet.microsoft.com/download/dotnet/8.0))
* **Node.js 18+** & **npm**
* **Microsoft SQL Server** (LocalDB, SQL Server Express, or Docker container)

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd Backend/WebApi

# Restore NuGet dependencies
dotnet restore

# Configure Connection String and JWT Secret (User Secrets recommended for dev)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\mssqllocaldb;Database=PortfolioDevDb;Trusted_Connection=True;MultipleActiveResultSets=true"
dotnet user-secrets set "Jwt:Secret" "YOUR_SUPER_SECRET_KEY_MINIMUM_32_CHARACTERS_LONG"

# Apply Entity Framework migrations
dotnet ef database update --project ../Infrastructure --startup-project .

# Run the API service (Default: https://localhost:7198 or http://localhost:5242)
dotnet run
```

### 2. Frontend Setup
```bash
# In the root repository directory
npm install

# Create local environment configuration
cp .env.example .env.local

# Run the Vite development server (Bound to port 3000)
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 🧪 Testing Suite & Quality Assurance

The test suite in `Backend.Tests` verifies domain invariants, input validation, and controller behaviors without external dependencies:

```bash
# Run all backend unit tests
dotnet test Backend.Tests

# Run with detailed test results
dotnet test Backend.Tests --verbosity normal
```

### Coverage Areas:
* **Inquiry Validation:** Verifies RFC email compliance, required fields, and string length boundaries on `CreateInquiryDto`.
* **Project Validation:** Verifies required slugs, unique technology tags, and layer definitions on `CreateProjectDto`.
* **Controller Unit Tests:** Mocks `IProjectService` and `IInquiryService` using NSubstitute to test `OkResult`, `NotFoundResult`, and `CreatedAtActionResult` workflows.
* **Security & Rate Limiting:** Verifies that administrative controllers apply the `admin` rate-limiting policy and require authorization.

### Frontend Quality Verification:
```bash
# TypeScript type check (strict mode)
npm run typecheck

# ESLint code style and hook rules
npm run lint

# Production bundle build
npm run build
```

---

## 🔒 Security & Hardening Measures

1. **JWT Secret Enforcement:** Backend boot sequence halts with `InvalidOperationException` if `Jwt:Secret` is missing or shorter than 256 bits (32 bytes).
2. **Fixed-Window Rate Limiting:** Protects against credential brute-forcing (`/api/v1/admin/auth/login`) and contact form spamming.
3. **No Stored Passwords:** Administrator passwords are never persisted in plaintext; hashed with cryptographic salt using ASP.NET Core Identity PBKDF2.
4. **Token Expiry Validation:** Enforces strict token lifetime checks with a narrow 1-minute clock skew tolerance.
5. **Scoped Storage:** Cloudinary profile avatar upload replaces a single fixed `public_id` (`portfolio_profile_avatar`) with server-side signature validation, preventing arbitrary asset proliferation.
6. **RFC 7807 Problem Details:** Internal exceptions and stack traces are suppressed in production mode by `ExceptionHandlingMiddleware`.

---

## 📜 License & Author

* **Architect & Developer:** Mohamed Rashed ([@MohamedRashed1995](https://github.com/MohamedRashed1995))
* **License:** MIT License - feel free to inspect and use this architecture as an engineering reference.
