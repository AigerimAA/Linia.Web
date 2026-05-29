using Microsoft.Extensions.Logging;
using MediatR;
using Linia.Application.DTOs;
using Linia.Application.Interfaces;

namespace Linia.Application.Queries.GetBoard
{
    public class GetBoardQueryHandler : IRequestHandler<GetBoardQuery, BoardDto?>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly ILogger<GetBoardQueryHandler> _logger;

        public GetBoardQueryHandler(IBoardRepository boardRepository, ILogger<GetBoardQueryHandler> logger)
        {
            _boardRepository = boardRepository;
            _logger = logger;
        }

        public async Task<BoardDto?> Handle(GetBoardQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Getting board {BoardId}", request.BoardId);

            var board = await _boardRepository.GetByIdWithPagesAsync(request.BoardId);
            if (board == null) return null;

            return new BoardDto
            {
                Id = board.Id,
                Name = board.Name,
                ThumbnailUrl = board.ThumbnailUrl,
                CreatedAt = board.CreatedAt,
                PagesCount = board.Pages.Count,
                MembersCount = board.Members.Count,
                Pages = board.Pages.Select(p => new BoardPageDto
                {
                    Id = p.Id,
                    Order = p.Order,
                    ThumbnailUrl = p.ThumbnailUrl,
                    Elements = p.Elements.Select(e => new BoardElementDto
                    {
                        Id = e.Id,
                        PageId = e.PageId,
                        Type = e.Type.ToString(),
                        JsonData = e.JsonData,
                        AuthorNickname = e.AuthorNickname,
                        ZIndex = e.ZIndex,
                        CreatedAt = e.CreatedAt
                    }).ToList()
                }).ToList()
            };
        }
    }
}
