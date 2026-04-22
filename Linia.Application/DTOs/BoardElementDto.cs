namespace Linia.Application.DTOs
{
    public class BoardElementDto
    {
        public Guid Id { get; set; }
        public Guid BoardId { get; set; }
        public Guid PageId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string JsonData { get; set; } = string.Empty;        
        public string AuthorNickname { get; set; } = string.Empty;
        public int ZIndex { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
