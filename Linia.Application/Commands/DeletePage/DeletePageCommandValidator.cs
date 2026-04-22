using FluentValidation;

namespace Linia.Application.Commands.DeletePage
{
    public class DeletePageCommandValidator : AbstractValidator<DeletePageCommand>
    {
        public DeletePageCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
            RuleFor(x => x.PageId).NotEmpty();
            RuleFor(x => x.RequestedBy).NotEmpty().MaximumLength(50);
        }
    }
}
