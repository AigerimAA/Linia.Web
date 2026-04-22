using FluentValidation;

namespace Linia.Application.Commands.ClearBoard
{
    public class ClearBoardCommandValidator : AbstractValidator<ClearBoardCommand>
    {
        public ClearBoardCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
            RuleFor(x => x.PageId).NotEmpty();
            RuleFor(x => x.RequestedBy).NotEmpty().MaximumLength(50);
        }
    }
}
