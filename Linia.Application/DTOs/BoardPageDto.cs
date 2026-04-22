namespace Linia.Application.DTOs
{
    public class BoardPageDto
    {
        public Guid Id { get; set; }
        public int Order { get; set; }
        public string? ThumbnailUrl { get; set; }
        public List<BoardElementDto> Elements { get; set; } = new();
    }
}
