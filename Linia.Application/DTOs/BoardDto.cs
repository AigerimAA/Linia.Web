namespace Linia.Application.DTOs
{
    public class BoardDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int PagesCount { get; set; }
        public int MembersCount { get; set; }
        public List<BoardPageDto> Pages { get; set; } = new();
    }
}
