using Linia.Application.DTOs;

namespace Linia.Application.Interfaces
{
    public interface IDrawingClient
    {
        Task ReceiveElement(BoardElementDto element);
        Task ReceiveCursor(CursorDto cursor);
        Task UserJoined(Guid boardId, string nickname);
        Task UserLeft(Guid boardId, string nickname);
        Task ReceiveElementDeleted(Guid boardId, Guid elementId);
        Task ReceiveBoardCleared(Guid boardId);
        Task ElementDrawn(Guid elementId);
        Task CommandFailed(string error);
    }
}
