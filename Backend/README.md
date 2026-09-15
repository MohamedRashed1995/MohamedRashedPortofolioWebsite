# Portfolio backend

This is the executable ASP.NET Core .NET 8 backend. It uses Clean Architecture project boundaries:

- `Domain`: entities and business concepts
- `Application`: DTOs and use-case interfaces
- `Infrastructure`: SQL Server EF Core persistence
- `WebApi`: HTTP endpoints, middleware, CORS, and rate limiting

Production uses PostgreSQL through Npgsql. Configure `ConnectionStrings__DefaultConnection` and `Database__Provider=Postgres` outside source control before running. For a free Neon database, use a pooled connection string in this format:

`Host=ep-example-123.eu-central-1.aws.neon.tech;Port=5432;Database=portfolio;Username=portfolio_owner;Password=<NEON_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true;Pooling=true;Maximum Pool Size=10`

Supabase uses the same Npgsql format, for example: `Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<SUPABASE_PASSWORD>;SSL Mode=Require;Trust Server Certificate=true;Pooling=true`.

Local development may use `Database__Provider=Sqlite` with `ConnectionStrings__DefaultConnection=Data Source=portfolio.db`. Do not use that mode in production. Create/apply the PostgreSQL schema with `dotnet ef database update --project Infrastructure --startup-project WebApi` after setting the PostgreSQL environment variables.

Set `Cors__Frontend` to one or more comma-separated absolute origins, with no trailing slash, for example `https://portfolio.example.com`. In Development, `http://localhost:3000` and `https://localhost:3000` are also allowed automatically.

Required runtime settings are listed in `.env.example`. Set them as environment variables or user secrets; the application refuses to start without a sufficiently long JWT secret. The initializer creates the configured admin only when the database has no admin users.

Profile uploads use Cloudinary when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are configured. Without those settings, local development falls back to `wwwroot/uploads`; production deployments must configure Cloudinary because serverless filesystems are not persistent.
