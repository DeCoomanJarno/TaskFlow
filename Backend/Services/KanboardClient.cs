using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace TaskManagerApi.Services
{
    public class KanboardClient
    {
        private readonly HttpClient _http;

        public KanboardClient(IConfiguration config)
        {
            _http = new HttpClient();

            var username = config["Kanboard:ApiUsername"];
            var token = config["Kanboard:ApiToken"];

            var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{username}:{token}"));
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

            _http.BaseAddress = new Uri(config["Kanboard:Url"]);
        }

        public async Task<JsonElement> CallAsync(string method, object? parameters = null)
        {
            var payload = new
            {
                jsonrpc = "2.0",
                method,
                id = 1,
                @params = parameters ?? new { }
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _http.PostAsync("", content);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                throw new Exception($"Kanboard error {response.StatusCode}: {body}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(responseJson);

            return doc.RootElement.GetProperty("result");
        }
    }
}
