using MediatR;

namespace Linia.Application.Commands.ChangeMemberRole
{
    public record ChangeMemberRoleCommand(Guid BoardId, string TargetNickname, string NewRole, string RequestedBy) : IRequest<bool>;
}
