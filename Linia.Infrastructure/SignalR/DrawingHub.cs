using Linia.Application.Commands.AddElement;
using Linia.Application.Commands.DeleteElement;
using Linia.Application.Common.Exceptions;
using Linia.Application.DTOs;
using Linia.Application.Interfaces;
using Linia.Domain.Common;
using Linia.Domain.Enums;
using Linia.Infrastructure.Repositories;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Linia.Infrastructure.SignalR
{
    public class DrawingHub : Hub<IDrawingClient>
    {
        private readonly IMediator _mediator;
        private readonly ILogger<DrawingHub> _logger;
        private readonly ICurrentUserService _currentUser;
        private readonly IBoardRepository _boardRepository;

        public DrawingHub(IMediator mediator, ILogger<DrawingHub> logger, ICurrentUserService currentUser, IBoardRepository boardRepository)
        {
            _mediator = mediator;
            _logger = logger;
            _currentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
            _boardRepository = boardRepository;
        }
        public async Task DrawElement(DrawElementRequest request)
        {
            _logger.LogInformation("DrawElement called! BoardId={BoardId}, PageId={PageId}, Type={Type}",
                request.BoardId, request.PageId, request.Type);

            var nickname = _currentUser.Nickname;

            var command = new AddElementCommand(
                request.BoardId,
                request.PageId,
                request.Type,
                request.JsonData,
                nickname,  
                request.ZIndex);

            try
            {
                var elementId = await _mediator.Send(command);

                var elementDto = new BoardElementDto
                {
                    Id = elementId,
                    Type = request.Type,
                    JsonData = request.JsonData,
                    AuthorNickname = nickname,
                    CreatedAt = DateTime.UtcNow,
                    PageId = request.PageId,
                    ZIndex = request.ZIndex
                };

                _logger.LogInformation("Element {ElementId} drawn by {User}", elementId, nickname);

                await Clients.Group(request.BoardId.ToString()).ReceiveElement(elementDto);

                await Clients.Caller.ElementDrawn(elementId);
            }
            catch (Exception ex) when (ex is ForbiddenException or DomainException)
            {
                _logger.LogWarning(ex, "DrawElement failed for {User}", nickname);
                await Clients.Caller.CommandFailed(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error");
                await Clients.Caller.CommandFailed("Internal server error");
            }
        }
        public async Task JoinBoard(Guid boardId)
        {
            var nickname = _currentUser.Nickname;
            await Groups.AddToGroupAsync(Context.ConnectionId, boardId.ToString());
            
            try
            {
                await _boardRepository.AddMemberAsync(boardId, nickname, UserRole.Editor);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to add member {Nickname}", nickname);
            }


            await Clients.Group(boardId.ToString()).UserJoined(boardId, nickname);
            _logger.LogInformation("{Nickname} joined board {BoardId}", nickname, boardId);
        }

        public async Task LeaveBoard(Guid boardId)  
        {
            var nickname = _currentUser.Nickname;
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId.ToString());
            await Clients.Group(boardId.ToString()).UserLeft(boardId, nickname);
        }
        public async Task DeleteElement(DeleteElementRequest request)
        {
            var command = new DeleteElementCommand(
                request.BoardId,
                request.PageId,
                request.ElementId,
                _currentUser.Nickname);

            try
            {
                await _mediator.Send(command);
                await Clients.Group(request.BoardId.ToString())
                    .ReceiveElementDeleted(request.BoardId, request.ElementId);
            }
            catch (Exception ex) when (ex is ForbiddenException or DomainException)
            {
                await Clients.Caller.CommandFailed(ex.Message);
            }
        }

        public record DeleteElementRequest(Guid BoardId, Guid PageId, Guid ElementId);
        public async Task SendCursor(CursorDto cursor)
        {
            await Clients.Group(cursor.BoardId.ToString()).ReceiveCursor(cursor);
        }
        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client {ConnectionId} connected", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogWarning(exception, "Client {ConnectionId} disconnected", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
