using Linia.Domain.Common;
using Linia.Domain.Enums;


namespace Linia.Domain.Entities
{
    public class Page
    {
        public Guid Id { get; private set; }
        public Guid BoardId { get; private set; }
        public int Order { get; private set; }
        public string? ThumbnailUrl { get; private set; }

        private readonly List<Element> _elements = new();
        public IReadOnlyCollection<Element> Elements => _elements.AsReadOnly();

        private Page() { }
        public Page(Guid boardId, int order)
        {
            Id = Guid.NewGuid();
            BoardId = boardId;
            Order = order;
        }

        public Element AddElement(ElementType type, string jsonData, string authorNickname, int zIndex = 0)
        {
            if (string.IsNullOrWhiteSpace(jsonData))
                throw new DomainException("JsonData cannot be empty");
            if (string.IsNullOrWhiteSpace(authorNickname))
                throw new DomainException("AuthorNickname is required");

            var element = new Element(Id, type, jsonData, authorNickname, zIndex);
            _elements.Add(element);
            return element;
        }
        public bool TryRemoveElement(Guid elementId)
        {
            var element = _elements.FirstOrDefault(e => e.Id == elementId);
            if (element == null) return false;
            _elements.Remove(element);
            return true;
        }
        public void ClearAllElements()
        {
            _elements.Clear();
        }
    }
}
