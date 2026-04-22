using MediatR;
using Linia.Application.DTOs;

namespace Linia.Application.Queries.GetBoardList
{
    public record GetBoardListQuery : IRequest<List<BoardListItemDto>>;    
}
