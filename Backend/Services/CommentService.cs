using System;
using Microsoft.EntityFrameworkCore;
using TaskProxyApi.Data;
using TaskProxyApi.Models;

namespace TaskProxyApi.Services
{
    public class CommentService
    {
        private readonly AppDbContext _db;

        public CommentService(AppDbContext db) => _db = db;

        public async Task<List<Comment>> GetByTaskIdAsync(int taskId)
        {
            return await _db.Comments
                .Where(c => c.TaskId == taskId)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Comment?> AddToTaskAsync(int taskId, string text, int? userId)
        {
            var taskExists = await _db.Tasks.AnyAsync(t => t.Id == taskId);
            if (!taskExists)
            {
                return null;
            }

            var comment = new Comment
            {
                TaskId = taskId,
                Text = text.Trim(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();

            return await _db.Comments
                .Include(c => c.User)
                .FirstAsync(c => c.Id == comment.Id);
        }

        public async Task<bool> DeleteAsync(int taskId, int commentId)
        {
            var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.TaskId == taskId);
            if (comment == null)
            {
                return false;
            }

            _db.Comments.Remove(comment);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
