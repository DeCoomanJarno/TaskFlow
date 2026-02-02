using Microsoft.AspNetCore.Mvc;
using System.Net.NetworkInformation;
using System.Text.Json;
using TaskManagerApi.Services;
using TaskProxyApi.Models.project;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly KanboardClient _kanboard;

        public ProjectsController(KanboardClient kanboard)
        {
            _kanboard = kanboard;
        }

        // ===================== GET =====================

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _kanboard.CallAsync("getAllProjects");
            return Ok(projects);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _kanboard.CallAsync(
                "getProjectById",
                new { project_id = id }
            );

            return project.ValueKind == JsonValueKind.Null
                ? NotFound()
                : Ok(project);
        }

        // ================= Get Tasks by Project =================
        [HttpGet("{projectId}/tasks")]
        public async Task<IActionResult> GetTasks(int projectId)
        {
            var tasksJson = await _kanboard.CallAsync("getAllTasks", new { project_id = projectId });

            var taskList = tasksJson.EnumerateArray().Select(t =>
            {
                t.TryGetProperty("id", out var idProp);
                t.TryGetProperty("title", out var titleProp);
                t.TryGetProperty("description", out var descProp);
                t.TryGetProperty("color_id", out var colorProp);
                t.TryGetProperty("project_id", out var projectProp);
                t.TryGetProperty("category_id", out var catProp);
                t.TryGetProperty("column_id", out var colProp);
                t.TryGetProperty("owner_id", out var ownerProp);
                t.TryGetProperty("is_active", out var activeProp);
                t.TryGetProperty("date_creation", out var creationProp);
                t.TryGetProperty("date_completed", out var completedProp);
                t.TryGetProperty("date_modification", out var modProp);
                t.TryGetProperty("priority", out var prioProp);
                t.TryGetProperty("tags", out var tagsProp);

                var tags = tagsProp.ValueKind == JsonValueKind.Array
                    ? tagsProp.EnumerateArray().Select(tag => tag.GetString() ?? "").ToArray()
                    : Array.Empty<string>();

                return new
                {
                    Id = idProp.GetInt32(),
                    Title = titleProp.GetString() ?? "Untitled",
                    Description = descProp.GetString() ?? "",
                    Color_id = colorProp.GetString() ?? "",
                    Project_id = projectProp.ValueKind != JsonValueKind.Null ? projectProp.GetInt32() : 0,
                    Category_id = catProp.ValueKind != JsonValueKind.Null ? catProp.GetInt32() : 0,
                    Column_id = colProp.ValueKind != JsonValueKind.Null ? colProp.GetInt32() : 0,
                    Owner_id = ownerProp.ValueKind != JsonValueKind.Null ? ownerProp.GetInt32() : 0,
                    Is_active = activeProp.ValueKind != JsonValueKind.Null ? activeProp.GetInt32() : 0,
                    Date_creation = creationProp.ValueKind != JsonValueKind.Null ? creationProp.GetInt32() : 0,
                    Date_completed = completedProp.ValueKind != JsonValueKind.Null ? completedProp.GetInt32() : 0,
                    Date_modification = modProp.ValueKind != JsonValueKind.Null ? modProp.GetInt32() : 0,
                    Priority = prioProp.ValueKind != JsonValueKind.Null ? prioProp.GetInt32() : 0,
                    Tags = tags
                };
            }).ToArray();

            return Ok(taskList);
        }

        // ===================== CREATE =====================

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            var result = await _kanboard.CallAsync("createProject", dto);

            if (result.ValueKind == JsonValueKind.False)
                return BadRequest("Failed to create project");

            int projectId = result.GetInt32();

            var userjsons = await _kanboard.CallAsync("getAllUsers");

            var users = userjsons.EnumerateArray().Select(u =>
            {
                u.TryGetProperty("id", out var id);
                u.TryGetProperty("username", out var username);

                return new
                {
                    Id = id.GetInt32(),
                    Username = username.GetString()
                };
            }).ToList();

            foreach (var user in users)
            {
                var addUserResult = await _kanboard.CallAsync(
                    "addProjectUser",
                    new
                    {
                        project_id = projectId,
                        user_id = user.Id,          // <-- set the default user ID
                        role = "project-manager"  // optional: "project-manager", etc.
                    }
                );
            }
            
            return Ok(new { project_id = result.GetInt32() });
        }

        // ===================== UPDATE =====================

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
        {
            dto.project_id = id;

            var result = await _kanboard.CallAsync("updateProject", dto);

            return result.GetBoolean()
                ? Ok()
                : BadRequest("Failed to update project");
        }

        // ===================== DELETE =====================

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _kanboard.CallAsync(
                "removeProject",
                new { project_id = id }
            );

            return result.GetBoolean()
                ? Ok()
                : BadRequest("Failed to remove project");
        }

        // ===================== ENABLE / DISABLE =====================

        [HttpPost("{id:int}/enable")]
        public async Task<IActionResult> Enable(int id)
        {
            var result = await _kanboard.CallAsync("enableProject", new[] { id.ToString() });
            return result.GetBoolean() ? Ok() : BadRequest();
        }

        [HttpPost("{id:int}/disable")]
        public async Task<IActionResult> Disable(int id)
        {
            var result = await _kanboard.CallAsync("disableProject", new[] { id.ToString() });
            return result.GetBoolean() ? Ok() : BadRequest();
        }

        [HttpPost("{id:int}/public/enable")]
        public async Task<IActionResult> EnablePublic(int id)
        {
            var result = await _kanboard.CallAsync("enableProjectPublicAccess", new[] { id.ToString() });
            return result.GetBoolean() ? Ok() : BadRequest();
        }

        [HttpPost("{id:int}/public/disable")]
        public async Task<IActionResult> DisablePublic(int id)
        {
            var result = await _kanboard.CallAsync("disableProjectPublicAccess", new[] { id.ToString() });
            return result.GetBoolean() ? Ok() : BadRequest();
        }

        
    }

}
