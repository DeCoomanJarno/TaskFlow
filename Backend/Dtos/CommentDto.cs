using System;
using TaskProxyApi.Models;

namespace TaskProxyApi.Dtos
{
    public class CommentDto
    {
        public CommentDto(Comment comment)
        {
            Id = comment.Id;
            Text = comment.Text;
            CreatedAt = comment.CreatedAt;
            User = comment.User == null
                ? null
                : new UserDto
                {
                    Id = comment.User.Id,
                    Name = comment.User.Name,
                    Email = comment.User.Email
                };
        }

        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public UserDto? User { get; set; }
    }
}
