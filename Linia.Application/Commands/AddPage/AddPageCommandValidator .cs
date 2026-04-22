using FluentValidation;

namespace Linia.Application.Commands.AddPage
{
    public class AddPageCommandValidator : AbstractValidator<AddPageCommand>
    {
        public AddPageCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
            RuleFor(x => x.RequestedBy).NotEmpty().MaximumLength(50);
        }
    }
}
