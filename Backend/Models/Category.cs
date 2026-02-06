using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskProxyApi.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        [Required]
        public int ProjectId { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public Project Project { get; set; }

        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}
