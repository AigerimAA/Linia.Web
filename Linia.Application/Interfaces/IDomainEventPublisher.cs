using Linia.Domain.Common;

namespace Linia.Application.Interfaces
{
    public interface IDomainEventPublisher
    {
        Task PublishAsync(IEnumerable<IDomainEvent> events);
    }
}
