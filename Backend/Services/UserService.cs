using Microsoft.EntityFrameworkCore;
using TaskProxyApi.Data;
using TaskProxyApi.Models;

namespace TaskProxyApi.Services
{
    public class UserService
    {
        private readonly AppDbContext _db;
        public UserService(AppDbContext db) => _db = db;

        public async Task<List<User>> GetAllAsync() => await _db.Users.ToListAsync();
        public async Task<User> GetByIdAsync(int id) => await _db.Users.FindAsync(id);

        public async Task<User> CreateAsync(User user)
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateAsync(User user)
        {
            if (!await _db.Users.AnyAsync(u => u.Id == user.Id)) return false;
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return false;

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
