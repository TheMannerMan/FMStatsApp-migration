using FMStatsApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace FMStatsApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    [HttpGet]
    public ActionResult<Dictionary<string, List<object>>> GetAll()
    {
        var grouped = RoleCatalog.AllRoles
            .GroupBy(r => r.GeneralPosition.ToString())
            .ToDictionary(
                g => g.Key,
                g => g.Select(r => new
                {
                    roleName = r.Name,
                    shortRoleName = r.ShortName,
                    positions = r.Positions.Select(p => p.ToString()).ToList()
                }).Cast<object>().ToList()
            );

        return Ok(grouped);
    }
}
