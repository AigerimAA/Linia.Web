using MediatR;
using Microsoft.Extensions.Logging;
using Linia.Application.DTOs;
using Linia.Application.Interfaces;

namespace Linia.Application.Queries.GetBoardList
{
    public class GetBoardListQueryHandler : IRequestHandler<GetBoardListQuery, List<BoardListItemDto>>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly ILogger<GetBoardListQueryHandler> _logger;

        public GetBoardListQueryHandler(IBoardRepository boardRepository, ILogger<GetBoardListQueryHandler> logger)
        {
            _boardRepository = boardRepository;
            _logger = logger;
        }
        public async Task<List<BoardListItemDto>> Handle(GetBoardListQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Getting all boards");

            var boards = await _boardRepository.GetAllAsync();

            return boards.Select(b => new BoardListItemDto
            {
                Id = b.Id,
                Name = b.Name,
                ThumbnailUrl = b.ThumbnailUrl,
                CreatedAt = b.CreatedAt,
                PagesCount = b.Pages.Count,
                MembersCount = b.Members.Count
            }).ToList();
        }

    }
}
