using Microsoft.AspNetCore.Mvc;
using TaskProxyApi.Dtos;
using TaskProxyApi.Models;
using TaskProxyApi.Services;

namespace TaskManagerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categories;
        private readonly ProjectService _projects;
        private readonly TaskService _tasks;
        private readonly LogService _logs;
        private readonly UserService _users;

        public CategoriesController(CategoryService categories, ProjectService projects, TaskService tasks, LogService logs, UserService users)
        {
            _categories = categories;
            _projects = projects;
            _tasks = tasks;
            _logs = logs;
            _users = users;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? projectId)
        {
            var categories = await _categories.GetAllAsync(projectId);
            return Ok(categories.Select(c => new CategoryDto(c)));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categories.GetByIdAsync(id);
            return category == null ? NotFound() : Ok(new CategoryDto(category));
        }

        [HttpGet("{categoryId:int}/tasks")]
        public async Task<IActionResult> GetTasks(int categoryId)
        {
            var category = await _categories.GetByIdAsync(categoryId);
            if (category == null)
            {
                return NotFound();
            }

            var tasks = await _tasks.GetAllByCategoryAsync(categoryId);
            return Ok(tasks.Select(t => new TaskDto(t)));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var project = await _projects.GetByIdAsync(category.ProjectId);
            if (project == null)
            {
                return NotFound("Project not found");
            }

            var created = await _categories.CreateAsync(category);
            await LogActionAsync("category.create", "Category", created.Id);
            return Ok(new { categoryId = created.Id });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Category category)
        {
            if (id != category.Id)
            {
                return BadRequest();
            }

            var success = await _categories.UpdateAsync(category);
            if (success)
            {
                await LogActionAsync("category.update", "Category", category.Id);
            }
            return success ? Ok() : NotFound();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _categories.DeleteAsync(id);
            if (success)
            {
                await LogActionAsync("category.delete", "Category", id);
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
