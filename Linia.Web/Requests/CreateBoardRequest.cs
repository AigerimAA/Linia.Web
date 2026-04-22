using Linia.Application.Commands.CreateBoard;

namespace Linia.API.Requests
{
    public record CreateBoardRequest(string Name)
    {
        public CreateBoardCommand ToCommand(string trustedNickname) =>
            new(Name, trustedNickname);
    }
}
