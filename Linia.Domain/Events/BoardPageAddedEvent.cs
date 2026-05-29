using Linia.Domain.Common;

namespace Linia.Domain.Events
{
    public record BoardPageAddedEvent(Guid BoardId, Guid PageId, int Order) : IDomainEvent
    {
        public Guid AggregateId => BoardId;
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
}
