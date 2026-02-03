using System;
using System.Linq;
using Task = TaskProxyApi.Models.Task;

namespace TaskProxyApi.Dtos
{
    public class TaskDto
    {
        public TaskDto(Task task)
        {
            Id = task.Id;
            Title = task.Title;
            Description = task.Description;
            ColumnId = task.ColumnId;
            Order = task.Order;
            Priority = task.Priority;
            ProjectId = task.ProjectId;
            AssignedUserId = task.AssignedUserId;
            CompletedDate = task.CompletedDate;
            Comments = task.Comments?
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto(c))
                .ToArray() ?? Array.Empty<CommentDto>();
        }
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int ColumnId { get; set; } = 0;
        public int Order { get; set; }
        public int Priority { get; set; }
        public int? AssignedUserId { get; set; }
        public int ProjectId { get; set; }
        public string CompletedDate { get; set; } = string.Empty;
        public CommentDto[] Comments { get; set; } = Array.Empty<CommentDto>();
    }

    public class CreateTaskDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int? AssignedUserId { get; set; }
        public int Priority { get; set; }
        public int ColumnId { get; set; } = 0;
    }

    public class UpdateTaskDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? AssignedUserId { get; set; }
        public int? Priority { get; set; }
        public int ColumnId { get; set; } = 0;
        public int? Order { get; set; }
    }
}
