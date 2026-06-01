# Linia — Collaborative Drawing Board

A real-time collaborative drawing board built with ASP.NET Core and React.

🔗 **[Live Demo](https://triumphant-intuition-production-741d.up.railway.app)**

## Features

### Core
- Nickname-based entry (no registration)
- Board list with card UI and thumbnail previews
- Create and join boards
- Full-screen canvas with zoom and pan (mouse wheel + drag)
- Real-time collaborative drawing via SignalR (WebSockets)
- Persistent storage — all elements saved forever in PostgreSQL
- Real-time cursor tracking with nicknames
- Light and dark theme

### Drawing Tools
- Freehand pen, rectangle, circle, line, text
- Color picker and stroke width selector
- Eraser (real-time for all users)
- Clear board with confirmation
- Export to JPEG

## Tech Stack

**Backend:** ASP.NET Core 10, SignalR, CQRS with MediatR, EF Core 9, PostgreSQL, FluentValidation, Clean Architecture

**Frontend:** React, TypeScript, Fabric.js, Tailwind CSS, Vite

## Architecture

Clean Architecture with 4 layers:

- **Domain** — entities, value objects
- **Application** — CQRS commands/queries, interfaces
- **Infrastructure** — EF Core, SignalR hub, repositories
- **Web** — controllers, middleware

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- PostgreSQL

### Backend
```bash
cd Linia.Web
dotnet restore
dotnet ef database update --project Linia.Infrastructure --startup-project Linia.Web
dotnet run --project Linia.Web
```

### Frontend
```bash
cd ClientApp
npm install
npm run dev
```

### Environment Variables
Create `appsettings.Development.json` in `Linia.Web/`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=linia;Username=postgres;Password=your_password"
  },
  "AllowedOrigins": ["http://localhost:5173"]
}
```
