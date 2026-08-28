# Portfolio backend

This is the executable ASP.NET Core .NET 8 backend. It uses Clean Architecture project boundaries:

- `Domain`: entities and business concepts
- `Application`: DTOs and use-case interfaces
- `Infrastructure`: SQL Server EF Core persistence
- `WebApi`: HTTP endpoints, middleware, CORS, and rate limiting

Configure `ConnectionStrings__DefaultConnection` outside source control before running. Create the schema with `dotnet ef migrations add InitialCreate --project Infrastructure --startup-project WebApi` and apply it with `dotnet ef database update --project Infrastructure --startup-project WebApi`.

Required runtime settings are listed in `.env.example`. Set them as environment variables or user secrets; the application refuses to start without a sufficiently long JWT secret. The initializer creates the configured admin only when the database has no admin users.
