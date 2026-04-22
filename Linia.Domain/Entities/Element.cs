using Linia.Domain.Common;
using Linia.Domain.Enums;
using Linia.Domain.Events;
using Linia.Domain.ValueObjects;

namespace Linia.Domain.Entities
{
    public class Element
    {
        public Guid Id { get; private set; }
        public Guid PageId { get; private set; }
        public ElementType Type { get; private set; }
        public string JsonData { get; private set; }
        public string AuthorNickname { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public int ZIndex { get; private set; }
        

        private Element() { }
        public Element(Guid pageId, ElementType type, string jsonData,
                string authorNickname, int zIndex = 0)
        {
            if (string.IsNullOrWhiteSpace(jsonData))
                throw new DomainException("JsonData cannot be empty");
            if (string.IsNullOrWhiteSpace(authorNickname))
                throw new DomainException("AuthorNickname is required");
            
            Id = Guid.NewGuid();
            PageId = pageId;
            Type = type;
            JsonData = jsonData;
            AuthorNickname = authorNickname;
            ZIndex = zIndex;
            CreatedAt = DateTime.UtcNow;
        }

    }
}
