using Microsoft.EntityFrameworkCore;
using TaskProxyApi.Data;
using TaskProxyApi.Models;

namespace TaskProxyApi.Services
{
    public class CategoryService
    {
        private readonly AppDbContext _db;

        public CategoryService(AppDbContext db) => _db = db;

        public async Task<List<Category>> GetAllAsync(int? projectId = null)
        {
            var query = _db.Categories.AsQueryable();
            if (projectId.HasValue)
            {
                query = query.Where(c => c.ProjectId == projectId.Value);
            }

            return await query
                .Include(c => c.Tasks)
                .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(int id) =>
            await _db.Categories
                .Include(c => c.Tasks)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Category> CreateAsync(Category category)
        {
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return category;
        }

        public async Task<bool> UpdateAsync(Category category)
        {
            if (!await _db.Categories.AnyAsync(c => c.Id == category.Id))
            {
                return false;
            }

            _db.Categories.Update(category);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null)
            {
                return false;
            }

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
