using MediatR;
using Linia.Application.DTOs;

namespace Linia.Application.Queries.GetBoard
{
    public record GetBoardQuery(Guid BoardId) : IRequest<BoardDto?>;
}
