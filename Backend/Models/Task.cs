using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskProxyApi.Dtos;

namespace TaskProxyApi.Models
{
    public class Task
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string Description { get; set; }

        public int ColumnId { get; set; } = 0;

        public int Order { get; set; } = 0;
        public int Priority { get; set; } = 0;

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public Project Project { get; set; }

        public int? AssignedUserId { get; set; }

        [ForeignKey(nameof(AssignedUserId))]
        public User AssignedUser { get; set; }
        public string CompletedDate { get; set; } = string.Empty;
        public CommentDto[] Comments { get; set; } = new CommentDto[0];
    }
}
