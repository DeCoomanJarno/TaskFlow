using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TaskProxyApi.Data;
using TaskProxyApi.Models;

namespace TaskProxyApi.Services
{
    public class LogService
    {
        private readonly AppDbContext _db;
        private readonly AuditLogSettings _settings;

        public LogService(AppDbContext db, IOptions<AuditLogSettings> settings)
        {
            _db = db;
            _settings = settings.Value;
        }

        public async Task<LogEntry> AddAsync(string action, string entity, int? entityId, int? userId, string actor, string? metadata = null)
        {
            var entry = new LogEntry
            {
                Action = action,
                Entity = entity,
                EntityId = entityId,
                UserId = userId,
                Actor = string.IsNullOrWhiteSpace(actor) ? "Anonymous" : actor,
                Metadata = metadata,
                CreatedAt = DateTime.UtcNow
            };

            _db.LogEntries.Add(entry);
            await PurgeOldAsync();
            await _db.SaveChangesAsync();
            return entry;
        }

        private async Task PurgeOldAsync()
        {
            var retentionDays = _settings.RetentionDays <= 0 ? 1 : _settings.RetentionDays;
            var cutoff = DateTime.UtcNow.AddDays(-retentionDays);
            var stale = await _db.LogEntries
                .Where(l => l.CreatedAt < cutoff)
                .ToListAsync();

            if (stale.Count > 0)
            {
                _db.LogEntries.RemoveRange(stale);
            }
        }
    }
}
