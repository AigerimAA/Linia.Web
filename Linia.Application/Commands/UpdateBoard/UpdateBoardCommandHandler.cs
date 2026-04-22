using Linia.Application.Common.Exceptions;
using Linia.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.UpdateBoard
{
    public class UpdateBoardCommandHandler : IRequestHandler<UpdateBoardCommand, bool>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly ILogger<UpdateBoardCommandHandler> _logger;

        public UpdateBoardCommandHandler(IBoardRepository boardRepository, ILogger<UpdateBoardCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _logger = logger;
        }

        public async Task<bool> Handle(UpdateBoardCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Updating board {BoardId} to {NewName} by {User}", request.BoardId, request.NewName, request.RequestedBy);

            var board = await _boardRepository.GetByIdAsync(request.BoardId, cancellationToken);
            if (board == null) throw new NotFoundException("Board not found");

            if (!board.CanUserManage(request.RequestedBy))
                throw new ForbiddenException($"User {request.RequestedBy} cannot manage this board");

            board.UpdateName(request.NewName);

            await _boardRepository.UpdateAsync(board, cancellationToken);
            return true;
        }
    }
}
