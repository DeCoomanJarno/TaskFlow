using System.ComponentModel.DataAnnotations;
using TaskProxyApi.Models;

namespace TaskProxyApi.Dtos
{
    public class ProjectDto
    {
        public ProjectDto(Project project) 
        {
            Id = project.Id;
            Name = project.Name;
            Description = project.Description;
            IsActive = project.IsActive;
            EndDate = project.EndDate;
        }
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public string Description { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public string EndDate { get; set; } = string.Empty;
    }
    public class CreateProjectDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class UpdateProjectDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
