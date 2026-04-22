using MediatR;

namespace Linia.Application.Commands.AddElement
{
    public record AddElementCommand(
        Guid BoardId,
        Guid PageId,
        string Type,
        string JsonData,
        string AuthorNickname,
        int ZIndex) : IRequest<Guid>;
}
