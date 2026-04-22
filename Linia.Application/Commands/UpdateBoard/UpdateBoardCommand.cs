using MediatR;

namespace Linia.Application.Commands.UpdateBoard
{
    public record UpdateBoardCommand(Guid BoardId, string NewName, string RequestedBy) : IRequest<bool>;
}
