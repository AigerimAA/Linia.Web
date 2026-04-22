using Linia.Application.Common.Exceptions;
using Linia.Application.Interfaces;
using Linia.Domain.Entities;
using Linia.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.ClearBoard
{
    public class ClearBoardCommandHandler : IRequestHandler<ClearBoardCommand, bool>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly IDomainEventPublisher _eventPublisher;
        private readonly ILogger<ClearBoardCommandHandler> _logger;

        public ClearBoardCommandHandler(
            IBoardRepository boardRepository,
            IDomainEventPublisher eventPublisher,
            ILogger<ClearBoardCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _eventPublisher = eventPublisher;
            _logger = logger;
        }

        public async Task<bool> Handle(ClearBoardCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Clearing page {PageId} by {User}", request.PageId, request.RequestedBy);

            var board = await _boardRepository.GetByIdAsync(request.BoardId, cancellationToken);
            if (board == null) throw new NotFoundException("Board not found");

            if (!board.CanUserEdit(request.RequestedBy))
                throw new ForbiddenException($"User {request.RequestedBy} cannot edit");

            board.ClearPage(request.PageId, request.RequestedBy);

            await _boardRepository.UpdateAsync(board, cancellationToken);
            await _eventPublisher.PublishAsync(board.DomainEvents);
            board.ClearDomainEvents();

            return true;
        }
    }
}
