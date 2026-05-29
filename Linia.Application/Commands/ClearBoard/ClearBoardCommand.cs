using MediatR;

namespace Linia.Application.Commands.ClearBoard
{
    public record ClearBoardCommand(Guid BoardId, Guid PageId, string RequestedBy) : IRequest<bool>;    
}
