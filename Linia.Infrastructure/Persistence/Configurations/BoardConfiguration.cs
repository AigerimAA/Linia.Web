using Linia.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linia.Infrastructure.Persistence.Configurations
{
    public class BoardConfiguration : IEntityTypeConfiguration<Board>
    {
        public void Configure(EntityTypeBuilder<Board> builder)
        {
            builder.HasKey(b => b.Id);
            builder.Property(b => b.Name).IsRequired().HasMaxLength(200);
            builder.Property(b => b.OwnerNickname).IsRequired().HasMaxLength(50);
            builder.Property(b => b.ThumbnailUrl).HasColumnType("text");

            builder.HasMany(b => b.Pages)
                .WithOne()
                .HasForeignKey(p => p.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(b => b.Members)
                .WithOne()
                .HasForeignKey(m => m.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(b => b.OwnerNickname);
            builder.HasIndex(b => b.CreatedAt);
        }
    }
}
