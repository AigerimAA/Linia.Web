using Microsoft.AspNetCore.SignalR;
using Linia.Application.DTOs;
using Linia.Application.Interfaces;
using Linia.Infrastructure.SignalR;

namespace Linia.Infrastructure.Services
{
    public class DrawingClient : IDrawingClient
    {
        private readonly IHubContext<DrawingHub, IDrawingClient> _hubContext;

        public DrawingClient(IHubContext<DrawingHub, IDrawingClient> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task ReceiveElement(BoardElementDto element)
        {
            await _hubContext.Clients.Group(element.BoardId.ToString()).ReceiveElement(element);
        }

        public async Task ReceiveCursor(CursorDto cursor)
        {
            await _hubContext.Clients.Group(cursor.BoardId.ToString()).ReceiveCursor(cursor);
        }

        public async Task UserJoined(Guid boardId, string nickname)
        {
            await _hubContext.Clients.Group(boardId.ToString()).UserJoined(boardId, nickname);
        }

        public async Task UserLeft(Guid boardId, string nickname)
        {
            await _hubContext.Clients.Group(boardId.ToString()).UserLeft(boardId, nickname);
        }

        public async Task ReceiveElementDeleted(Guid boardId, Guid elementId)
        {
            await _hubContext.Clients.Group(boardId.ToString()).ReceiveElementDeleted(boardId, elementId);
        }

        public async Task ReceiveBoardCleared(Guid boardId)
        {
            await _hubContext.Clients.Group(boardId.ToString()).ReceiveBoardCleared(boardId);
        }
        public async Task ElementDrawn(Guid elementId) { }

        public async Task CommandFailed(string error) { }
    }
}
