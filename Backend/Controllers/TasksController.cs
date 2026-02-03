using Microsoft.AspNetCore.Mvc;
using System.Linq;
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

        public class CreateCommentRequest
        {
            public string Text { get; set; } = string.Empty;
        }

        private readonly TaskService _tasks;
        private readonly ProjectService _projects;
        private readonly CommentService _comments;
        private readonly UserService _users;
        private readonly LogService _logs;

        public TasksController(TaskService tasks, ProjectService projects, CommentService comments, UserService users, LogService logs)
        {
            _tasks = tasks;
            _projects = projects;
            _comments = comments;
            _users = users;
            _logs = logs;
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
            await LogActionAsync("task.create", "Task", created.Id);
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
            await LogActionAsync("task.update", "Task", task.Id);
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
            await LogActionAsync("task.move", "Task", task.Id, $"columnId={request.ColumnId},position={request.Position}");
            return Ok(new { Success = true });
        }

        // ================= Delete Task =================
        [HttpDelete("{taskId:int}")]
        public async Task<IActionResult> Delete(int taskId)
        {
            var actor = await GetAuthenticatedUserAsync();
            if (actor == null)
            {
                return Forbid();
            }

            var success = await _tasks.DeleteAsync(taskId);
            if (success)
            {
                await LogActionAsync("task.delete", "Task", taskId, null, actor);
            }
            return Ok(new { Success = success });
        }

        [HttpGet("{taskId:int}/comments")]
        public async Task<IActionResult> GetComments(int taskId)
        {
            var task = await _tasks.GetByIdAsync(taskId);
            if (task == null)
            {
                return NotFound();
            }

            var comments = await _comments.GetByTaskIdAsync(taskId);
            var dtos = comments.Select(c => new TaskProxyApi.Dtos.CommentDto(c));
            return Ok(dtos);
        }

        [HttpPost("{taskId:int}/comments")]
        public async Task<IActionResult> AddComment(int taskId, [FromBody] CreateCommentRequest request)
        {
            var actor = await GetAuthenticatedUserAsync();
            if (actor == null)
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest("Comment text is required.");
            }

            var comment = await _comments.AddToTaskAsync(taskId, request.Text, actor.Id);
            if (comment == null)
            {
                return NotFound();
            }

            await LogActionAsync("comment.add", "TaskComment", comment.Id, $"taskId={taskId}", actor);
            return Ok(new TaskProxyApi.Dtos.CommentDto(comment));
        }

        [HttpDelete("{taskId:int}/comments/{commentId:int}")]
        public async Task<IActionResult> DeleteComment(int taskId, int commentId)
        {
            var actor = await GetAuthenticatedUserAsync();
            if (actor == null)
            {
                return Forbid();
            }

            var success = await _comments.DeleteAsync(taskId, commentId);
            if (success)
            {
                await LogActionAsync("comment.delete", "TaskComment", commentId, $"taskId={taskId}", actor);
            }
            return success ? Ok() : NotFound();
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
}
