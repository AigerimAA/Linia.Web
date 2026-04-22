using Linia.Domain.Common;
using Linia.Domain.Entities;
using Linia.Domain.Enums;
using Linia.Domain.Events;
using System.Linq;
using Linia.Domain.ValueObjects;

namespace Linia.Domain.Aggregates
{
    public class Board : BaseEntity
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string? ThumbnailUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public string OwnerNickname { get; private set; }

        private readonly List<Page> _pages = new();
        private readonly List<Member> _members = new();

        public IReadOnlyCollection<Page> Pages => _pages.AsReadOnly();
        public IReadOnlyCollection<Member> Members => _members.AsReadOnly();

        private Board() { }

        public Board(string name, string creatorNickname)
        {
            Id = Guid.NewGuid();
            Name = name;
            OwnerNickname = creatorNickname;
            CreatedAt = DateTime.UtcNow;
            _pages.Add(new Page(Id, 1));
            _members.Add(new Member(Id, creatorNickname, UserRole.Admin));
        }

        public Page AddPage()
        {
            var page = new Page(Id, _pages.Count + 1);
            _pages.Add(page);
            AddDomainEvent(new BoardPageAddedEvent(Id, page.Id, page.Order));
            return page;
        }
        public bool TryRemovePage(Guid pageId)
        {
            if (_pages.Count == 1) return false;
            var page = _pages.FirstOrDefault(p => p.Id == pageId);
            if (page == null) return false;
            _pages.Remove(page);
            AddDomainEvent(new BoardPageRemovedEvent(Id, page.Id));
            return true;
        }
        public Member AddMember(string nickname, UserRole role = UserRole.Editor)
        {
            if (string.IsNullOrWhiteSpace(nickname) || nickname.Length > 50)
                throw new DomainException("Invalid nickname");

            var existing = _members.FirstOrDefault(m =>
                m.Nickname.Equals(nickname, StringComparison.OrdinalIgnoreCase));
            if (existing != null) return existing;

            var member = new Member(Id, nickname, role);
            _members.Add(member);
            AddDomainEvent(new MemberJoinedEvent(Id, nickname));
            return member;
        }
        public Element AddElementToPage(Guid pageId, ElementType type,
            string jsonData, string authorNickname, int zIndex = 0)
        {
            var page = _pages.FirstOrDefault(p => p.Id == pageId)
                ?? throw new DomainException("Page not found");

            var element = page.AddElement(type, jsonData, authorNickname, zIndex);

            AddDomainEvent(new ElementAddedEvent(
                Id, pageId, element.Id, jsonData, authorNickname, type, zIndex, element.CreatedAt
            ));

            return element; 
        }
        public bool TryChangeMemberRole(string targetNickname, UserRole newRole, string requestedBy)
        {
            if (!CanUserManage(requestedBy))
                throw new DomainException("Only admin can change roles");

            var member = _members.FirstOrDefault(m =>
                m.Nickname.Equals(targetNickname, StringComparison.OrdinalIgnoreCase));
            if (member == null) return false;

            member.ChangeRole(newRole);
            return true;
        }
        public bool TryRemoveElementFromPage(Guid pageId, Guid elementId, string requestedBy)
        {
            var page = _pages.FirstOrDefault(p => p.Id == pageId);
            if (page == null) return false;

            if (!page.TryRemoveElement(elementId)) return false;
            AddDomainEvent(new ElementRemovedEvent(Id, pageId, elementId, requestedBy));
            return true;
        }
        public bool TryRemoveMember(string nickname)
        {
            var member = _members.FirstOrDefault(m => m.Nickname.Equals(nickname, StringComparison.OrdinalIgnoreCase));
            if (member == null) return false;

            _members.Remove(member);
            AddDomainEvent(new MemberLeftEvent(Id, nickname));
            return true;
        }

        public void ClearPage(Guid pageId, string requestedBy)
        {
            var page = _pages.FirstOrDefault(p => p.Id == pageId);
            if (page == null) throw new DomainException("Page not found");

            page.ClearAllElements();
            AddDomainEvent(new PageClearedEvent(Id, pageId, requestedBy));
        }
        public bool CanUserEdit(string nickname)
        {
            var member = _members.FirstOrDefault(m => m.Nickname == nickname);
            return member?.Role is UserRole.Editor or UserRole.Admin;
        }
        public bool CanUserManage(string nickname)
        {
            var member = _members.FirstOrDefault(m => m.Nickname == nickname);
            return member?.Role is UserRole.Admin;
        }
        public void UpdateName(string newName)
        {
            if (string.IsNullOrWhiteSpace(newName) || newName.Length > 200)
                throw new DomainException("Invalid board name");
            Name = newName;
        }
        public void UpdateThumbnail(string url) => ThumbnailUrl = url;
    }
}
