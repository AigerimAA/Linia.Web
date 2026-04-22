using FluentValidation;

namespace Linia.Application.Commands.AddElement
{
    public class AddElementCommandValidator : AbstractValidator<AddElementCommand>
    {
        public AddElementCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
            RuleFor(x => x.PageId).NotEmpty();
            RuleFor(x => x.JsonData).NotEmpty().MaximumLength(50000);
            RuleFor(x => x.AuthorNickname).NotEmpty().MaximumLength(50);
            RuleFor(x => x.ZIndex).GreaterThanOrEqualTo(0);
        }
    }
}
