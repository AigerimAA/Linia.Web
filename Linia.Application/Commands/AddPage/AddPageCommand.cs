using MediatR;

namespace Linia.Application.Commands.AddPage
{
    public record AddPageCommand(Guid BoardId, string RequestedBy) : IRequest<Guid>;
}
