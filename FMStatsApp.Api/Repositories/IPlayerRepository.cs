using FMStatsApp.Models;

namespace FMStatsApp.Api.Repositories;

public interface IPlayerRepository
{
    Task SaveAsync(IEnumerable<Player> players);
    Task<IEnumerable<Player>> GetAllAsync();
}
