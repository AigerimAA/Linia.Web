using FluentValidation;

namespace Linia.Application.Commands.DeleteBoard
{
    public class DeleteBoardCommandValidator : AbstractValidator<DeleteBoardCommand>
    {
        public DeleteBoardCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
        }
    }
}
