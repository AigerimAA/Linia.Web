using FluentValidation;

namespace Linia.Application.Commands.UpdateBoard
{
    public class UpdateBoardCommandValidator : AbstractValidator<UpdateBoardCommand>
    {
        public UpdateBoardCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();

            RuleFor(x => x.NewName)
                .NotEmpty().WithMessage("Board name is required")
                .MaximumLength(200).WithMessage("Board name must not exceed 200 characters");

            RuleFor(x => x.RequestedBy)
                .NotEmpty().MaximumLength(50);
        }
    }
}
