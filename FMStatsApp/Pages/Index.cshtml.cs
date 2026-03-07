using FMStatsApp.Extensions;
using FMStatsApp.Models;
using FMStatsApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FMStatsApp.Pages
{
    public class IndexModel : PageModel
    {
        private readonly HtmlParser _htmlParser;
        private readonly IHttpContextAccessor _httpContextAccessor;

        [BindProperty]
        public IFormFile UploadedFile { get; set; }

        [TempData]
        public string? ErrorMessage { get; set; }

        [TempData]
        public string? SuccessMessage { get; set; }

        public bool HasExistingPlayers { get; set; }
        public int ExistingPlayersCount { get; set; }

        public IndexModel(HtmlParser htmlParser, IHttpContextAccessor httpContextAccessor)
        {
            _htmlParser = htmlParser;
            _httpContextAccessor = httpContextAccessor;
        }

        public IActionResult OnGet()
        {
            // Check if players are already loaded in session
            var existingPlayers = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");
            HasExistingPlayers = existingPlayers != null && existingPlayers.Any();
            ExistingPlayersCount = existingPlayers?.Count ?? 0;

            return Page();
        }

        public IActionResult OnPost()
        {
            if (UploadedFile == null || UploadedFile.Length == 0)
            {
                ModelState.AddModelError("UploadedFile", "Please select a file to upload.");
                ErrorMessage = "Please select a file to upload.";
                
                // Re-check existing players for display
                var existingPlayers = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");
                HasExistingPlayers = existingPlayers != null && existingPlayers.Any();
                ExistingPlayersCount = existingPlayers?.Count ?? 0;
                
                return Page();
            }

            // Validate file type
            var allowedExtensions = new[] { ".html", ".htm" };
            var fileExtension = Path.GetExtension(UploadedFile.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                ModelState.AddModelError("UploadedFile", "Please upload an HTML file (.html or .htm).");
                ErrorMessage = "Please upload an HTML file (.html or .htm).";
                
                // Re-check existing players for display
                var existingPlayers = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");
                HasExistingPlayers = existingPlayers != null && existingPlayers.Any();
                ExistingPlayersCount = existingPlayers?.Count ?? 0;
                
                return Page();
            }

            try
            {
                using var stream = UploadedFile.OpenReadStream();
                var parsedPlayers = _htmlParser.ParsedPlayers(stream);

                if (parsedPlayers == null || !parsedPlayers.Any())
                {
                    ErrorMessage = "No player data could be parsed from the uploaded file. Please ensure it's a valid Football Manager export.";
                    
                    // Re-check existing players for display
                    var existingPlayers = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");
                    HasExistingPlayers = existingPlayers != null && existingPlayers.Any();
                    ExistingPlayersCount = existingPlayers?.Count ?? 0;
                    
                    return Page();
                }

                _httpContextAccessor.HttpContext.Session.SetObjectAsJson("Players", parsedPlayers);
                SuccessMessage = $"Successfully parsed {parsedPlayers.Count} players from the uploaded file.";

                return RedirectToPage("/DisplayPlayers");
            }
            catch (Exception ex)
            {
                ErrorMessage = "An error occurred while processing the file. Please ensure it's a valid Football Manager HTML export.";
                
                // Re-check existing players for display
                var existingPlayers = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");
                HasExistingPlayers = existingPlayers != null && existingPlayers.Any();
                ExistingPlayersCount = existingPlayers?.Count ?? 0;
                
                // Log the exception in a real application
                return Page();
            }
        }
    }
}