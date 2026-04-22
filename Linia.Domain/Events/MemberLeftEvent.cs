using Linia.Domain.Common;

namespace Linia.Domain.Events
{
    public record MemberLeftEvent(Guid BoardId, string Nickname) : IDomainEvent
    {
        public Guid AggregateId => BoardId;
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
}
