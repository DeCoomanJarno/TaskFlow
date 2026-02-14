using System.ComponentModel.DataAnnotations;
using TaskProxyApi.Models;

namespace TaskProxyApi.Dtos
{
    public class CategoryDto
    {
        public CategoryDto(Category category)
        {
            Id = category.Id;
            Name = category.Name;
            Description = category.Description;
            IsActive = category.IsActive;
            ProjectId = category.ProjectId;
            IconId = category.IconId;
        }

        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int ProjectId { get; set; }
        public string IconId { get; set; } = string.Empty;
    }
}
