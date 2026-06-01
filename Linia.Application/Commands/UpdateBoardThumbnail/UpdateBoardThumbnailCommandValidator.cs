using FluentValidation;

namespace Linia.Application.Commands.UpdateBoardThumbnail
{
    public class UpdateBoardThumbnailCommandValidator : AbstractValidator<UpdateBoardThumbnailCommand>
    {
        public UpdateBoardThumbnailCommandValidator()
        {
            RuleFor(x => x.BoardId).NotEmpty();
            RuleFor(x => x.RequestedBy).NotEmpty().MaximumLength(50);
            RuleFor(x => x.ThumbnailUrl)
                .NotEmpty()
                .Must(url => url.StartsWith("data:image/") || Uri.TryCreate(url, UriKind.Absolute, out _))
                .WithMessage("Invalid thumbnail URL");

        }
    }
}
