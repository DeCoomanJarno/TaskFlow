using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TaskProxyApi.Services;
using TaskProxyApi.Models;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        public class MoveTaskRequest
        {
            public int ProjectId { get; set; }
            public int ColumnId { get; set; }
            public int Position { get; set; }
            public int SwimlaneId { get; set; } = 0; // ignored but kept for compatibility
        }

        private readonly TaskService _tasks;
        private readonly ProjectService _projects;

        public TasksController(TaskService tasks, ProjectService projects)
        {
            _tasks = tasks;
            _projects = projects;
        }

        // ================= Create Task =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JsonElement request)
        {
            if (!request.TryGetProperty("projectId", out var projectIdProp))
                return BadRequest("Missing projectId");

            int projectId = projectIdProp.GetInt32();
            if (projectId <= 0)
                return BadRequest("Bad Project ID");

            var project = await _projects.GetByIdAsync(projectId);
            if (project == null)
                return NotFound("Project not found");

            var task = new TaskProxyApi.Models.Task
            {
                ProjectId = projectId,
                Title = request.TryGetProperty("title", out var t) && t.ValueKind == JsonValueKind.String
                    ? t.GetString()!
                    : "Untitled",

                Description = request.TryGetProperty("description", out var d) && d.ValueKind == JsonValueKind.String
                    ? d.GetString()
                    : "",

                AssignedUserId =
                    request.TryGetProperty("assignedUserId", out var o) &&
                    o.ValueKind == JsonValueKind.Number &&
                    o.GetInt32() > 0
                        ? o.GetInt32()
                        : null,

                Priority =
                    request.TryGetProperty("priority", out var p) &&
                    p.ValueKind == JsonValueKind.Number
                        ? p.GetInt32()
                        : 0,

                ColumnId = 0
            };


            var created = await _tasks.CreateAsync(task);
            return Ok(new { Id = created.Id });
        }

        // ================= Update Task =================
        [HttpPut("{taskId:int}")]
        public async Task<IActionResult> Update(int taskId, [FromBody] Dictionary<string, object> updates)
        {
            var task = await _tasks.GetByIdAsync(taskId);
            if (task == null)
                return NotFound();

            if (updates.TryGetValue("title", out var title))
                task.Title = title?.ToString() ?? task.Title;

            if (updates.TryGetValue("description", out var desc))
                task.Description = desc?.ToString();

            if (updates.TryGetValue("assignedUserId", out var owner))
            {
                switch (owner)
                {
                    case JsonElement je when je.ValueKind == JsonValueKind.Number:
                        var ownerId = je.GetInt32();
                        task.AssignedUserId = ownerId == 0 ? null : ownerId;
                        break;

                    case int intOwner:  // in case someone passed int directly
                        task.AssignedUserId = intOwner == 0 ? null : intOwner;
                        break;

                    default:
                        task.AssignedUserId = null;
                        break;
                }
            }


            if (updates.TryGetValue("priority", out var prioObj))
            {
                if (prioObj is JsonElement prioEl && prioEl.ValueKind == JsonValueKind.Number)
                {
                    task.Priority = prioEl.GetInt32();
                }
            }

            // tags are ignored for now, but endpoint accepts them
            await _tasks.UpdateAsync(task);
            return Ok(new { Success = true });
        }

        // ================= Move Task Position =================
        [HttpPost("{taskId:int}/move")]
        public async Task<IActionResult> MoveTask(int taskId, [FromBody] MoveTaskRequest request)
        {
            var task = await _tasks.GetByIdAsync(taskId);
            if (task == null)
                return NotFound();

            task.ColumnId = request.ColumnId;
            task.Order = request.Position;

            await _tasks.UpdateAsync(task);
            return Ok(new { Success = true });
        }

        // ================= Delete Task =================
        [HttpDelete("{taskId:int}")]
        public async Task<IActionResult> Delete(int taskId)
        {
            var success = await _tasks.DeleteAsync(taskId);
            return Ok(new { Success = success });
        }
    }
}