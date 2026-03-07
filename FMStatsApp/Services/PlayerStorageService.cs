using FMStatsApp.Models;
namespace FMStatsApp.Services
{
	public class PlayerStorageService
	{
		public List<Player> Players { get; set; } = [];
		public void AddPlayers(IEnumerable<Player> players)
		{
			Players.AddRange(players);
		}

		public List<Player> GetAllPlayers()
		{
			return Players;
		}

		public void ClearPlayers()
		{
			Players.Clear();
		}
	}
}
