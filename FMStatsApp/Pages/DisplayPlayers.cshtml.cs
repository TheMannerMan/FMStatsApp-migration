using FMStatsApp.Extensions;
using FMStatsApp.Models;
using FMStatsApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FMStatsApp.Pages
{
	public class DisplayPlayersModel : PageModel
	{
		public List<string> GoalkeeperRoles { get; set; } = RoleCatalog.AllRoles
			.Where(r => r.GeneralPosition == GeneralPosition.Goalkeeper)
			.Select(r => r.Name)
			.OrderBy(r => r)
			.ToList();

		public List<string> DefenderRoles { get; set; } = RoleCatalog.AllRoles
			.Where(r => r.GeneralPosition == GeneralPosition.Defender)
			.Select(r => r.Name)
			.OrderBy(r => r)
			.ToList();

		public List<string> MidfielderRoles { get; set; } = RoleCatalog.AllRoles
			.Where(r => r.GeneralPosition == GeneralPosition.Midfielder)
			.Select(r => r.Name)
			.OrderBy(r => r)
			.ToList();

		public List<string> ForwardRoles { get; set; } = RoleCatalog.AllRoles
			.Where(r => r.GeneralPosition == GeneralPosition.Forward)
			.Select(r => r.Name)
			.OrderBy(r => r)
			.ToList();

		[BindProperty]
		public List<string> SelectedRolesToList { get; set; } = new List<string>();

		[BindProperty]
		public List<Player> Players { get; set; }

		public string SelectedFormation { get; set; }

		private readonly IHttpContextAccessor _httpContextAccessor;

		public DisplayPlayersModel(IHttpContextAccessor httpContextAccessor)
		{
			_httpContextAccessor = httpContextAccessor;
		}

		public IActionResult OnGet()
		{
			Players = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");

			// Redirect to home if no players are loaded
			if (Players == null || !Players.Any())
			{
				TempData["ErrorMessage"] = "No players found. Please upload a Football Manager HTML file first.";
				return RedirectToPage("/Index");
			}

			// Check if a formation was selected
			if (TempData["SelectedFormation"] != null)
			{
				SelectedFormation = TempData["SelectedFormation"].ToString();
				TempData["FormationMessage"] = $"Formation selected: {SelectedFormation}";
			}

			return Page();
		}

		public IActionResult OnPost()
		{
			Players = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");

			// Redirect to home if no players are loaded
			if (Players == null || !Players.Any())
			{
				TempData["ErrorMessage"] = "No players found. Please upload a Football Manager HTML file first.";
				return RedirectToPage("/Index");
			}

			return Page();
		}
	}
}
