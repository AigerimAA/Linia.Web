using Linia.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linia.Infrastructure.Persistence.Configurations
{
    public class BoardPageConfiguration : IEntityTypeConfiguration<Page>
    {
        public void Configure(EntityTypeBuilder<Page> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Order).IsRequired();
            builder.Property(p => p.ThumbnailUrl).HasMaxLength(500);

            builder.HasMany(p => p.Elements)
                .WithOne()
                .HasForeignKey(e => e.PageId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(p => new { p.BoardId, p.Order }).IsUnique();
        }
    }
}
