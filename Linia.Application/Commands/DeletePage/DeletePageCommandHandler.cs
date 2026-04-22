using Linia.Application.Interfaces;
using Linia.Application.Common.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.DeletePage
{
    public class DeletePageCommandHandler : IRequestHandler<DeletePageCommand, bool>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly IDomainEventPublisher _eventPublisher;
        private readonly ILogger<DeletePageCommandHandler> _logger;

        public DeletePageCommandHandler(
            IBoardRepository boardRepository,
            IDomainEventPublisher eventPublisher,
            ILogger<DeletePageCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _eventPublisher = eventPublisher;
            _logger = logger;
        }

        public async Task<bool> Handle(DeletePageCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Deleting page {PageId} from board {BoardId} by {User}",
                request.PageId, request.BoardId, request.RequestedBy);

            var board = await _boardRepository.GetByIdAsync(request.BoardId, cancellationToken);
            if (board == null) throw new NotFoundException("Board not found");

            if (!board.CanUserEdit(request.RequestedBy))
                throw new ForbiddenException($"User {request.RequestedBy} cannot edit this board");

            if (!board.TryRemovePage(request.PageId))
                throw new NotFoundException("Page not found");

            await _boardRepository.UpdateAsync(board, cancellationToken);
            await _eventPublisher.PublishAsync(board.DomainEvents);
            board.ClearDomainEvents();

            return true;
        }
    }
}
