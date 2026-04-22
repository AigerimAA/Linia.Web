using System;
using System.Collections.Generic;
using System.Text;

namespace Linia.Domain.Common
{
    public interface IDomainEvent
    {
        Guid AggregateId { get; }
        DateTime OccurredOn { get; }
    }
}
