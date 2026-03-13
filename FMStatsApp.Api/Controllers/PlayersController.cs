using FMStatsApp.Api.Repositories;
using FMStatsApp.Models;
using FMStatsApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace FMStatsApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly HtmlParser _htmlParser;
    private readonly IPlayerRepository _playerRepository;

    public PlayersController(HtmlParser htmlParser, IPlayerRepository playerRepository)
    {
        _htmlParser = htmlParser;
        _playerRepository = playerRepository;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<List<Player>>> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (!file.FileName.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be an HTML file." });

        List<Player> players;
        try
        {
            using var stream = file.OpenReadStream();
            players = _htmlParser.ParsedPlayers(stream);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Failed to parse file: {ex.Message}" });
        }

        if (players.Count == 0)
            return UnprocessableEntity(new { message = "No players found. Make sure you upload an FM squad HTML export." });

        await _playerRepository.SaveAsync(players);

        return Ok(players);
    }
}
