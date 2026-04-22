using Linia.Domain.Common;
using Linia.Domain.Entities;
using Linia.Domain.Enums;

namespace Linia.Domain.Events
{
    public record ElementAddedEvent(
        Guid BoardId,
        Guid PageId,
        Guid ElementId,
        string JsonData,
        string AuthorNickname,
        ElementType Type,
        int ZIndex,
        DateTime CreatedAt) : IDomainEvent
    {
        public Guid AggregateId => BoardId;
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
}
