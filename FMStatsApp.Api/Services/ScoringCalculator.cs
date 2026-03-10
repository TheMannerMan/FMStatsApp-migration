using FMStatsApp.Models;
using System.Runtime.CompilerServices;

namespace FMStatsApp.Services
{
	public class ScoringCalculator
	{

		public List<Role> AddRoleScoring(Player player)
		{
			
			List<Role> roles = [];

			foreach (var roleDef in RoleCatalog.AllRoles)
			{
				int totalscore = 0;
				int weightSum = roleDef.AttributeWeights.Values.Sum();

				foreach (var (attribute, weight) in roleDef.AttributeWeights)
				{
					var propertyInfo = typeof(Player).GetProperty(attribute);
					if (propertyInfo == null)
					{
						// Hantera felet, t.ex. logga ett meddelande eller kasta ett undantag.
						throw new Exception($"Property '{attribute}' saknas i Player-klassen.");
					}

					// Hämta värdet och multiplicera med vikten.
					int attributeValue = (int)propertyInfo.GetValue(player);
					totalscore += attributeValue * weight;
				}

				float roleScore = (float)totalscore / weightSum; 
				var role = new Role(roleDef.Name, roleDef.ShortName, roleScore);
				roles.Add(role);
			}
			return roles;
		}
	}
}

