using Linia.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Linia.Infrastructure.Persistence.Configurations
{
    public class BoardElementConfiguration : IEntityTypeConfiguration<Element>
    {
        public void Configure(EntityTypeBuilder<Element> builder)
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.JsonData).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(e => e.AuthorNickname).IsRequired().HasMaxLength(50);
            builder.Property(e => e.Type).IsRequired();

            builder.HasIndex(e => e.PageId);
            builder.HasIndex(e => e.AuthorNickname);
            builder.HasIndex(e => e.CreatedAt);
            builder.HasIndex(e => new { e.PageId, e.ZIndex });
        }
    }
}
