using System.ComponentModel.DataAnnotations;

namespace TaskProxyApi.Models
{
    public class Project
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public string Description { get; set; } = string.Empty;

        public int? ParentProjectId { get; set; }

        public Project? ParentProject { get; set; }

        public ICollection<Project> Categories { get; set; } = new List<Project>();

        public ICollection<Task> Tasks { get; set; } = new List<Task>(); 
        public bool IsActive { get; set; } = true;
        public string EndDate { get; set; } = string.Empty;
    }
}
