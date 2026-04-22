using MediatR;

namespace Linia.Application.Commands.DeleteElement
{
    public record DeleteElementCommand(Guid BoardId, Guid PageId,Guid ElementId, string RequestedBy) : IRequest<bool>;    
}
