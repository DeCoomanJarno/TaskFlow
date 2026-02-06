using Microsoft.EntityFrameworkCore;
using TaskProxyApi.Data;
using TaskProxyApi.Models;

namespace TaskProxyApi.Services
{
    public class ProjectService
    {
        private readonly AppDbContext _db;

        public ProjectService(AppDbContext db) => _db = db;

        public async Task<List<Project>> GetAllAsync() =>
            await _db.Projects
                .Include(p => p.Categories)
                .ToListAsync();

        public async Task<Project> GetByIdAsync(int id) =>
            await _db.Projects
                .Include(p => p.Categories)
                .ThenInclude(c => c.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<Project> CreateAsync(Project project)
        {
            _db.Projects.Add(project);
            await _db.SaveChangesAsync();
            return project;
        }

        public async Task<bool> UpdateAsync(Project project)
        {
            if (!await _db.Projects.AnyAsync(p => p.Id == project.Id))
                return false;

            _db.Projects.Update(project);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null) return false;

            _db.Projects.Remove(project);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
