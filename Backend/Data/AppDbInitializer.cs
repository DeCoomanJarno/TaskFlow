using Microsoft.EntityFrameworkCore;
using TaskProxyApi.Models;

namespace TaskProxyApi.Data
{
    public static class AppDbInitializer
    {
        public static void Initialize(AppDbContext db)
        {
             db.Database.Migrate();
        }
    }
}
