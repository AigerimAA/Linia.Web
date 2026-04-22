using MediatR;
using Microsoft.AspNetCore.Mvc;
using Linia.Application.Interfaces;
using Linia.Application.Commands.AddPage;
using Linia.Application.Commands.DeletePage;

namespace Linia.API.Controllers
{
    [ApiController]
    [Route("api/boards/{boardId}/pages")]
    public class PagesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUser;

        public PagesController(IMediator mediator, ICurrentUserService currentUser)
        {
            _mediator = mediator;
            _currentUser = currentUser;
        }

        [HttpPost]
        public async Task<IActionResult> AddPage(Guid boardId)
        {
            var command = new AddPageCommand(boardId, _currentUser.Nickname);
            var pageId = await _mediator.Send(command);
            return Created($"/api/boards/{boardId}/pages/{pageId}", new { pageId });
        }

        [HttpDelete("{pageId}")]
        public async Task<IActionResult> DeletePage(Guid boardId, Guid pageId)
        {
            var command = new DeletePageCommand(boardId, pageId, _currentUser.Nickname);
            await _mediator.Send(command);
            return NoContent();
        }
    }
}
