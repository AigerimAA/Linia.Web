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

        public string Nickname
        {
            get
            {
                var fromQuery = _httpContextAccessor.HttpContext?.Request.Query["nickname"].FirstOrDefault();
                if (!string.IsNullOrEmpty(fromQuery))
                    return Uri.UnescapeDataString(fromQuery);

                var fromHeader = _httpContextAccessor.HttpContext?.Request.Headers["X-Nickname"].FirstOrDefault();
                if (!string.IsNullOrEmpty(fromHeader))
                    return Uri.UnescapeDataString(fromHeader);

                return "Anonymous";
            }
        }
    }
}
