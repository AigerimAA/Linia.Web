using MediatR;

namespace Linia.Application.Commands.UpdateBoardThumbnail
{
    public record UpdateBoardThumbnailCommand(Guid BoardId, string ThumbnailUrl, string RequestedBy) : IRequest<bool>;
}
