using Linia.Application.Interfaces;
using Linia.Application.Common.Exceptions;
using Linia.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Linia.Application.Commands.ChangeMemberRole
{
    public class ChangeMemberRoleCommandHandler : IRequestHandler<ChangeMemberRoleCommand, bool>
    {
        private readonly IBoardRepository _boardRepository;
        private readonly ILogger<ChangeMemberRoleCommandHandler> _logger;

        public ChangeMemberRoleCommandHandler(IBoardRepository boardRepository, ILogger<ChangeMemberRoleCommandHandler> logger)
        {
            _boardRepository = boardRepository;
            _logger = logger;
        }

        public async Task<bool> Handle(ChangeMemberRoleCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Changing role of {Target} on board {BoardId} by {User}", request.TargetNickname, request.BoardId, request.RequestedBy);

            var board = await _boardRepository.GetByIdAsync(request.BoardId, cancellationToken);
            if (board == null) throw new NotFoundException("Board not found");

            var newRole = Enum.Parse<UserRole>(request.NewRole, true);

            if (!board.TryChangeMemberRole(request.TargetNickname, newRole, request.RequestedBy))
                throw new NotFoundException("Member not found");
            await _boardRepository.UpdateAsync(board, cancellationToken);

            return true;
        }
    }
}
