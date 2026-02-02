using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TaskManagerApi.Services;
using TaskProxyApi.Models;

namespace TaskProxyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly KanboardClient _kanboard;

        public UsersController(KanboardClient kanboard)
        {
            _kanboard = kanboard;
        }

        // ================= Get all users =================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _kanboard.CallAsync("getAllUsers");

            var result = users.EnumerateArray().Select(u =>
            {
                u.TryGetProperty("id", out var id);
                u.TryGetProperty("username", out var username);

                return new
                {
                    Id = id.GetInt32(),
                    Username = username.GetString()
                };
            });

            return Ok(result);
        }

        // ================= Get user by id =================
        [HttpGet("{userId}")]
        public async Task<IActionResult> Get(int userId)
        {
            var user = await _kanboard.CallAsync("getUser", new { user_id = userId });

            if (user.ValueKind == JsonValueKind.Null)
                return NotFound();

            return Ok(user);
        }

        // ================= Create user =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserDto request)
        {
            var result = await _kanboard.CallAsync("createUser", new
            {
                username = request.UserName,
                password = request.Password,
            });

            int userId = result.GetInt32();

            // 2️⃣ Get all existing projects
            var projectsJson = await _kanboard.CallAsync("getAllProjects");

            foreach (var project in projectsJson.EnumerateArray())
            {
                project.TryGetProperty("id", out var projectIdProp);
                if (projectIdProp.ValueKind != JsonValueKind.Number)
                    continue;

                int projectId = projectIdProp.GetInt32();

                // 3️⃣ Add user to project with default role "project-viewer"
                var addUserResult = await _kanboard.CallAsync("addProjectUser", new
                {
                    project_id = projectId,
                    user_id = userId,
                    role = "project-manager"  // optional
                });

                if (!addUserResult.GetBoolean())
                {
                    // optionally log this, but continue adding to other projects
                }
            }

            if (result.ValueKind == JsonValueKind.Number)
                return Ok(new { Id = result.GetInt32() });

            return BadRequest("Failed to create user");
        }

        // ================= Delete user =================
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(int userId)
        {
            var resultJson = await _kanboard.CallAsync("removeUser", new { user_id = userId });
            bool success = resultJson.ValueKind == JsonValueKind.True || resultJson.GetBoolean();
            return Ok(new { Success = success });
        }
    }
}
