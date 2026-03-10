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
            return BadRequest("No file provided.");

        if (!file.FileName.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
            return BadRequest("File must be an HTML file.");

        using var stream = file.OpenReadStream();
        var players = _htmlParser.ParsedPlayers(stream);

        await _playerRepository.SaveAsync(players);

        return Ok(players);
    }
}
