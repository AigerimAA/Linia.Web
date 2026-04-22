using System;
using System.Collections.Generic;
using System.Text;
using Linia.Domain.Enums;

namespace Linia.Domain.Entities
{
    public class Member
    {
        public Guid Id { get; private set; }
        public Guid BoardId { get; private set; }
        public string Nickname { get; private set; }
        public UserRole Role { get; private set; }

        private Member() { }
        public Member(Guid boardId, string nickname, UserRole role)
        {
            Id = Guid.NewGuid();
            BoardId = boardId;
            Nickname = nickname;
            Role = role;
        }

        public void ChangeRole(UserRole newRole) => Role = newRole;
    }
}
