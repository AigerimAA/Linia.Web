using System.ComponentModel.DataAnnotations;
using Linia.Application.Common.Exceptions;
using Linia.Application.Interfaces;
using Linia.Domain.Entities;
using Linia.Domain.Enums;
using Linia.Domain.ValueObjects;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.AddElement
{
    public class AddElementCommandHandler : IRequestHandler<AddElementCommand, Guid>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly IDomainEventPublisher _eventPublisher;
        private readonly ILogger<AddElementCommandHandler> _logger;

        public AddElementCommandHandler(
            IBoardRepository boardRepository,
            IDomainEventPublisher eventPublisher,
            ILogger<AddElementCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _eventPublisher = eventPublisher;
            _logger = logger;
        }

        public async Task<Guid> Handle(AddElementCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Adding element to page {PageId} by {Nickname}",
                request.PageId, request.AuthorNickname);

            var board = await _boardRepository.GetByIdAsync(request.BoardId);
            if (board == null)
            {
                _logger.LogError("Board {BoardId} not found", request.BoardId);
                throw new NotFoundException("Board not found");
            }

            board.AddMember(request.AuthorNickname, UserRole.Editor);

            if (!Enum.TryParse<ElementType>(request.Type, ignoreCase: true, out var type))
                throw new ValidationException($"Invalid element type: {request.Type}");

            var element = board.AddElementToPage(
                request.PageId, type, request.JsonData,
                request.AuthorNickname, request.ZIndex);

            await _boardRepository.UpdateAsync(board, cancellationToken);
            await _eventPublisher.PublishAsync(board.DomainEvents);
            board.ClearDomainEvents();

            return element.Id;
        }
    }
}
