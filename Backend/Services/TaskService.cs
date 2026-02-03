using Microsoft.EntityFrameworkCore;
using TaskProxyApi.Data;
using Task = TaskProxyApi.Models.Task;


namespace TaskProxyApi.Services
{
    public class TaskService
    {
        private readonly AppDbContext _db;
        public TaskService(AppDbContext db) => _db = db;

        public async Task<List<Task>> GetAllByProjectAsync(int projectId) =>
            await _db.Tasks
                     .Where(t => t.ProjectId == projectId)
                     .Include(t => t.AssignedUser)
                     .OrderBy(t => t.Order)
                     .ToListAsync();

        public async Task<Task> GetByIdAsync(int id) =>
            await _db.Tasks.Include(t => t.AssignedUser).FirstOrDefaultAsync(t => t.Id == id);

        public async Task<Task> CreateAsync(Task task)
        {
            // Set order if not specified
            if (task.Order == 0)
            {
                var maxOrder = await _db.Tasks
                                        .Where(t => t.ProjectId == task.ProjectId)
                                        .MaxAsync(t => (int?)t.Order) ?? 0;
                task.Order = maxOrder + 1;
            }

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();
            return task;
        }

        public async Task<bool> UpdateAsync(Task task)
        {
            if (!await _db.Tasks.AnyAsync(t => t.Id == task.Id))
                return false;

            _db.Tasks.Update(task);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task == null) return false;

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();
            return true;
        }

        // Optional: move task order or column
        public async Task<bool> MoveTaskAsync(int taskId, int newColumn, int newOrder)
        {
            var task = await _db.Tasks.FindAsync(taskId);
            if (task == null) return false;

            task.ColumnId = newColumn;
            task.Order = newOrder;
            _db.Tasks.Update(task);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
