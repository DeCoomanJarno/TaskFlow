namespace TaskProxyApi.Models.project
{
    public class CreateProjectDto
    {
        public string name { get; set; }
        public string? description { get; set; }
        public int? owner_id { get; set; }
        public string? identifier { get; set; }
        public string? start_date { get; set; } // ISO8601
        public string? end_date { get; set; }   // ISO8601
        public int? priority_default { get; set; }
        public int? priority_start { get; set; }
        public int? priority_end { get; set; }
        public string? email { get; set; }
    }
}
