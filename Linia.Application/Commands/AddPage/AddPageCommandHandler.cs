using Linia.Application.Interfaces;
using Linia.Application.Common.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.AddPage
{
    public class AddPageCommandHandler : IRequestHandler<AddPageCommand, Guid>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly IDomainEventPublisher _eventPublisher;
        private readonly ILogger<AddPageCommandHandler> _logger;

        public AddPageCommandHandler(
            IBoardRepository boardRepository,
            IDomainEventPublisher eventPublisher,
            ILogger<AddPageCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _eventPublisher = eventPublisher;
            _logger = logger;
        }

        public async Task<Guid> Handle(AddPageCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Adding page to board {BoardId} by {User}", request.BoardId, request.RequestedBy);

            var board = await _boardRepository.GetByIdAsync(request.BoardId, cancellationToken);
            if (board == null) throw new NotFoundException("Board not found");

            if (!board.CanUserEdit(request.RequestedBy))
                throw new ForbiddenException($"User {request.RequestedBy} cannot edit this board");

            var page = board.AddPage();

            await _boardRepository.UpdateAsync(board, cancellationToken);
            await _eventPublisher.PublishAsync(board.DomainEvents);
            board.ClearDomainEvents();

            return page.Id;
        }
    }
}
