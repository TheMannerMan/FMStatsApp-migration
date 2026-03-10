using FMStatsApp.Models;

namespace FMStatsApp.Api.Repositories;

public class InMemoryPlayerRepository : IPlayerRepository
{
    // No-op: API is stateless. Data is returned directly in the upload response.
    // Future: replace with DatabasePlayerRepository to persist uploaded squads.
    public Task SaveAsync(IEnumerable<Player> players) => Task.CompletedTask;

    public Task<IEnumerable<Player>> GetAllAsync() =>
        Task.FromResult(Enumerable.Empty<Player>());
}
