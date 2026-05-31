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
            options.UseNpgsql(connectionString));

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