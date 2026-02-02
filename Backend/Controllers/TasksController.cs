using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TaskManagerApi.Services;

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
            public int SwimlaneId { get; set; } = 0; // Default swimlane
        }

        private readonly KanboardClient _kanboard;

        public TasksController(KanboardClient kanboard)
        {
            _kanboard = kanboard;
        }

        // ================= Create Task =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaskDto request)
        {
            if(request.project_id == -1)
                return BadRequest("Bad Project ID");

            var parameters = new Dictionary<string, object>
            {
                ["project_id"] = request.project_id,
                ["title"] = request.Title
            };

            if (!string.IsNullOrWhiteSpace(request.description))
                parameters["description"] = request.description;

            if (request.owner_id != null)
                parameters["owner_id"] = request.owner_id;
            else
                parameters["owner_id"] = 0;

            if (request.category_id != null)
                parameters["category_id"] = request.category_id;
            if (request.Tags != null && request.Tags.Length > 0)
                parameters["tags"] = request.Tags; // Kanboard expects array of strings

            if (!string.IsNullOrWhiteSpace(request.color_id))
                parameters["color_id"] = request.color_id;

            parameters["priority"] = request.priority;

            var taskIdJson = await _kanboard.CallAsync("createTask", parameters);

            if (taskIdJson.ValueKind == JsonValueKind.Number)
                return Ok(new { Id = taskIdJson.GetInt32() });

            return BadRequest("Failed to create task");
        }

        // ================= Update Task =================
        [HttpPut("{taskId}")]
        public async Task<IActionResult> Update(int taskId, [FromBody] Dictionary<string, object> updates)
        {
            updates["id"] = taskId;

            if (updates.TryGetValue("tags", out var tagsObj))
            {
                switch (tagsObj)
                {
                    case string s:
                        updates["tags"] = s.Split(',', StringSplitOptions.RemoveEmptyEntries);
                        break;
                    case IEnumerable<string> arr:
                        updates["tags"] = arr.ToArray();
                        break;
                    case null:
                        updates["tags"] = Array.Empty<string>();
                        break;
                    case JsonElement je when je.ValueKind == JsonValueKind.Array:
                        updates["tags"] = je.EnumerateArray().Select(e => e.GetString() ?? "").ToArray();
                        break;
                    default:
                        updates["tags"] = Array.Empty<string>();
                        break;

                }
            }

            var result = await _kanboard.CallAsync("updateTask", updates);

            if (result.ValueKind == JsonValueKind.True)
                return Ok(new { Success = true });
            else
                return BadRequest("Failed to update task");
        }

        // ================= Move Task Position =================
        [HttpPost("{taskId}/move")]
        public async Task<IActionResult> MoveTask(int taskId, [FromBody] MoveTaskRequest request)
        {
            var parameters = new Dictionary<string, object>
            {
                ["project_id"] = request.ProjectId,
                ["task_id"] = taskId,
                ["column_id"] = request.ColumnId,
                ["position"] = request.Position,
                ["swimlane_id"] = request.SwimlaneId
            };

            var result = await _kanboard.CallAsync("moveTaskPosition", parameters);

            if (result.ValueKind == JsonValueKind.True)
                return Ok(new { Success = true });
            else
                return BadRequest("Failed to move task");
        }

        // ================= Delete Task =================
        [HttpDelete("{taskId}")]
        public async Task<IActionResult> Delete(int taskId)
        {
            var resultJson = await _kanboard.CallAsync("removeTask", new { task_id = taskId });
            bool success = resultJson.ValueKind == JsonValueKind.True || resultJson.GetBoolean();
            return Ok(new { Success = success });
        }
    }
}