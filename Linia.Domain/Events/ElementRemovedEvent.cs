using Linia.Domain.Common;

namespace Linia.Domain.Events
{
    public record ElementRemovedEvent(Guid BoardId, Guid PageId, Guid ElementId, string RemovedBy) : IDomainEvent
    {
        public Guid AggregateId => BoardId;
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
}
