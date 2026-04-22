using Linia.Domain.Common;

namespace Linia.Domain.Events
{
    public record PageClearedEvent(Guid BoardId, Guid PageId, string ClearedBy) : IDomainEvent
    {
        public Guid AggregateId => BoardId;
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
}
