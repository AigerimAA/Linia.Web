using Linia.API.Requests;
using Linia.Application.Commands.ChangeMemberRole;
using Linia.Application.Commands.CreateBoard;
using Linia.Application.Commands.DeleteBoard;
using Linia.Application.Commands.UpdateBoardThumbnail;
using Linia.Application.DTOs;
using Linia.Application.Interfaces;
using Linia.Application.Queries.GetBoard;
using Linia.Application.Queries.GetBoardList;
using Linia.Infrastructure.Repositories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Linia.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUser;

        public BoardController(IMediator mediator, ICurrentUserService currentUser)
        {
            _mediator = mediator;
            _currentUser = currentUser;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<BoardListItemDto>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var boards = await _mediator.Send(new GetBoardListQuery());
            return Ok(boards);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(BoardDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var board = await _mediator.Send(new GetBoardQuery(id));
            if (board == null) return NotFound();
            return Ok(board);
        }

        [HttpPost]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> Create([FromBody] CreateBoardRequest request)
        {
            var command = new CreateBoardCommand(request.Name, _currentUser.Nickname);
            var boardId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = boardId }, new { boardId });
        }

        [HttpPatch("{id}/thumbnail")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateThumbnail(Guid id, [FromBody] UpdateThumbnailRequest request)
        {
            var command = new UpdateBoardThumbnailCommand(id, request.ThumbnailUrl, _currentUser.Nickname);
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpPatch("{id}/members/{nickname}/role")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> ChangeRole(Guid id, string nickname, [FromBody] ChangeRoleRequest request)
        {
            var command = new ChangeMemberRoleCommand(id, nickname, request.Role, _currentUser.Nickname);
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _mediator.Send(new DeleteBoardCommand(id));
            return NoContent();
        }
    }
}
