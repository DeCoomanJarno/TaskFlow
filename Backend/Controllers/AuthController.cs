using Microsoft.AspNetCore.Mvc;
using TaskProxyApi.Dtos;
using TaskProxyApi.Services;

namespace TaskProxyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _users;
        private readonly LogService _logs;

        public AuthController(UserService users, LogService logs)
        {
            _users = users;
            _logs = logs;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request.UserId <= 0)
            {
                return BadRequest("UserId is required.");
            }

            var user = await _users.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return NotFound();
            }

            await _logs.AddAsync("auth.login", "User", user.Id, user.Id, user.Name);

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            });
        }
    }

    public class LoginRequest
    {
        public int UserId { get; set; }
    }
}
