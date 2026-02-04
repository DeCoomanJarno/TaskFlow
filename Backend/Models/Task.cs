using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        public int? CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public Category Category { get; set; }

        public int? AssignedUserId { get; set; }

        [ForeignKey(nameof(AssignedUserId))]
        public User AssignedUser { get; set; }
        public string CompletedDate { get; set; } = string.Empty;
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
