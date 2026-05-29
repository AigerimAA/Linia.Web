using FluentValidation;

namespace Linia.Application.Commands.CreateBoard
{
    public class CreateBoardCommandValidator : AbstractValidator<CreateBoardCommand>
    {
        public CreateBoardCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Board name is required")
                .MaximumLength(200).WithMessage("Board name must not exceed 200 characters");
        }
    }
}
