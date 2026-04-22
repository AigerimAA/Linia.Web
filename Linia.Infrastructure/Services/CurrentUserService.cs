using Linia.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Linia.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string Nickname =>
            _httpContextAccessor.HttpContext?.Request.Query["nickname"].FirstOrDefault()
            ?? _httpContextAccessor.HttpContext?.Request.Headers["X-Nickname"].FirstOrDefault()
            ?? "Anonymous";
    }
}
