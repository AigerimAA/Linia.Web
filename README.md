# Linia — Collaborative Drawing Board

A real-time collaborative drawing board built with ASP.NET Core and React.

## Tech Stack

**Backend:** ASP.NET Core 10, SignalR, MediatR (CQRS), EF Core, SQL Server, FluentValidation, Clean Architecture

**Frontend:** React, TypeScript, Fabric.js, Tailwind CSS, Vite

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- SQL Server

### Backend
```bash
cd src/Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd src/ClientApp
npm install
npm run dev
```

## Architecture

Clean Architecture with 4 layers:
- **Domain** — entities, value objects, domain events
- **Application** — CQRS commands/queries, interfaces
- **Infrastructure** — EF Core, SignalR hub, repositories
- **Api** — controllers, middleware
