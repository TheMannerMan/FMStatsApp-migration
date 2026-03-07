using HtmlAgilityPack;
using System.Text.Json.Serialization;

namespace FMStatsApp.Models
{
	public record Role
	{
		public string RoleName { get; init; }
		public string ShortRoleName { get; init; }
		public Position Position { get; init; }
		public float RoleScore { get; init; }

		[JsonConstructor]
		public Role(string roleName, string shortRoleName, float roleScore)
		{
			RoleName = roleName;
			ShortRoleName = shortRoleName;
			RoleScore = roleScore;
		}
		public Role() { }
	}
}
