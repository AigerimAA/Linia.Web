using Linia.Application.Interfaces;
using Linia.Infrastructure.Persistence;
using Linia.Infrastructure.Repositories;
using Linia.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Linia.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString, bool isDevelopment = true)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            var connStr = connectionString;
            if (connStr != null && !string.IsNullOrEmpty(connStr) && (connStr.StartsWith("postgresql://") || connStr.StartsWith("postgres://")))
            {
                var uri = new Uri(connStr);
                var userInfo = uri.UserInfo.Split(':');
                connStr = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
            }
            options.UseNpgsql(connStr);
        });

        services.AddScoped<IBoardRepository, BoardRepository>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IDomainEventPublisher, DomainEventPublisher>();
        services.AddScoped<IDrawingClient, DrawingClient>();        
        services.AddHttpContextAccessor();

        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = isDevelopment;
            options.KeepAliveInterval = TimeSpan.FromSeconds(10);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            options.MaximumReceiveMessageSize = 1024 * 1024;
        });

        return services;
    }
}