using Microsoft.AspNetCore.Mvc;
using System.Net.NetworkInformation;
using System.Text.Json;
using TaskProxyApi.Dtos;
using TaskProxyApi.Models;
using TaskProxyApi.Services;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly ProjectService _projects;
        private readonly UserService _users;
        private readonly LogService _logs;

        public ProjectsController(ProjectService projects, UserService users, LogService logs)
        {
            _projects = projects;
            _users = users;
            _logs = logs;
        }

        // ===================== GET =====================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _projects.GetAllAsync();
            var dtos = projects.Select(p => new ProjectDto(p)).ToList();

            return Ok(dtos);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _projects.GetByIdAsync(id);
            return project == null ? NotFound() : Ok(project);
        }

        // ================= Get Tasks by Project =================
        [HttpGet("{projectId}/tasks")]
        public async Task<IActionResult> GetTasks(int projectId)
        {
            var project = await _projects.GetByIdAsync(projectId);
            if (project == null) return NotFound();

            var taskList = project.Tasks.Select(t => new TaskDto(t)).ToArray();

            return Ok(taskList);
        }

        // ===================== CREATE =====================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Project dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = await _projects.CreateAsync(dto);
            await LogActionAsync("project.create", "Project", project.Id);

            // automatically add all users (like Kanboard default)
            var users = await _users.GetAllAsync();
            foreach (var user in users)
            {
                // For Kanboard compatibility, this could be a ProjectUser join table
                // For now, we can log or track default assignments if needed
            }

            return Ok(new { projectId = project.Id });
        }

        // ===================== UPDATE =====================
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Project dto)
        {
            if (id != dto.Id) return BadRequest();

            var success = await _projects.UpdateAsync(dto);
            if (success)
            {
                await LogActionAsync("project.update", "Project", dto.Id);
            }
            return success ? Ok() : NotFound();
        }

        // ===================== DELETE =====================
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _projects.DeleteAsync(id);
            if (success)
            {
                await LogActionAsync("project.delete", "Project", id);
            }
            return success ? Ok() : NotFound();
        }

        // ===================== ENABLE / DISABLE =====================
        [HttpPost("{id:int}/enable")]
        public async Task<IActionResult> Enable(int id)
        {
            var project = await _projects.GetByIdAsync(id);
            if (project == null) return NotFound();

            project.IsActive = true;
            await _projects.UpdateAsync(project);
            await LogActionAsync("project.enable", "Project", project.Id);
            return Ok();
        }

        [HttpPost("{id:int}/disable")]
        public async Task<IActionResult> Disable(int id)
        {
            var project = await _projects.GetByIdAsync(id);
            if (project == null) return NotFound();

            project.IsActive = false;
            await _projects.UpdateAsync(project);
            await LogActionAsync("project.disable", "Project", project.Id);
            return Ok();
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

        private async Task LogActionAsync(string action, string entity, int? entityId, string? metadata = null, User? actor = null)
        {
            actor ??= await GetAuthenticatedUserAsync();
            var actorName = actor?.Name ?? "Anonymous";
            await _logs.AddAsync(action, entity, entityId, actor?.Id, actorName, metadata);
        }
    }

}
