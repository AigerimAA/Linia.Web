using Linia.Application.Interfaces;
using Linia.Domain.Aggregates;
using Linia.Domain.Common;
using Linia.Domain.Entities;
using Linia.Domain.Enums;
using Linia.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Linia.Infrastructure.Repositories
{
    public class BoardRepository : IBoardRepository
    {
        private readonly AppDbContext _context;
        public BoardRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Board?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Boards
                .Include(b => b.Pages)
                    .ThenInclude(p => p.Elements)
                .Include(b => b.Members)
                .FirstOrDefaultAsync(b => b.Id == id, ct);
        }
        public async Task<Board?> GetByIdWithPagesAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Boards
                .Include(b => b.Pages)
                    .ThenInclude(p => p.Elements)
                .Include(b => b.Members)
                .FirstOrDefaultAsync(b => b.Id == id, ct);
        }
        public async Task<IEnumerable<Board>> GetAllAsync(CancellationToken ct = default)
        {
            return await _context.Boards
                .Include(b => b.Pages)
                .Include(b => b.Members)
                .ToListAsync(ct);
        }
        public async Task AddAsync(Board board, CancellationToken ct = default)
        {
            await _context.Boards.AddAsync(board, ct);
            await _context.SaveChangesAsync(ct);
        }
        public async Task AddMemberAsync(Guid boardId, string nickname, UserRole role, CancellationToken ct = default)
        {
            var exists = await _context.Set<Member>()
                .AnyAsync(m => m.BoardId == boardId &&
                          m.Nickname.ToLower() == nickname.ToLower(), ct);

            if (!exists)
            {
                var member = new Member(boardId, nickname, role);
                await _context.Set<Member>().AddAsync(member, ct);
                await _context.SaveChangesAsync(ct);
            }
        }
        public async Task AddElementAsync(Element element, CancellationToken ct = default)
        {
            await _context.Set<Element>().AddAsync(element, ct);
            await _context.SaveChangesAsync(ct);
        }
        public async Task UpdateAsync(Board board, CancellationToken ct = default)
        {
            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new DomainException("Could not save changes due to a data conflict. Please try again.");
            }
        }
        public async Task SaveMemberAsync(Guid boardId, string nickname, UserRole role, CancellationToken ct = default)
        {
            var exists = await _context.Set<Member>()
                .AnyAsync(m => m.BoardId == boardId &&
                          m.Nickname.ToLower() == nickname.ToLower(), ct);

            if (!exists)
            {
                var member = new Member(boardId, nickname, role);
                await _context.Set<Member>().AddAsync(member, ct);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var board = await GetByIdWithPagesAsync(id, ct);
            if (board != null)
            {
                _context.Boards.Remove(board);
                await _context.SaveChangesAsync(ct);
            }
        }
        public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Boards.AsNoTracking().AnyAsync(b => b.Id == id, ct);
        }
    }
}
