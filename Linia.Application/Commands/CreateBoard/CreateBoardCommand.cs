using MediatR;

namespace Linia.Application.Commands.CreateBoard
{
    public record CreateBoardCommand(string Name, string OwnerNickname) : IRequest<Guid>;
    
}
