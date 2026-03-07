using FMStatsApp.Extensions;
using FMStatsApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Runtime.CompilerServices;

namespace FMStatsApp.Pages
{
    public class FormationSelecterModel : PageModel
    {
		private readonly IHttpContextAccessor _httpContextAccessor;
		public SelectList AvailableFormations { get; set; }
		public Formation SelectedFormation { get; set; } = null;

		[BindProperty]
		public string SelectedFormationName { get; set; }

		public FormationSelecterModel(IHttpContextAccessor httpContextAccessor)
		{
			_httpContextAccessor = httpContextAccessor;
		}

		public List<Position> AvailablePositions { get; set; } = Enum.GetValues<Position>().ToList();

		private SelectList GetFormations()
		{
			List<Formation> formations = FormationCatalog.AllFormations;
			return new SelectList(formations, nameof(Formation.Name), nameof(Formation.Name));
		}

		public IActionResult OnGet()
        {
			// Check if players are loaded
			var players = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");
			if (players == null || !players.Any())
			{
				TempData["ErrorMessage"] = "No players found. Please upload a Football Manager HTML file first.";
				return RedirectToPage("/Index");
			}

			AvailableFormations = GetFormations();
			return Page();
		}

		public IActionResult OnPost()
		{
			// Check if players are loaded
			var players = _httpContextAccessor.HttpContext.Session.GetObjectFromJson<List<Player>>("Players");
			if (players == null || !players.Any())
			{
				TempData["ErrorMessage"] = "No players found. Please upload a Football Manager HTML file first.";
				return RedirectToPage("/Index");
			}

			// Since we're removing RoleSelecter, we need to change this redirect
			// For now, redirect back to DisplayPlayers with the formation info
			TempData["SelectedFormation"] = SelectedFormationName;
			return RedirectToPage("/DisplayPlayers");
		}
	}
}
