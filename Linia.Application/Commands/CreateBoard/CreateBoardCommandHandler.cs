using Linia.Application.Interfaces;
using Linia.Domain.Aggregates;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.CreateBoard
{
    public class CreateBoardCommandHandler : IRequestHandler<CreateBoardCommand, Guid>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly IDomainEventPublisher _eventPublisher;
        private readonly ILogger<CreateBoardCommandHandler> _logger;

        public CreateBoardCommandHandler(IBoardRepository boardRepository, IDomainEventPublisher eventPublisher, ILogger<CreateBoardCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _eventPublisher = eventPublisher;
            _logger = logger;
        }
        public async Task<Guid> Handle(CreateBoardCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Creating board {Name} by {Owner}", request.Name, request.OwnerNickname);

            var board = new Board(request.Name, request.OwnerNickname);

            await _boardRepository.AddAsync(board);
            await _eventPublisher.PublishAsync(board.DomainEvents);
            board.ClearDomainEvents();

            return board.Id;
        }
    }
}
