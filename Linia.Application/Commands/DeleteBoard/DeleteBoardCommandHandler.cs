using Linia.Application.Interfaces;
using MediatR;

namespace Linia.Application.Commands.DeleteBoard
{
    public class DeleteBoardCommandHandler : IRequestHandler<DeleteBoardCommand, bool>
    {
        private readonly IBoardRepository _boardRepository;

        public DeleteBoardCommandHandler(IBoardRepository boardRepository)
        {
            _boardRepository = boardRepository;
        }

        public async Task<bool> Handle(DeleteBoardCommand request, CancellationToken cancellationToken)
        {
            await _boardRepository.DeleteAsync(request.BoardId, cancellationToken);
            return true;
        }
    }
}
