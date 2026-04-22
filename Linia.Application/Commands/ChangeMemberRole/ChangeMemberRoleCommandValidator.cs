using FluentValidation;

namespace Linia.Application.Commands.ChangeMemberRole
{
    public class ChangeMemberRoleCommandValidator : AbstractValidator<ChangeMemberRoleCommand>
    {
        public ChangeMemberRoleCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
            RuleFor(x => x.TargetNickname).NotEmpty().MaximumLength(50);
            RuleFor(x => x.NewRole).NotEmpty().Must(r => r == "Viewer" || r == "Editor" || r == "Admin")
                .WithMessage("Role must be Viewer, Editor, or Admin");
            RuleFor(x => x.RequestedBy).NotEmpty().MaximumLength(50);
        }
    }
}
