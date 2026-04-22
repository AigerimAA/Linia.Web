namespace Linia.Infrastructure.SignalR
{
    public record DrawElementRequest(
            Guid BoardId,
            Guid PageId,
            string Type,
            string JsonData,
            int ZIndex);
}
