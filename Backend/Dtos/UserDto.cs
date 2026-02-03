namespace TaskProxyApi.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
    }

    public class CreateUserDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
    }

    public class UpdateUserDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
    }
}
