using MediatR;

namespace Linia.Application.Commands.DeletePage
{
    public record DeletePageCommand(Guid BoardId, Guid PageId, string RequestedBy) : IRequest<bool>;
}
