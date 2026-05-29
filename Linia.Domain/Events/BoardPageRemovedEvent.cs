using Linia.Domain.Common;

namespace Linia.Domain.Events
{
    public record class BoardPageRemovedEvent(Guid BoardId, Guid PageId) : IDomainEvent
    {
        public Guid AggregateId => BoardId;
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
    
}
