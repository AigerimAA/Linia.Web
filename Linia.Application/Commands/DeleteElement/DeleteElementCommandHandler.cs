using Linia.Application.Common.Exceptions;
using Linia.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.DeleteElement
{
    public class DeleteElementCommandHandler : IRequestHandler<DeleteElementCommand, bool>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly IDomainEventPublisher _eventPublisher;
        private readonly ILogger<DeleteElementCommandHandler> _logger;

        public DeleteElementCommandHandler(IBoardRepository boardRepository,
            IDomainEventPublisher eventPublisher, ILogger<DeleteElementCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _eventPublisher = eventPublisher;
            _logger = logger;
        }

        public async Task<bool> Handle(DeleteElementCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Deleting element {ElementId} by {User}", request.ElementId, request.RequestedBy);

            var board = await _boardRepository.GetByIdWithPagesAsync(request.BoardId, cancellationToken);
            if (board == null) throw new NotFoundException("Board not found");

            if (!board.CanUserEdit(request.RequestedBy))
                throw new ForbiddenException($"User {request.RequestedBy} cannot edit");

            var result = board.TryRemoveElementFromPage(request.PageId, request.ElementId, request.RequestedBy);
            if (!result) throw new NotFoundException("Element not found");

            await _boardRepository.UpdateAsync(board, cancellationToken);
            await _eventPublisher.PublishAsync(board.DomainEvents);
            board.ClearDomainEvents();

            return true;
        }
    }
}
