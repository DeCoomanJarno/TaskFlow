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

        public ICollection<Task> Tasks { get; set; } = new List<Task>(); 
        public bool IsActive { get; set; } = true;
        public string EndDate { get; set; } = string.Empty;
    }
}
