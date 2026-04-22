namespace Linia.Application.DTOs
{
    public class CursorDto
    {
        public Guid BoardId { get; set; }
        public string Nickname { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
    }
}
