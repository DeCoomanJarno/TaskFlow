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
            Comments = task.Comments;
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
        public string[] Comments { get; set; } = new string[0];
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
