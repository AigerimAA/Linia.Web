using System.Text.Json;
using Linia.API.Middleware;
using Linia.Application;
using Linia.Infrastructure;
using Linia.Infrastructure.Persistence;
using Linia.Infrastructure.SignalR;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Linia.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                    options.JsonSerializerOptions.PropertyNamingPolicy =
                        JsonNamingPolicy.CamelCase);
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var allowedOrigins = builder.Configuration
                .GetSection("AllowedOrigins").Get<string[]>()
                ?? new[] { "http://localhost:5173" };

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ReactApp", policy =>
                {
                    policy.WithOrigins(allowedOrigins)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
                });
            });

            builder.Services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 10 * 1024 * 1024;
            });

            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
            });

            builder.Services.AddApplication();
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? Environment.GetEnvironmentVariable("DATABASE_URL");
            builder.Services.AddInfrastructure(connectionString!, builder.Environment.IsDevelopment());

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.Migrate();
            }

            app.UseMiddleware<ExceptionHandlingMiddleware>();
            app.UseWebSockets();
            app.UseRouting();
            app.UseCors("ReactApp");
            app.UseAuthorization();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.MapControllers();
            app.MapHub<DrawingHub>("/drawingHub")
                .RequireCors("ReactApp");

            app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

            app.Run();
        }
    }
}