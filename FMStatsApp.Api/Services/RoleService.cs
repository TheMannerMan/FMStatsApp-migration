using FMStatsApp.Models;

namespace FMStatsApp.Services
{
	public class RoleService
	{
		public static List<RoleDefinition> GetRolesForPosition(Position position)
		{
			return RoleCatalog.AllRoles
				.Where(role => role.Positions.Contains(position))
				.ToList();
		}
	}
}
