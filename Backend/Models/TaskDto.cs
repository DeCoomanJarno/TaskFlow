public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string description { get; set; } = string.Empty;
    public string color_id { get; set; } = string.Empty;
    public int project_id { get; set; } = 0;
    public int? category_id { get; set; } = 0;
    public int? column_id { get; set; } = 0;
    public int? owner_id { get; set; } = 0;
    public int is_active { get; set; } = 0;
    public int date_creation { get; set; } = 0;
    public int date_completed { get; set; } = 0;
    public int date_modification { get; set; } = 0;
    public int priority { get; set; } = 0;
    public string[]? Tags { get; set; } = Array.Empty<string>();
}
