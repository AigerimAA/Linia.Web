using FluentValidation;

namespace Linia.Application.Commands.DeleteElement
{
    public class DeleteElementCommandValidator : AbstractValidator<DeleteElementCommand>
    {
        public DeleteElementCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
            RuleFor(x => x.PageId).NotEmpty();
            RuleFor(x => x.ElementId).NotEmpty();
            RuleFor(x => x.RequestedBy).NotEmpty().MaximumLength(50);
        }
    }
}
