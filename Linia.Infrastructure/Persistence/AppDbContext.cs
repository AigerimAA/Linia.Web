using System.Reflection;
using Linia.Domain.Aggregates;
using Linia.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Linia.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<Board> Boards { get; set; }
        public DbSet<Page> Pages { get; set; }
        public DbSet<Element> Elements { get; set; }
        public DbSet<Member> Members { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            modelBuilder.Entity<Board>(entity =>
            {
                entity.Metadata.FindNavigation(nameof(Board.Pages))?.SetField("_pages");
                entity.Metadata.FindNavigation(nameof(Board.Members))?.SetField("_members");
            });

            modelBuilder.Entity<Page>(entity =>
            {
                entity.Metadata.FindNavigation(nameof(Page.Elements))?.SetField("_elements");
            });
        }
    }
}
