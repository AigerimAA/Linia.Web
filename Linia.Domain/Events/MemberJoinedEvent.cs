using Linia.Domain.Common;

namespace Linia.Domain.Events
{
    public record MemberJoinedEvent(Guid BoardId, string Nickname) : IDomainEvent
    {
        public Guid AggregateId => BoardId;
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
}
