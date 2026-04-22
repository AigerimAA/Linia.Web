using Linia.Application.Interfaces;
using Linia.Application.Common.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.UpdateBoardThumbnail
{
    public class UpdateBoardThumbnailCommandHandler : IRequestHandler<UpdateBoardThumbnailCommand, bool>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly ILogger<UpdateBoardThumbnailCommandHandler> _logger;

        public UpdateBoardThumbnailCommandHandler(
            IBoardRepository boardRepository,
            ILogger<UpdateBoardThumbnailCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _logger = logger;
        }

        public async Task<bool> Handle(UpdateBoardThumbnailCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Updating thumbnail for board {BoardId} by {User}", request.BoardId, request.RequestedBy);

            var board = await _boardRepository.GetByIdAsync(request.BoardId, cancellationToken);
            if (board == null) throw new NotFoundException("Board not found");

            if (!board.CanUserEdit(request.RequestedBy))
                throw new ForbiddenException($"User {request.RequestedBy} cannot edit this board");

            board.UpdateThumbnail(request.ThumbnailUrl);

            await _boardRepository.UpdateAsync(board, cancellationToken);

            return true;
        }
    }
}
