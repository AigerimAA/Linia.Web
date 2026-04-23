using MediatR;

namespace Linia.Application.Commands.DeleteBoard
{
    public record DeleteBoardCommand(Guid BoardId) : IRequest<bool>;
}
