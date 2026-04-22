using Linia.Domain.Aggregates;
using Linia.Domain.Enums;

namespace Linia.Application.Interfaces
{
    public interface IBoardRepository
    {
        Task<Board?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<Board?> GetByIdWithPagesAsync(Guid id, CancellationToken ct = default);
        Task<IEnumerable<Board>> GetAllAsync(CancellationToken ct = default);
        Task AddAsync(Board board, CancellationToken ct = default);
        Task UpdateAsync(Board board, CancellationToken ct = default);
        Task DeleteAsync(Guid id, CancellationToken ct = default);
        Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);
        Task AddMemberAsync(Guid boardId, string nickname, UserRole role, CancellationToken ct = default);
    }
}
