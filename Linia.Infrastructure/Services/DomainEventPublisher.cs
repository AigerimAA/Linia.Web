using Linia.Application.DTOs;
using Linia.Application.Interfaces;
using Linia.Domain.Common;
using Linia.Domain.Events;
using Linia.Infrastructure.SignalR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Linia.Infrastructure.Services
{
    public class DomainEventPublisher : IDomainEventPublisher
    {
        private readonly IDrawingClient _drawingClient;  
        private readonly ILogger<DomainEventPublisher> _logger;

        public DomainEventPublisher(IDrawingClient drawingClient, ILogger<DomainEventPublisher> logger)
        {
            _drawingClient = drawingClient;
            _logger = logger;
        }

        public async Task PublishAsync(IEnumerable<IDomainEvent> events)
        {
            foreach (var @event in events)
            {
                try
                {
                    switch (@event)
                    {
                        case ElementAddedEvent e:
                            var dto = new BoardElementDto
                            {
                                Id = e.ElementId,
                                BoardId = e.BoardId,
                                PageId = e.PageId,
                                Type = e.Type.ToString(),
                                JsonData = e.JsonData,
                                AuthorNickname = e.AuthorNickname,
                                ZIndex = e.ZIndex,
                                CreatedAt = e.CreatedAt
                            };
                            await _drawingClient.ReceiveElement(dto);
                            break;

                        case ElementRemovedEvent e:
                            await _drawingClient.ReceiveElementDeleted(e.BoardId, e.ElementId);
                            break;

                        case PageClearedEvent e:
                            await _drawingClient.ReceiveBoardCleared(e.BoardId);
                            break;

                        case MemberJoinedEvent e:
                            await _drawingClient.UserJoined(e.BoardId, e.Nickname);
                            break;
                        case MemberLeftEvent e:
                            await _drawingClient.UserLeft(e.BoardId, e.Nickname);
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to publish event {EventType}", @event.GetType().Name);
                }
            }
        }
    }
}
