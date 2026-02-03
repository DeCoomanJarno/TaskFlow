using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TaskProxyApi.Dtos;
using TaskProxyApi.Models;
using TaskProxyApi.Services;

namespace TaskProxyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _users;
        private readonly ProjectService _projects;
        private readonly LogService _logs;

        public UsersController(UserService users, ProjectService projects, LogService logs)
        {
            _users = users;
            _projects = projects;
            _logs = logs;
        }

        // ================= Get all users =================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _users.GetAllAsync();

            var result = users.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name
            });

            return Ok(result);
        }

        // ================= Get user by id =================
        [HttpGet("{userId:int}")]
        public async Task<IActionResult> Get(int userId)
        {
            var user = await _users.GetByIdAsync(userId);
            if (user == null) return NotFound();

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            });
        }

        // ================= Create user =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserRequest request)
        {
            var user = new User
            {
                Name = request.Name,
                Email = $"{request.Name}@local"
            };

            var created = await _users.CreateAsync(user);
            await LogActionAsync("user.create", "User", created.Id);

            // Kanboard behavior: add user to all projects
            var projects = await _projects.GetAllAsync();
            foreach (var project in projects)
            {
                // optional: project-user join table later
                // kept for compatibility
            }

            return Ok(new { Id = created.Id });
        }

        // ================= Delete user =================
        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> Delete(int userId)
        {
            var actor = await GetAuthenticatedUserAsync();
            if (actor == null)
            {
                return Forbid();
            }

            var success = await _users.DeleteAsync(userId);
            if (success)
            {
                await LogActionAsync("user.delete", "User", userId, null, actor);
            }
            return Ok(new { Success = success });
        }

        private int? GetUserIdFromHeader()
        {
            if (Request.Headers.TryGetValue("X-User-Id", out var value) &&
                int.TryParse(value.ToString(), out var userId) &&
                userId > 0)
            {
                return userId;
            }

            return null;
        }

        private async Task<User?> GetAuthenticatedUserAsync()
        {
            var userId = GetUserIdFromHeader();
            if (!userId.HasValue)
            {
                return null;
            }

            return await _users.GetByIdAsync(userId.Value);
        }

        private async System.Threading.Tasks.Task LogActionAsync(string action, string entity, int? entityId, string? metadata = null, User? actor = null)
        {
            actor ??= await GetAuthenticatedUserAsync();
            var actorName = actor?.Name ?? "Anonymous";
            await _logs.AddAsync(action, entity, entityId, actor?.Id, actorName, metadata);
        }
    }

    // ===== DTO kept for frontend compatibility =====
    public class UserRequest
    {
        public string Name { get; set; }
        public string Password { get; set; } // ignored, but required by frontend
    }
}
